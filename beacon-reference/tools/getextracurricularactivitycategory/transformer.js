(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers (STRING ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();
    const isNumStr = (v) => /^[0-9]+$/.test(okText(v));

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
        t === "all" ||
        t === "*"
      );
    }

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
    }

    function getPagerRightText(doc) {
      return (doc.querySelector(".PagerRight_Default")?.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function parsePagerInfo(doc) {
      const text = getPagerRightText(doc);
      const m = text.match(
        /Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i
      );
      if (!m) return { currentPage: 1, totalPages: 1, totalItems: null, raw: text };
      return {
        currentPage: safeIntFromString(m[1], 1),
        totalPages: safeIntFromString(m[2], 1),
        totalItems: safeIntFromString(m[5], 0),
        raw: text
      };
    }

    function extractUiPageSize(doc, fallback = 10) {
      // Prefer posted Value (most reliable)
      const v2 = okText(doc.querySelector('input[name="ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox"]')?.value);
      if (isNumStr(v2)) return safeIntFromString(v2, fallback);

      // sometimes "_Value" exists
      const v3 = okText(doc.querySelector('input[id$="_ChangePageSizeTextBox_Value"]')?.value);
      if (isNumStr(v3)) return safeIntFromString(v3, fallback);

      // visible "_text" (least reliable; keep as last resort)
      const v4 = okText(doc.querySelector('input[id$="_ChangePageSizeTextBox_text"]')?.value);
      if (isNumStr(v4)) return safeIntFromString(v4, fallback);

      return fallback;
    }

    // Robust extraction: header-based index + row id prefix
    function extractGridRows(doc) {
      const table = doc.querySelector("#ctl00_body_grdsummary_ctl00");
      if (!table) return [];

      const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
        (th.textContent || "").replace(/\s+/g, " ").trim().toLowerCase()
      );

      const codeIdx = headers.findIndex((h) => h === "code");
      const catIdx = headers.findIndex((h) => h === "category");

      const iCode = codeIdx >= 0 ? codeIdx : 0;
      const iCat = catIdx >= 0 ? catIdx : 1;

      const rows = table.querySelectorAll("tbody tr[id^='ctl00_body_grdsummary_ctl00__']");
      const results = [];

      for (const r of rows) {
        const tds = r.querySelectorAll("td");
        const code = (tds[iCode]?.textContent || "").trim();
        const name = (tds[iCat]?.textContent || "").trim();
        if (code) results.push({ code, categoryName: name });
      }

      return results;
    }

    function filterMatches(items, { categoryCode, categoryName }) {
      const hasCode = !isEmpty(categoryCode);
      const hasName = !isEmpty(categoryName);
      if (!hasCode && !hasName) return items;

      const codeNeedle = toLower(categoryCode);
      const nameNeedle = toLower(categoryName);

      return items.filter((it) => {
        const codeHay = toLower(it.code);
        const nameHay = toLower(it.categoryName);

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
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/ExtraCulActivityCatgory.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Extra Curricular Activity Category screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args (STRING ONLY) + detect showAll
     * ------------------------------------------------- */
    const categoryCode = okText(args?.categoryCode);
    const categoryName = okText(args?.categoryName);
    const returnAllArg = okText(args?.returnAll);

    // showAll can be triggered by ANY of these fields
    const showAllMode =
      phraseMeansShowAll(returnAllArg) ||
      phraseMeansShowAll(categoryCode) ||
      phraseMeansShowAll(categoryName);

    const requestedPageSize = safeIntFromString(args?.pageSize, 10); // used only for first request
    const maxPages = safeIntFromString(args?.maxPages, 200);

    if (!showAllMode && isEmpty(categoryCode) && isEmpty(categoryName)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide categoryCode or categoryName (or use returnAll='show all' to return all categories)."
      };
    }

    /* -------------------------------------------------
     * 3) URL + headers
     * ------------------------------------------------- */
    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/ExtraCulActivityCatgory.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/ExtraCulActivityCatgory.aspx`;

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    /* -------------------------------------------------
     * 4) Initial hidden fields
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("ExtraCulActivityCatgory");

    /* -------------------------------------------------
     * 5) Criteria + search value
     * ------------------------------------------------- */
    let searchCriteria = "EACAT_CODE";
    let searchValue = "";

    if (!showAllMode) {
      if (!isEmpty(categoryCode)) {
        searchCriteria = "EACAT_CODE";
        searchValue = categoryCode;
      } else {
        searchCriteria = "EACAT_NAME";
        searchValue = categoryName;
      }
    } else {
      // show all uses blank text
      searchCriteria = "EACAT_CODE";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 6) First load (Search or Show All) page 1
     * ------------------------------------------------- */
    const firstFD = buildBaseForm({
      viewState: details.viewState,
      viewStateGen: details.viewStateGen,
      eventValidation: details.eventValidation
    });

    firstFD.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    firstFD.append("ctl00$body$ContentSearch$txtContent", searchValue);

    // grid pager baseline
    firstFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    firstFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    firstFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(requestedPageSize));
    firstFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    firstFD.append("ctl00_body_grdsummary_ClientState", "");

    if (showAllMode) firstFD.append("ctl00$body$ContentSearch$butAll", "Show All");
    else firstFD.append("ctl00$body$ContentSearch$butSearch", "Search");

    let doc = await postAndParse(url, headers, firstFD);

    let vs = getHidden(doc, "#__VIEWSTATE");
    let ev = getHidden(doc, "#__EVENTVALIDATION");
    let vsg = getHidden(doc, "#__VIEWSTATEGENERATOR");

    if (isEmpty(vs) || isEmpty(ev) || isEmpty(vsg)) {
      return { status: "ERROR", message: "Failed to load grid state (missing ASP.NET hidden fields)." };
    }

    // adopt UI page size for all further requests
    const uiPageSize = extractUiPageSize(doc, requestedPageSize);

    /* -------------------------------------------------
     * 6A) IMPORTANT: In showAll mode, force sort by CODE (ascending)
     * ------------------------------------------------- */
    if (showAllMode) {
      const sortFD = buildBaseForm({ viewState: vs, viewStateGen: vsg, eventValidation: ev });

      // preserve show-all search context
      sortFD.append("ctl00$body$ContentSearch$cboCriteria", "EACAT_CODE");
      sortFD.append("ctl00$body$ContentSearch$txtContent", "");

      // pager inputs
      sortFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      sortFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      sortFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(uiPageSize));
      sortFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      sortFD.append("ctl00_body_grdsummary_ClientState", "");

      // Trigger sort by "Code" header
      sortFD.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl02$ctl01$ctl00");
      sortFD.set("__EVENTARGUMENT", "");

      doc = await postAndParse(url, headers, sortFD);

      // refresh hidden fields after sort
      vs = getHidden(doc, "#__VIEWSTATE");
      ev = getHidden(doc, "#__EVENTVALIDATION");
      vsg = getHidden(doc, "#__VIEWSTATEGENERATOR");

      if (isEmpty(vs) || isEmpty(ev) || isEmpty(vsg)) {
        return { status: "ERROR", message: "Failed after sort (missing ASP.NET hidden fields)." };
      }
    }

    /* -------------------------------------------------
     * 7) Collect across pages
     * ------------------------------------------------- */
    const pager1 = parsePagerInfo(doc);
    const totalPages = Math.min(pager1.totalPages || 1, maxPages);

    const all = [];
    const seen = new Set(); // dedupe safety (code|name)

    const addMany = (arr) => {
      for (const it of arr) {
        const key = `${okText(it.code)}|${okText(it.categoryName)}`;
        if (!seen.has(key)) {
          seen.add(key);
          all.push(it);
        }
      }
    };

    const page1Items = extractGridRows(doc);
    addMany(showAllMode ? page1Items : filterMatches(page1Items, { categoryCode, categoryName }));

    for (let p = 2; p <= totalPages; p++) {
      const gotoFD = buildBaseForm({ viewState: vs, viewStateGen: vsg, eventValidation: ev });

      gotoFD.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      gotoFD.set("__EVENTARGUMENT", "");

      // preserve search context
      gotoFD.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      gotoFD.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // pager values
      gotoFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(p));
      gotoFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      gotoFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(uiPageSize));
      gotoFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      gotoFD.append("ctl00_body_grdsummary_ClientState", "");

      const docP = await postAndParse(url, headers, gotoFD);

      vs = getHidden(docP, "#__VIEWSTATE");
      ev = getHidden(docP, "#__EVENTVALIDATION");
      vsg = getHidden(docP, "#__VIEWSTATEGENERATOR");

      const itemsP = extractGridRows(docP);
      addMany(showAllMode ? itemsP : filterMatches(itemsP, { categoryCode, categoryName }));
    }

    if (all.length === 0) {
      return {
        status: "NOT_FOUND",
        message: showAllMode
          ? "No Extra Curricular Activity Categories found."
          : "No Extra Curricular Activity Categories found matching the search criteria."
      };
    }

    return {
      status: "SUCCESS",
      mode: showAllMode ? "showAll" : "search",
      criteria: searchCriteria,
      searchValue: searchValue,
      uiPageSize: String(uiPageSize),
      totalPagesScanned: String(totalPages),
      count: String(all.length),
      categories: all
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
});
