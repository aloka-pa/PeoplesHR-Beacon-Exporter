(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();

    const safeInt = (v, def = 1) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    const isSixDigit = (v) => /^\d{6}$/.test(okText(v));

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
    }

    function parsePagerInfo(doc) {
      // Example: "Displaying page 1 of 2, items 1 to 10 of 17."
      const pagerRight = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const text = pagerRight.replace(/\s+/g, " ").trim();

      const m = text.match(
        /Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i
      );

      if (!m) {
        return {
          currentPage: null,
          totalPages: null,
          totalItems: null,
          raw: text
        };
      }

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
        const districtCode = tds[0]?.textContent?.trim() || "";
        const districtName = tds[1]?.textContent?.trim() || "";
        const provinceName = tds[2]?.textContent?.trim() || "";

        if (districtCode || districtName || provinceName) {
          results.push({ districtCode, districtName, provinceName });
        }
      }

      return results;
    }

    function phraseMeansShowAll(v) {
      const t = toLower(v);
      if (!t) return false;
      // covers: show all / list / available / existing / all / view all / get all etc.
      return (
        t.includes("show all") ||
        t.includes("view all") ||
        t.includes("get all") ||
        t.includes("return all") ||
        t.includes("all districts") ||
        t.includes("available") ||
        t.includes("existing") ||
        t.includes("list") ||
        t === "all"
      );
    }

    function filterMatches(items, { districtCode, districtName, provinceName }) {
      const hasCode = !isEmpty(districtCode);
      const hasDist = !isEmpty(districtName);
      const hasProv = !isEmpty(provinceName);

      if (!hasCode && !hasDist && !hasProv) return items;

      const codeNeedle = toLower(districtCode);
      const distNeedle = toLower(districtName);
      const provNeedle = toLower(provinceName);

      return items.filter((it) => {
        const codeHay = toLower(it.districtCode);
        const distHay = toLower(it.districtName);
        const provHay = toLower(it.provinceName);

        // Code: EXACT match requirement
        if (hasCode) {
          return codeHay === codeNeedle;
        }

        // Name searches: PARTIAL match requirement
        // If both districtName and provinceName provided, enforce AND
        if (hasDist && hasProv) {
          return distHay.includes(distNeedle) && provHay.includes(provNeedle);
        }
        if (hasDist) return distHay.includes(distNeedle);
        return provHay.includes(provNeedle);
      });
    }

    async function postAndParse(url, headers, formData) {
      const resp = await fetch(url, { method: "POST", headers, body: formData, redirect: "follow" });
      const html = await resp.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html");
    }

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/District.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to District screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args normalization
     * ------------------------------------------------- */
    const districtCode = okText(args?.districtCode);
    const districtName = okText(args?.districtName);
    const provinceName = okText(args?.provinceName);

    const returnAll = okText(args?.returnAll);
    const showAllMode = phraseMeansShowAll(returnAll);

    const pageSize = safeInt(args?.pageSize, 10); // keep default 10 (UI)
    const page = safeInt(args?.page, 1);
    const maxPages = safeInt(args?.maxPages, 50);

    // Validation:
    // - Search mode: must provide at least one search term
    // - ShowAll mode: search terms optional (ignored)
    if (!showAllMode && isEmpty(districtCode) && isEmpty(districtName) && isEmpty(provinceName)) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide districtCode (exact) OR districtName/provinceName (partial). " +
          "Or pass returnAll='show all' (or similar) to list all districts."
      };
    }

    // Code rule: encourage 6 digits but don’t hard-fail (some clients may have different formats)
    if (!isEmpty(districtCode) && !isSixDigit(districtCode)) {
      // keep going, but you can tighten later if needed
    }

    /* -------------------------------------------------
     * 3) Build URL + Headers
     * ------------------------------------------------- */
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")("EIM/District.aspx");
    const url = updateurl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/District.aspx`;

    const headers = new Headers();
    headers.append(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    );
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    /* -------------------------------------------------
     * 4) Initial hidden fields
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("District");

    /* -------------------------------------------------
     * 5) Decide criteria + search value
     *    (UI options you gave)
     *    D.DISTRICT_CODE | D.DISTRICT_NAME | P.PROVINCE_NAME | D.DISTRICT_REF_CODE
     * ------------------------------------------------- */
    let searchCriteria = "D.DISTRICT_CODE";
    let searchValue = "";

    if (!isEmpty(districtCode)) {
      searchCriteria = "D.DISTRICT_CODE";
      searchValue = districtCode;
    } else if (!isEmpty(districtName)) {
      searchCriteria = "D.DISTRICT_NAME";
      searchValue = districtName;
    } else if (!isEmpty(provinceName)) {
      searchCriteria = "P.PROVINCE_NAME";
      searchValue = provinceName;
    } else {
      // showAll with no filter
      searchCriteria = "D.DISTRICT_CODE";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 6) Step A: Load page 1 (Search or Show All)
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

    // pager defaults
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    firstFormData.append("ctl00_body_grdsummary_ClientState", "");

    if (showAllMode) {
      // Matches your network example
      firstFormData.append("ctl00$body$ContentSearch$butAll", "Show All");
    } else {
      firstFormData.append("ctl00$body$ContentSearch$butSearch", "Search");
    }

    let workingDoc = await postAndParse(url, headers, firstFormData);

    let viewState = getHidden(workingDoc, "#__VIEWSTATE");
    let eventValidation = getHidden(workingDoc, "#__EVENTVALIDATION");
    let viewStateGen = getHidden(workingDoc, "#__VIEWSTATEGENERATOR");

    if (!viewState || !eventValidation || !viewStateGen) {
      return {
        status: "ERROR",
        message: "Failed to load District grid state (missing ASP.NET hidden fields)."
      };
    }

    /* -------------------------------------------------
     * 7) If ShowAll + page > 1: GoToPageLinkButton jump
     * ------------------------------------------------- */
    if (showAllMode && page > 1) {
      const gotoFormData = new FormData();
      gotoFormData.append("scrollLeft", "0");
      gotoFormData.append("scrollTop", "0");

      gotoFormData.append("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      gotoFormData.append("__EVENTARGUMENT", "");

      gotoFormData.append("__VIEWSTATE", viewState);
      gotoFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
      gotoFormData.append("__VIEWSTATEENCRYPTED", "");
      gotoFormData.append("__EVENTVALIDATION", eventValidation);

      gotoFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      gotoFormData.append("ctl00$hdnQuickmenu", "1");

      // keep context
      gotoFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      gotoFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(page));
      gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      gotoFormData.append("ctl00_body_grdsummary_ClientState", "");

      workingDoc = await postAndParse(url, headers, gotoFormData);

      // refresh hidden
      viewState = getHidden(workingDoc, "#__VIEWSTATE");
      eventValidation = getHidden(workingDoc, "#__EVENTVALIDATION");
      viewStateGen = getHidden(workingDoc, "#__VIEWSTATEGENERATOR");
    }

    /* -------------------------------------------------
     * 8) Extract first page rows
     * ------------------------------------------------- */
    const pager = parsePagerInfo(workingDoc);
    const pageItems = extractGridRows(workingDoc);
    const firstMatched = filterMatches(pageItems, { districtCode, districtName, provinceName });

    /* -------------------------------------------------
     * 9) SEARCH MODE: auto-collect ALL matching rows across all pages
     *    SHOWALL MODE: return only requested page + pagination
     * ------------------------------------------------- */
    if (!showAllMode) {
      const allMatches = [...firstMatched];

      const totalPages = pager.totalPages || 1;
      const loopPages = Math.min(totalPages, maxPages);

      // If exact code search and we already found it, no need to crawl pages
      const isExactCodeSearch = !isEmpty(districtCode);
      if (!isExactCodeSearch && loopPages > 1) {
        for (let p = 2; p <= loopPages; p++) {
          const gotoFormData = new FormData();
          gotoFormData.append("scrollLeft", "0");
          gotoFormData.append("scrollTop", "0");

          gotoFormData.append("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
          gotoFormData.append("__EVENTARGUMENT", "");

          gotoFormData.append("__VIEWSTATE", viewState);
          gotoFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
          gotoFormData.append("__VIEWSTATEENCRYPTED", "");
          gotoFormData.append("__EVENTVALIDATION", eventValidation);

          gotoFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
          gotoFormData.append("ctl00$hdnQuickmenu", "1");

          gotoFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
          gotoFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);

          gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(p));
          gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

          gotoFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
          gotoFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
          gotoFormData.append("ctl00_body_grdsummary_ClientState", "");

          const docP = await postAndParse(url, headers, gotoFormData);

          // update hidden fields each time (ASP.NET state changes)
          viewState = getHidden(docP, "#__VIEWSTATE");
          eventValidation = getHidden(docP, "#__EVENTVALIDATION");
          viewStateGen = getHidden(docP, "#__VIEWSTATEGENERATOR");

          const itemsP = extractGridRows(docP);
          const matchedP = filterMatches(itemsP, { districtCode, districtName, provinceName });
          allMatches.push(...matchedP);
        }
      }

      // For exact code searches, enforce exact return
      const finalMatches = isExactCodeSearch
        ? allMatches.filter((x) => toLower(x.districtCode) === toLower(districtCode))
        : allMatches;

      return {
        status: "SUCCESS",
        mode: "search",
        criteria: searchCriteria,
        searchValue: searchValue,
        matchBehavior: !isEmpty(districtCode) ? "districtCode=exact" : "nameSearch=partial",
        totalPagesScanned: !isEmpty(districtCode) ? 1 : Math.min(pager.totalPages || 1, maxPages),
        countReturned: finalMatches.length,
        message:
          finalMatches.length > 0
            ? `Returned ${finalMatches.length} matching district record(s).`
            : "No matching district records found.",
        districts: finalMatches
      };
    }

    // SHOW ALL MODE
    const hasMore = pager.totalPages ? (pager.currentPage < pager.totalPages) : (pageItems.length === pageSize);
    const nextPage = hasMore ? (pager.currentPage ? pager.currentPage + 1 : page + 1) : null;

    return {
      status: "SUCCESS",
      mode: "showAll",
      page: pager.currentPage ?? page,
      pageSize: pageSize,
      totalPages: pager.totalPages,
      totalItems: pager.totalItems,
      countReturned: pageItems.length,
      hasMore: !!nextPage,
      nextPage: nextPage,
      message: nextPage
        ? `Returned ${pageItems.length} record(s) from page ${(pager.currentPage ?? page)}. Reply with page=${nextPage} to get the next ${pageSize}.`
        : `Returned ${pageItems.length} record(s). No more pages.`,
      districts: pageItems
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
});
