(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Qualifications.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Qualifications screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Helpers (STRING ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const toLower = (v) => okText(v).toLowerCase();
    const isTruthy = (v) => {
      const t = toLower(v);
      return ["true","1","yes","y","all","showall","show all","list","a list","available","existing"].includes(t);
    };

    const fetchMode = toLower(args?.fetchMode);
    const wantsAll =
      ["all", "available", "existing", "list"].includes(fetchMode) || isTruthy(args?.returnAll);

    const codeRaw = okText(args?.qualificationCode);
    const nameRaw = okText(args?.qualificationName);

    const pageNumberRaw = okText(args?.pageNumber) || "1";
    const pageNumber = Number.isFinite(Number(pageNumberRaw)) ? Math.max(1, parseInt(pageNumberRaw, 10)) : 1;

    const pageSizeRaw = okText(args?.pageSize) || "100";
    const pageSize = Number.isFinite(Number(pageSizeRaw)) ? Math.max(1, parseInt(pageSizeRaw, 10)) : 100;

    const autoFetchAllPages =
      wantsAll ? true : isTruthy(args?.autoFetchAllPages); // for ALL requests, default TRUE

    const maxPagesRaw = okText(args?.maxPages) || "50";
    const maxPages = Number.isFinite(Number(maxPagesRaw)) ? Math.max(1, parseInt(maxPagesRaw, 10)) : 50;

    // Validate input
    if (!wantsAll && !codeRaw && !nameRaw) {
      return {
        status: "INVALID_ARGS",
        message: "Error: Provide qualificationCode or qualificationName, or set fetchMode/returnAll to ALL/AVAILABLE/EXISTING/LIST."
      };
    }

    /* -------------------------------------------------
     * 3) Decide search criteria + value
     * ------------------------------------------------- */
    let searchCriteria = "QUALIFI_CODE";
    let searchValue = "";

    if (!wantsAll) {
      if (codeRaw) {
        searchCriteria = "QUALIFI_CODE";
        searchValue = codeRaw;
      } else {
        searchCriteria = "QUALIFI_NAME";
        searchValue = nameRaw;
      }
    } else {
      // Show all: criteria doesn't matter much; keep stable
      searchCriteria = "QUALIFI_CODE";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 4) URL + initial hidden fields
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Qualifications");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Qualifications.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Qualifications.aspx`;

    const parser = new DOMParser();

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const extractState = (doc) => ({
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || ""
    });

    const extractPagerInfo = (doc) => {
      const pagerText = doc.querySelector(".PagerRight_Default")?.textContent || "";
      // Example: "Displaying page 1 of 4, items 1 to 2 of 8."
      const m = pagerText.match(/Displaying page\s+(\d+)\s+of\s+(\d+).*?of\s+(\d+)/i);

      const currentPage = m ? parseInt(m[1], 10) : 1;
      const totalPages = m ? parseInt(m[2], 10) : 1;
      const totalItems = m ? parseInt(m[3], 10) : null;

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

        // Based on your code: code, qualification, expiration
        const code = (cells[0]?.textContent || "").trim();
        const qualification = (cells[1]?.textContent || "").trim();
        const expiration = (cells[2]?.textContent || "").trim(); // may exist

        if (!code && !qualification) continue;

        out.push({ code, qualification, expiration });
      }
      return out;
    };

    const applyFilter = (items) => {
      if (wantsAll) return items;

      const needle = (searchValue || "").toLowerCase();

      if (codeRaw) {
        // partial includes for code
        return items.filter((r) => (r.code || "").toLowerCase().includes(needle));
      }

      // partial includes for name
      return items.filter((r) => (r.qualification || "").toLowerCase().includes(needle));
    };

    /* -------------------------------------------------
     * 5) POST #1: Search or Show All (page 1 state)
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
      formData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      if (wantsAll) {
        formData.append("ctl00$body$ContentSearch$butAll", "Show All");
      } else {
        formData.append("ctl00$body$ContentSearch$butSearch", "Search");
      }

      // page size request (server may clamp)
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
     * 6) Pager postback to a specific page (REAL FIX)
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

      // Keep search context fields (safe)
      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // Keep pager fields (safe)
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
    let pager1 = extractPagerInfo(firstDoc);

    // If user wants ALL: auto fetch all pages (default TRUE)
    if (autoFetchAllPages) {
      const all = [];

      let currentDoc = firstDoc;
      let pager = pager1;

      let safety = 0;
      while (safety < maxPages) {
        safety += 1;

        const rows = extractRows(currentDoc);
        const filtered = applyFilter(rows);
        all.push(...filtered);

        if (!(pager.currentPage < pager.totalPages)) break;

        const nextPage = pager.currentPage + 1;
        const nextDoc = await postToPage(currentDoc, nextPage);
        if (!nextDoc) break;

        currentDoc = nextDoc;
        pager = extractPagerInfo(currentDoc);
      }

      if (!all.length) {
        return {
          status: "NOT_FOUND",
          message: wantsAll
            ? "No qualification records found."
            : `No qualification records found matching "${searchValue}".`,
          searchedFor: wantsAll ? "ALL" : searchValue
        };
      }

      return {
        status: "SUCCESS",
        mode: wantsAll ? "ALL" : (codeRaw ? "CODE_SEARCH" : "NAME_SEARCH"),
        count: all.length,
        qualifications: all
      };
    }

    // Single-page mode: return requested page + prompt for more
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
        message: wantsAll
          ? `No qualification records found on page ${pager.currentPage}.`
          : `No qualification records found matching "${searchValue}".`,
        pageNumber: String(pager.currentPage),
        totalPages: String(pager.totalPages || 1),
        moreAvailable: moreAvailable ? "true" : "false",
        nextPage
      };
    }

    return {
      status: "SUCCESS",
      mode: wantsAll ? "ALL_PAGE" : (codeRaw ? "CODE_SEARCH" : "NAME_SEARCH"),
      pageNumber: String(pager.currentPage),
      totalPages: String(pager.totalPages || 1),
      moreAvailable: moreAvailable ? "true" : "false",
      nextPage,
      count: filtered.length,
      qualifications: filtered
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: String(err)
    };
  }
});
