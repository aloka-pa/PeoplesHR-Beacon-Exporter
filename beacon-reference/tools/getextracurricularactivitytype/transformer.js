(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();

    const safeIntFromString = (v, def = 1) => {
      const t = okText(v);
      const n = Number(t);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    function phraseMeansShowAll(v) {
      const t = toLower(v);
      if (!t) return false;
      return (
        t.includes("show all") ||
        t.includes("view all") ||
        t.includes("get all") ||
        t.includes("return all") ||
        t.includes("available") ||
        t.includes("existing") ||
        t.includes("a list") ||
        t.includes("list") ||
        t === "all"
      );
    }

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
    }

    function parsePagerInfo(doc) {
      // Example: "Displaying page 1 of 2, items 1 to 9 of 10."
      const pagerRight = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const text = pagerRight.replace(/\s+/g, " ").trim();

      const m = text.match(
        /Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i
      );

      if (!m) {
        return { currentPage: null, totalPages: null, totalItems: null, raw: text };
      }

      return {
        currentPage: safeIntFromString(m[1], 1),
        totalPages: safeIntFromString(m[2], 1),
        totalItems: safeIntFromString(m[5], 0),
        raw: text
      };
    }

    function extractGridRows(doc) {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const results = [];

      for (const r of rows) {
        const tds = r.querySelectorAll("td");
        // Grid columns: Code | Type | (Edit icon)
        const code = tds[0]?.textContent?.trim() || "";
        const type = tds[1]?.textContent?.trim() || "";
        if (code || type) results.push({ code, type });
      }

      return results;
    }

    function filterMatches(items, { code, typeName }) {
      const hasCode = !isEmpty(code);
      const hasName = !isEmpty(typeName);

      if (!hasCode && !hasName) return items;

      const codeNeedle = toLower(code);
      const nameNeedle = toLower(typeName);

      return items.filter((it) => {
        const codeHay = toLower(it.code);
        const nameHay = toLower(it.type);

        // partial match for both
        if (hasCode && hasName) return codeHay.includes(codeNeedle) && nameHay.includes(nameNeedle);
        if (hasCode) return codeHay.includes(codeNeedle);
        return nameHay.includes(nameNeedle);
      });
    }

    async function postAndParse(url, headers, formData) {
      const resp = await fetch(url, { method: "POST", headers, body: formData, redirect: "follow" });
      const html = await resp.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html");
    }

    function buildBaseForm({ viewState, viewStateGen, eventValidation }) {
      const fd = new FormData();
      fd.append("scrollLeft", "0");
      fd.append("scrollTop", "0");
      fd.append("__EVENTTARGET", "");
      fd.append("__EVENTARGUMENT", "");
      fd.append("__VIEWSTATE", viewState);
      fd.append("__VIEWSTATEGENERATOR", viewStateGen);
      fd.append("__VIEWSTATEENCRYPTED", "");
      fd.append("__EVENTVALIDATION", eventValidation);
      fd.append("ctl00$hdnDateFormat", "dd/mm/yy");
      fd.append("ctl00$hdnQuickmenu", "1");
      return fd;
    }

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/ExtraCulActivityType.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Extra Curricular Activity Type screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args (STRING ONLY)
     * ------------------------------------------------- */
    const code = okText(args?.code);
    const typeName = okText(args?.typeName);
    const returnAll = okText(args?.returnAll);

    const showAllMode = phraseMeansShowAll(returnAll);

    const pageSize = safeIntFromString(args?.pageSize, 10); // UI default is 10 (your screen can also be 9)
    const maxPages = safeIntFromString(args?.maxPages, 50);

    if (!showAllMode && isEmpty(code) && isEmpty(typeName)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide code or typeName (or use returnAll='show all' to return all activity types)."
      };
    }

    /* -------------------------------------------------
     * 3) Build URL + Headers
     * ------------------------------------------------- */
    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/ExtraCulActivityType.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/ExtraCulActivityType.aspx`;

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
    const details = await BeaconBar.executeFunction("getApiList")("ExtraCulActivityType");

    /* -------------------------------------------------
     * 5) Decide criteria + value
     *    - For showAll, keep criteria EATYPE_CODE and blank text
     * ------------------------------------------------- */
    let searchCriteria = "EATYPE_CODE";
    let searchValue = "";

    if (!showAllMode) {
      if (!isEmpty(code)) {
        searchCriteria = "EATYPE_CODE";
        searchValue = code;
      } else {
        searchCriteria = "EATYPE_NAME";
        searchValue = typeName;
      }
    } else {
      searchCriteria = "EATYPE_CODE";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 6) Load grid (Search or Show All) on page 1
     * ------------------------------------------------- */
    const firstFD = new FormData();
    firstFD.append("scrollLeft", "0");
    firstFD.append("scrollTop", "0");
    firstFD.append("__EVENTTARGET", "");
    firstFD.append("__EVENTARGUMENT", "");
    firstFD.append("__VIEWSTATE", details.viewState);
    firstFD.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    firstFD.append("__VIEWSTATEENCRYPTED", "");
    firstFD.append("__EVENTVALIDATION", details.eventValidation);

    firstFD.append("ctl00$hdnDateFormat", "dd/mm/yy");
    firstFD.append("ctl00$hdnQuickmenu", "1");

    firstFD.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    firstFD.append("ctl00$body$ContentSearch$txtContent", searchValue);

    // pager baseline
    firstFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    firstFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    firstFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
    firstFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    firstFD.append("ctl00_body_grdsummary_ClientState", "");

    if (showAllMode) {
      firstFD.append("ctl00$body$ContentSearch$butAll", "Show All");
    } else {
      firstFD.append("ctl00$body$ContentSearch$butSearch", "Search");
    }

    let doc = await postAndParse(url, headers, firstFD);

    let vs = getHidden(doc, "#__VIEWSTATE");
    let ev = getHidden(doc, "#__EVENTVALIDATION");
    let vsg = getHidden(doc, "#__VIEWSTATEGENERATOR");

    if (!vs || !ev || !vsg) {
      return { status: "ERROR", message: "Failed to load grid state (missing ASP.NET hidden fields)." };
    }

    /* -------------------------------------------------
     * 7) Collect records across ALL pages
     *    - In search mode: filter matches each page
     *    - In showAll mode: collect all items each page
     * ------------------------------------------------- */
    const pager = parsePagerInfo(doc);
    const totalPages = Math.min(pager.totalPages || 1, maxPages);

    const all = [];
    const page1Items = extractGridRows(doc);
    const page1Final = showAllMode ? page1Items : filterMatches(page1Items, { code, typeName });
    all.push(...page1Final);

    for (let p = 2; p <= totalPages; p++) {
      const gotoFD = buildBaseForm({ viewState: vs, viewStateGen: vsg, eventValidation: ev });

      // Use "Go" paging (stable)
      gotoFD.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      gotoFD.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      gotoFD.append("ctl00$body$ContentSearch$txtContent", searchValue);

      gotoFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(p));
      gotoFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      gotoFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      gotoFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      gotoFD.append("ctl00_body_grdsummary_ClientState", "");

      const docP = await postAndParse(url, headers, gotoFD);

      // update hidden fields each loop
      vs = getHidden(docP, "#__VIEWSTATE");
      ev = getHidden(docP, "#__EVENTVALIDATION");
      vsg = getHidden(docP, "#__VIEWSTATEGENERATOR");

      const itemsP = extractGridRows(docP);
      const finalP = showAllMode ? itemsP : filterMatches(itemsP, { code, typeName });
      all.push(...finalP);
    }

    if (all.length === 0) {
      return {
        status: "NOT_FOUND",
        message: showAllMode
          ? "No Extra Curricular Activity Types found."
          : `No Extra Curricular Activity Types found matching "${searchValue}".`,
        criteria: searchCriteria,
        searchValue: searchValue
      };
    }

    return {
      status: "SUCCESS",
      mode: showAllMode ? "showAll" : "search",
      criteria: searchCriteria,
      searchValue: searchValue,
      pageSize: String(pageSize),
      totalPagesScanned: String(totalPages),
      count: all.length,
      activityTypes: all // each item = { code, type }
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
});
