(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();
    const isSixDigit = (v) => /^\d{6}$/.test(okText(v));
    const safeInt = (v, def = 1) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
    }

    function parsePagerInfo(doc) {
      // Example: "Displaying page 1 of 26, items 1 to 10 of 252."
      const pagerRight = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const text = pagerRight.replace(/\s+/g, " ").trim();

      const m = text.match(/Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i);
      if (!m) {
        return {
          currentPage: null,
          totalPages: null,
          fromItem: null,
          toItem: null,
          totalItems: null,
          raw: text
        };
      }

      return {
        currentPage: safeInt(m[1], 1),
        totalPages: safeInt(m[2], 1),
        fromItem: safeInt(m[3], 1),
        toItem: safeInt(m[4], 10),
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
        if (code || name) results.push({ countryCode: code, countryName: name });
      }
      return results;
    }

    function filterMatches(items, { countryCode, countryName, matchType }) {
      const mt = (matchType || "partial").toLowerCase(); // partial | exact
      const hasCode = !isEmpty(countryCode);
      const hasName = !isEmpty(countryName);

      if (!hasCode && !hasName) return items; // showAll case

      const codeNeedle = toLower(countryCode);
      const nameNeedle = toLower(countryName);

      return items.filter((it) => {
        const codeHay = toLower(it.countryCode);
        const nameHay = toLower(it.countryName);

        // If both provided, apply both filters (AND)
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
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Country.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Country. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args normalization
     * ------------------------------------------------- */
    const mode = (args?.mode || "search").toLowerCase(); // search | showall
    const matchType = (args?.matchType || "partial").toLowerCase(); // partial | exact
    const includeDetails = !!args?.includeDetails; // keep for future; not used for bulk
    const pageSize = 10; // keep it fixed (matches UI pager behavior)
    const page = safeInt(args?.page, 1);

    const countryCode = okText(args?.countryCode);
    const countryName = okText(args?.countryName);

    // In "search" mode, user must provide countryCode or countryName.
    // In "showAll" mode, both can be empty (return all countries page-by-page).
    if (mode === "search" && isEmpty(countryCode) && isEmpty(countryName)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide either countryCode or countryName (or use mode='showAll' to list all countries)."
      };
    }

    /* -------------------------------------------------
     * 3) Build URL + Headers
     * ------------------------------------------------- */
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Country.aspx");
    const url = updateurl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Country.aspx`;

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 4) Initial hidden fields (start state)
     * ------------------------------------------------- */
    // Always start from fresh state for this call
    const details = await BeaconBar.executeFunction("getApiList")("Country");

    /* -------------------------------------------------
     * 5) Decide criteria + search value (even in showAll, keep a stable criteria)
     * ------------------------------------------------- */
    // UI supports: COU_CODE / COU_NAME
    let searchCriteria = "COU_CODE";
    let searchValue = "";

    if (!isEmpty(countryCode)) {
      searchCriteria = "COU_CODE";
      searchValue = countryCode;
    } else if (!isEmpty(countryName)) {
      searchCriteria = "COU_NAME";
      searchValue = countryName;
    } else {
      // showAll with no filter: keep criteria COU_CODE, blank content
      searchCriteria = "COU_CODE";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 6) Step A: Load the grid (Search or Show All) on page 1
     * ------------------------------------------------- */
    const firstFormData = new FormData();
    firstFormData.append("scrollLeft", "0");
    firstFormData.append("scrollTop", "0");
    firstFormData.append("__EVENTTARGET", "");
    firstFormData.append("__EVENTARGUMENT", "");
    firstFormData.append("__VIEWSTATE", details.viewState);
    firstFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    firstFormData.append("__VIEWSTATEENCRYPTED", "");
    firstFormData.append("__EVENTVALIDATION", details.eventValidation);

    firstFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    firstFormData.append("ctl00$hdnQuickmenu", "1");

    firstFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    firstFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);

    // pager
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    firstFormData.append("ctl00_body_grdsummary_ClientState", "");

    if (mode === "showall") {
      // Matches your network tab: ctl00$body$ContentSearch$butAll = Show All
      firstFormData.append("ctl00$body$ContentSearch$butAll", "Show All");
    } else {
      // Normal search
      firstFormData.append("ctl00$body$ContentSearch$butSearch", "Search");
    }

    const firstResp = await fetch(url, { method: "POST", headers, body: firstFormData });
    const firstHtml = await firstResp.text();
    const firstDoc = parser.parseFromString(firstHtml, "text/html");

    let viewState = getHidden(firstDoc, "#__VIEWSTATE");
    let eventValidation = getHidden(firstDoc, "#__EVENTVALIDATION");
    let viewStateGen = getHidden(firstDoc, "#__VIEWSTATEGENERATOR");

    if (!viewState || !eventValidation || !viewStateGen) {
      return {
        status: "ERROR",
        message: "Failed to load Country grid state (missing ASP.NET hidden fields)."
      };
    }

    /* -------------------------------------------------
     * 7) Step B: If user requested a page > 1, jump using GoToPageLinkButton
     *    (works for any page number and avoids relying on ctl04/ctl05 mapping)
     * ------------------------------------------------- */
    let workingDoc = firstDoc;

    if (page > 1) {
      const gotoFormData = new FormData();
      gotoFormData.append("scrollLeft", "0");
      gotoFormData.append("scrollTop", "0");

      // Trigger the Go button postback
      gotoFormData.append("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      gotoFormData.append("__EVENTARGUMENT", "");

      gotoFormData.append("__VIEWSTATE", viewState);
      gotoFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
      gotoFormData.append("__VIEWSTATEENCRYPTED", "");
      gotoFormData.append("__EVENTVALIDATION", eventValidation);

      gotoFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      gotoFormData.append("ctl00$hdnQuickmenu", "1");

      // Keep current search/showAll filter context
      gotoFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      gotoFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // This is the value field the server reads
      gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(page));
      gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      gotoFormData.append("ctl00_body_grdsummary_ClientState", "");

      const gotoResp = await fetch(url, { method: "POST", headers, body: gotoFormData });
      const gotoHtml = await gotoResp.text();
      const gotoDoc = parser.parseFromString(gotoHtml, "text/html");

      // Update state again (important for “more”)
      viewState = getHidden(gotoDoc, "#__VIEWSTATE");
      eventValidation = getHidden(gotoDoc, "#__EVENTVALIDATION");
      viewStateGen = getHidden(gotoDoc, "#__VIEWSTATEGENERATOR");

      workingDoc = gotoDoc;
    }

    /* -------------------------------------------------
     * 8) Extract + (optionally) filter matches
     * ------------------------------------------------- */
    const pager = parsePagerInfo(workingDoc);
    const pageItems = extractGridRows(workingDoc);

    // Apply exact/partial match in transformer-side filtering
    // (important because server search sometimes behaves like “starts with / contains” depending on screen)
    const matched = filterMatches(pageItems, { countryCode, countryName, matchType });

    const hasMore = pager.totalPages ? (pager.currentPage < pager.totalPages) : (pageItems.length === pageSize);
    const nextPage = hasMore ? (pager.currentPage ? pager.currentPage + 1 : page + 1) : null;

    /* -------------------------------------------------
     * 9) Return (no bulk includeDetails — too heavy for 252 rows)
     * ------------------------------------------------- */
    return {
      status: "SUCCESS",
      mode: mode,
      matchType: matchType,
      criteria: searchCriteria,
      searchValue: searchValue,
      page: pager.currentPage ?? page,
      pageSize: pageSize,
      totalPages: pager.totalPages,
      totalItems: pager.totalItems,
      countReturned: matched.length,
      hasMore: !!nextPage,
      nextPage: nextPage,
      message: nextPage
        ? `Returned ${matched.length} record(s) from page ${(pager.currentPage ?? page)}. Reply with page=${nextPage} to get the next ${pageSize}.`
        : `Returned ${matched.length} record(s). No more pages.`,
      countries: matched,
      // Cursor allows the caller to pass state forward if needed (optional)
      cursor: {
        __VIEWSTATE: viewState,
        __VIEWSTATEGENERATOR: viewStateGen,
        __EVENTVALIDATION: eventValidation,
        criteria: searchCriteria,
        searchValue: searchValue,
        mode: mode
      },
      note: includeDetails
        ? "includeDetails is currently ignored for bulk results. If you need details, search for a specific country and request details for that one record."
        : null
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
});
