(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/DwilingTypes.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Dwelling Types screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Helpers (STRING ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const toLower = (v) => okText(v).toLowerCase();
    const isTruthy = (v) => {
      const t = toLower(v);
      return [
        "true", "yes", "y", "1",
        "all", "available", "existing",
        "list", "showall", "show all", "returnall"
      ].includes(t);
    };

    const dwellingCode = okText(args?.dwellingCode);
    const dwellingName = okText(args?.dwellingName);

    const returnAll = isTruthy(args?.returnAll) || isTruthy(args?.showAll);

    // For returnAll => default to auto-fetch ALL pages
    const autoFetchAllPages = returnAll ? true : isTruthy(args?.autoFetchAllPages);

    const pageNumberRaw = okText(args?.pageNumber) || "1";
    const pageNumber = Number.isFinite(Number(pageNumberRaw)) ? Math.max(1, parseInt(pageNumberRaw, 10)) : 1;

    // Request a large page size, server may clamp; still OK because we will paginate
    const pageSizeRaw = okText(args?.pageSize) || "100";
    const pageSize = Number.isFinite(Number(pageSizeRaw)) ? Math.max(1, parseInt(pageSizeRaw, 10)) : 100;

    const maxPagesRaw = okText(args?.maxPages) || "50";
    const maxPages = Number.isFinite(Number(maxPagesRaw)) ? Math.max(1, parseInt(maxPagesRaw, 10)) : 50;

    if (!returnAll && !dwellingCode && !dwellingName) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide either dwellingCode or dwellingName. To return all records, pass returnAll as 'all'/'true'/'yes'/'available'/'existing'/'list'.",
        examples: {
          searchByCode: { dwellingCode: "000001" },
          searchByName: { dwellingName: "House" },
          returnAll: { returnAll: "all" }
        }
      };
    }

    /* -------------------------------------------------
     * 3) Initial page state + URL
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("DwilingTypes");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/DwilingTypes.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/DwilingTypes.aspx`;

    const parser = new DOMParser();

    const extractState = (doc) => ({
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || ""
    });

    const extractPagerInfo = (doc) => {
      const pagerText = doc.querySelector(".PagerRight_Default")?.textContent || "";
      // "Displaying page 2 of 2, items 6 to 10 of 10."
      const m = pagerText.match(/Displaying page\s+(\d+)\s+of\s+(\d+).*?of\s+(\d+)/i);
      const currentPage = m ? parseInt(m[1], 10) : 1;
      const totalPages = m ? parseInt(m[2], 10) : 1;
      const totalItems = m ? parseInt(m[3], 10) : null;

      // Map "2" -> {target, arg}
      const pageTargets = {};
      doc.querySelectorAll(".PagerLeft_Default a").forEach((a) => {
        const pageNo = (a.textContent || "").trim();
        const href = a.getAttribute("href") || "";
        const mm = href.match(/__doPostBack\('([^']+)','([^']*)'\)/);
        if (pageNo && mm) pageTargets[pageNo] = { target: mm[1], arg: mm[2] || "" };
      });

      return { currentPage, totalPages, totalItems, pageTargets };
    };

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const out = [];

      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) continue;

        const code = (cells[0]?.textContent || "").trim();
        const name = (cells[1]?.textContent || "").trim();

        if (!code && !name) continue;
        out.push({ code, dwellingName: name });
      }

      return out;
    };

    const applyFilter = (items) => {
      if (returnAll) return items;

      if (dwellingCode) {
        return items.filter((x) => x.code === dwellingCode); // exact
      }

      const needle = dwellingName.toLowerCase();
      return items.filter((x) => (x.dwellingName || "").toLowerCase().includes(needle)); // partial
    };

    /* -------------------------------------------------
     * 4) Determine search criteria/value (only if not returnAll)
     * ------------------------------------------------- */
    let searchCriteria = "DWELLING_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (dwellingCode) {
        searchCriteria = "DWELLING_CODE";
        searchValue = dwellingCode;
      } else {
        searchCriteria = "DWELLING_NAME";
        searchValue = dwellingName;
      }
    }

    /* -------------------------------------------------
     * 5) POST #1: Search or Show All (page 1)
     * ------------------------------------------------- */
    const postSearchOrAll = async () => {
      const formData = new FormData();
      formData.append("scrollLeft", "0");
      formData.append("scrollTop", "0");
      formData.append("__EVENTTARGET", "");
      formData.append("__EVENTARGUMENT", "");
      formData.append("__VIEWSTATE", details.viewState);
      formData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
      formData.append("__VIEWSTATEENCRYPTED", "");
      formData.append("__EVENTVALIDATION", details.eventValidation);

      formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      formData.append("ctl00$hdnQuickmenu", "1");

      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

      if (returnAll) {
        formData.append("ctl00$body$ContentSearch$butAll", "Show All");
      } else {
        formData.append("ctl00$body$ContentSearch$butSearch", "Search");
      }

      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();
      return parser.parseFromString(html, "text/html");
    };

    /* -------------------------------------------------
     * 6) Pager postback to specific page (REAL FIX)
     * ------------------------------------------------- */
    const postToPage = async (fromDoc, targetPage) => {
      const state = extractState(fromDoc);
      const pager = extractPagerInfo(fromDoc);

      const key = String(targetPage);
      const event = pager.pageTargets[key];
      if (!event?.target) return null;

      const formData = new FormData();
      formData.append("scrollLeft", "0");
      formData.append("scrollTop", "0");
      formData.append("__EVENTTARGET", event.target);
      formData.append("__EVENTARGUMENT", event.arg || "");
      formData.append("__VIEWSTATE", state.viewState);
      formData.append("__VIEWSTATEGENERATOR", state.viewStateGen);
      formData.append("__VIEWSTATEENCRYPTED", "");
      formData.append("__EVENTVALIDATION", state.eventValidation);

      formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      formData.append("ctl00$hdnQuickmenu", "1");

      // keep context
      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

      // keep pager fields stable
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", key);
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();
      return parser.parseFromString(html, "text/html");
    };

    /* -------------------------------------------------
     * 7) Execute
     * ------------------------------------------------- */
    const firstDoc = await postSearchOrAll();
    const pager1 = extractPagerInfo(firstDoc);

    // ALL pages (returnAll) => loop pages 1..N using numbered pager targets
    if (autoFetchAllPages) {
      const all = [];

      let currentDoc = firstDoc;
      let pager = pager1;

      let safety = 0;
      while (safety < maxPages) {
        safety += 1;

        const pageRows = extractRows(currentDoc);
        const filtered = applyFilter(pageRows);
        all.push(...filtered);

        if (!(pager.currentPage < pager.totalPages)) break;

        const next = pager.currentPage + 1;
        const nextDoc = await postToPage(currentDoc, next);
        if (!nextDoc) break;

        currentDoc = nextDoc;
        pager = extractPagerInfo(currentDoc);
      }

      if (!all.length) {
        return {
          status: "NOT_FOUND",
          message: returnAll
            ? "No Dwelling Type records found."
            : "No Dwelling Types found matching the search criteria.",
          searchBy: returnAll ? "all" : (searchCriteria === "DWELLING_CODE" ? "code" : "name"),
          searchValue: returnAll ? "" : searchValue
        };
      }

      return {
        status: "SUCCESS",
        message: returnAll
          ? `Returned ${all.length} Dwelling Type record(s).`
          : `Found ${all.length} matching Dwelling Type record(s).`,
        searchBy: returnAll ? "all" : (searchCriteria === "DWELLING_CODE" ? "code" : "name"),
        searchValue: returnAll ? "" : searchValue,
        count: all.length,
        records: all
      };
    }

    // Single page mode (for agent prompting)
    let finalDoc = firstDoc;
    const safeTarget = Math.min(pageNumber, pager1.totalPages || pageNumber);

    if (safeTarget > 1) {
      const paged = await postToPage(firstDoc, safeTarget);
      if (paged) finalDoc = paged;
    }

    const pager = extractPagerInfo(finalDoc);
    const rows = extractRows(finalDoc);
    const filtered = applyFilter(rows);

    const moreAvailable = pager.currentPage < pager.totalPages;
    const nextPage = moreAvailable ? String(pager.currentPage + 1) : "";

    if (!filtered.length) {
      return {
        status: "NOT_FOUND",
        message: returnAll
          ? `No Dwelling Type records found on page ${pager.currentPage}.`
          : "No Dwelling Types found matching the search criteria.",
        pageNumber: String(pager.currentPage),
        totalPages: String(pager.totalPages || 1),
        moreAvailable: moreAvailable ? "true" : "false",
        nextPage
      };
    }

    return {
      status: "SUCCESS",
      message: returnAll && moreAvailable
        ? `Here are the dwelling types (page ${pager.currentPage} of ${pager.totalPages}). More are available. Would you like the next page?`
        : returnAll
          ? `Here are the dwelling types (page ${pager.currentPage} of ${pager.totalPages}).`
          : `Found ${filtered.length} matching Dwelling Type record(s) on page ${pager.currentPage} of ${pager.totalPages}.`,
      pageNumber: String(pager.currentPage),
      totalPages: String(pager.totalPages || 1),
      moreAvailable: moreAvailable ? "true" : "false",
      nextPage,
      searchBy: returnAll ? "all" : (searchCriteria === "DWELLING_CODE" ? "code" : "name"),
      searchValue: returnAll ? "" : searchValue,
      count: filtered.length,
      records: filtered
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
