(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers (STRING ARGS ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();
    const safeInt = (v, def = 1) => {
      const t = okText(v);
      const n = Number(t);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    const parseJsonSafe = (s) => {
      try {
        const t = okText(s);
        if (!t) return null;
        return JSON.parse(t);
      } catch {
        return null;
      }
    };

    const toJsonString = (obj) => {
      try { return JSON.stringify(obj || {}); } catch { return ""; }
    };

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
    }

    function parsePagerInfo(doc) {
      // "Displaying page 2 of 34, items 7 to 12 of 202."
      const pagerRight = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const text = pagerRight.replace(/\s+/g, " ").trim();
      const m = text.match(/Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i);

      if (!m) return { currentPage: null, totalPages: null, totalItems: null, raw: text };

      return {
        currentPage: safeInt(m[1], 1),
        totalPages: safeInt(m[2], 1),
        totalItems: safeInt(m[5], 0),
        raw: text
      };
    }

    function extractGridRows(doc) {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const results = [];
      for (const r of rows) {
        const tds = r.querySelectorAll("td");
        const code = tds[0]?.textContent?.trim() || "";
        const name = tds[1]?.textContent?.trim() || "";
        if (code || name) results.push({ code, nationalityName: name });
      }
      return results;
    }

    function filterMatches(items, { nationalityCode, nationalityName, matchType }) {
      const mt = (matchType || "partial").toLowerCase(); // partial | exact
      const hasCode = !isEmpty(nationalityCode);
      const hasName = !isEmpty(nationalityName);
      if (!hasCode && !hasName) return items; // showAll case

      const codeNeedle = toLower(nationalityCode);
      const nameNeedle = toLower(nationalityName);

      return items.filter((it) => {
        const codeHay = toLower(it.code);
        const nameHay = toLower(it.nationalityName);

        if (hasCode && hasName) {
          const codeOk = mt === "exact" ? codeHay === codeNeedle : codeHay.includes(codeNeedle);
          const nameOk = mt === "exact" ? nameHay === nameNeedle : nameHay.includes(nameNeedle);
          return codeOk && nameOk;
        }

        if (hasCode) return mt === "exact" ? codeHay === codeNeedle : codeHay.includes(codeNeedle);
        return mt === "exact" ? nameHay === nameNeedle : nameHay.includes(nameNeedle);
      });
    }

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Nationality.aspx")) {
      return { status: "NO_ACCESS", message: "You do not have access to Nationality screen. Please contact HR Admin." };
    }

    /* -------------------------------------------------
     * 2) Args (ALL STRINGS)
     * ------------------------------------------------- */
    const mode = toLower(args?.mode || "search");            // "search" | "showall"
    const matchType = toLower(args?.matchType || "partial"); // "partial" | "exact"

    const nationalityCode = okText(args?.nationalityCode);
    const nationalityName = okText(args?.nationalityName);

    // IMPORTANT: use UI page size (you said you set it to 4/6/10 etc.)
    const pageSize = safeInt(args?.pageSize, 10);            // default 10 if not provided
    const page = safeInt(args?.page, 1);                     // "get from page 19" => page=19

    // Cursor is a STRINGIFIED JSON (optional)
    const cursorIn = parseJsonSafe(args?.cursor);

    // Validation
    if (mode === "search" && isEmpty(nationalityCode) && isEmpty(nationalityName)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide nationalityCode or nationalityName (or use mode='showall' to list all nationalities)."
      };
    }

    /* -------------------------------------------------
     * 3) Build URL + Headers
     * ------------------------------------------------- */
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Nationality.aspx");
    const url = updateurl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Nationality.aspx`;

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 4) Establish grid state (FIRST CALL vs NEXT CALL)
     *    - If cursor is provided, reuse it (so "yes" can truly go next)
     *    - Else start fresh via getApiList("Nationality")
     * ------------------------------------------------- */
    let viewState = okText(cursorIn?.__VIEWSTATE);
    let viewStateGen = okText(cursorIn?.__VIEWSTATEGENERATOR);
    let eventValidation = okText(cursorIn?.__EVENTVALIDATION);
    let criteria = okText(cursorIn?.criteria);
    let searchValue = okText(cursorIn?.searchValue);
    let effectiveMode = okText(cursorIn?.mode) || mode;

    // Decide criteria/searchValue when starting fresh
    if (!viewState || !viewStateGen || !eventValidation) {
      const details = await BeaconBar.executeFunction("getApiList")("Nationality");
      viewState = details.viewState;
      viewStateGen = details.viewStateGen;
      eventValidation = details.eventValidation;

      // UI supports NAT_CODE / NAT_NAME
      if (!isEmpty(nationalityCode)) {
        criteria = "NAT_CODE";
        searchValue = nationalityCode;
      } else if (!isEmpty(nationalityName)) {
        criteria = "NAT_NAME";
        searchValue = nationalityName;
      } else {
        criteria = "NAT_CODE";
        searchValue = "";
      }

      effectiveMode = mode;
    }

    /* -------------------------------------------------
     * 5) Step A: Load grid (Search or Show All) on page 1
     *    - This sets the SAME server-side state as clicking Search / Show All in UI
     * ------------------------------------------------- */
    const firstFormData = new FormData();
    firstFormData.append("scrollLeft", "0");
    firstFormData.append("scrollTop", "0");
    firstFormData.append("__EVENTTARGET", "");
    firstFormData.append("__EVENTARGUMENT", "");
    firstFormData.append("__VIEWSTATE", viewState);
    firstFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
    firstFormData.append("__VIEWSTATEENCRYPTED", "");
    firstFormData.append("__EVENTVALIDATION", eventValidation);

    firstFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    firstFormData.append("ctl00$hdnQuickmenu", "1");
    firstFormData.append("ctl00$body$ContentSearch$cboCriteria", criteria);
    firstFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);

    // pager controls (match your network payload)
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    firstFormData.append("ctl00_body_grdsummary_ClientState", "");

    if (effectiveMode === "showall") {
      firstFormData.append("ctl00$body$ContentSearch$butAll", "Show All");
    } else {
      firstFormData.append("ctl00$body$ContentSearch$butSearch", "Search");
    }

    const firstResp = await fetch(url, { method: "POST", headers, body: firstFormData });
    const firstHtml = await firstResp.text();
    const firstDoc = parser.parseFromString(firstHtml, "text/html");

    // Refresh state after server responds (critical for paging)
    viewState = getHidden(firstDoc, "#__VIEWSTATE");
    viewStateGen = getHidden(firstDoc, "#__VIEWSTATEGENERATOR");
    eventValidation = getHidden(firstDoc, "#__EVENTVALIDATION");

    if (!viewState || !viewStateGen || !eventValidation) {
      return { status: "ERROR", message: "Failed to load Nationality grid state (missing ASP.NET hidden fields)." };
    }

    /* -------------------------------------------------
     * 6) Step B: Jump to requested page using GoToPageLinkButton
     *    - Works for ANY page number (including 19, 34, etc.)
     * ------------------------------------------------- */
    let workingDoc = firstDoc;

    if (page > 1) {
      const gotoFormData = new FormData();
      gotoFormData.append("scrollLeft", "0");
      gotoFormData.append("scrollTop", "0");

      // Trigger Go button
      gotoFormData.append("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      gotoFormData.append("__EVENTARGUMENT", "");

      gotoFormData.append("__VIEWSTATE", viewState);
      gotoFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
      gotoFormData.append("__VIEWSTATEENCRYPTED", "");
      gotoFormData.append("__EVENTVALIDATION", eventValidation);

      gotoFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      gotoFormData.append("ctl00$hdnQuickmenu", "1");

      // keep context
      gotoFormData.append("ctl00$body$ContentSearch$cboCriteria", criteria);
      gotoFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // server reads this field value
      gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(page));
      gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      gotoFormData.append("ctl00_body_grdsummary_ClientState", "");

      const gotoResp = await fetch(url, { method: "POST", headers, body: gotoFormData });
      const gotoHtml = await gotoResp.text();
      const gotoDoc = parser.parseFromString(gotoHtml, "text/html");

      viewState = getHidden(gotoDoc, "#__VIEWSTATE");
      viewStateGen = getHidden(gotoDoc, "#__VIEWSTATEGENERATOR");
      eventValidation = getHidden(gotoDoc, "#__EVENTVALIDATION");

      workingDoc = gotoDoc;
    }

    /* -------------------------------------------------
     * 7) Extract rows + filter (matchType applies client-side)
     * ------------------------------------------------- */
    const pager = parsePagerInfo(workingDoc);
    const pageItems = extractGridRows(workingDoc);

    const matched = filterMatches(pageItems, { nationalityCode, nationalityName, matchType });

    if (!pageItems || pageItems.length === 0) {
      return {
        status: "NOT_FOUND",
        message: effectiveMode === "showall"
          ? "No Nationalities found."
          : `No Nationalities found matching "${searchValue}"`,
        page: pager.currentPage ?? page,
        pageSize: pageSize
      };
    }

    // Next page availability based on pager text
    const hasMore = pager.totalPages ? ((pager.currentPage ?? page) < pager.totalPages) : (pageItems.length === pageSize);
    const nextPage = hasMore ? ((pager.currentPage ?? page) + 1) : null;

    /* -------------------------------------------------
     * 8) Return (cursor as STRING)
     * ------------------------------------------------- */
    return {
      status: "SUCCESS",
      mode: effectiveMode,
      matchType: matchType,
      criteria: criteria,
      searchValue: searchValue,
      page: pager.currentPage ?? page,
      pageSize: pageSize,
      totalPages: pager.totalPages,
      totalItems: pager.totalItems,
      countReturned: matched.length,
      hasMore: !!nextPage,
      nextPage: nextPage ? String(nextPage) : "",
      message: nextPage
        ? `Here are ${matched.length} nationalities from page ${(pager.currentPage ?? page)}. There are more nationalities available. Would you like to see the next page?`
        : `Here are ${matched.length} nationalities from page ${(pager.currentPage ?? page)}. No more pages.`,
      nationalities: matched,
      cursor: toJsonString({
        __VIEWSTATE: viewState,
        __VIEWSTATEGENERATOR: viewStateGen,
        __EVENTVALIDATION: eventValidation,
        criteria: criteria,
        searchValue: searchValue,
        mode: effectiveMode,
        pageSize: String(pageSize)
      })
    };
  } catch (err) {
    return { status: "ERROR", message: err?.message || "Unexpected error", error: err?.toString?.() || String(err) };
  }
});
