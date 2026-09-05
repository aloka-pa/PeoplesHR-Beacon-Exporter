(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/QualificationProperty.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Qualification Property screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Helpers (STRING ARGS ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const toLower = (v) => okText(v).toLowerCase();
    const isTruthy = (v) => {
      const t = toLower(v);
      return ["true","1","yes","y","all","showall","show all","list","a list","available","existing"].includes(t);
    };

    const returnAll = isTruthy(args?.returnAll);

    const propertyCode = okText(args?.propertyCode);
    const propertyName = okText(args?.propertyName);
    const qualificationName = okText(args?.qualificationName);
    const qualificationCode = okText(args?.qualificationCode);

    const pageNumberRaw = okText(args?.pageNumber) || "1";
    const pageNumber = Number.isFinite(Number(pageNumberRaw)) ? Math.max(1, parseInt(pageNumberRaw, 10)) : 1;

    const pageSizeRaw = okText(args?.pageSize) || "100";
    const pageSize = Number.isFinite(Number(pageSizeRaw)) ? Math.max(1, parseInt(pageSizeRaw, 10)) : 100;

    const autoFetchAllPages = isTruthy(args?.autoFetchAllPages);
    const maxPagesRaw = okText(args?.maxPages) || "20";
    const maxPages = Number.isFinite(Number(maxPagesRaw)) ? Math.max(1, parseInt(maxPagesRaw, 10)) : 20;

    if (!returnAll && !propertyCode && !propertyName && !qualificationName && !qualificationCode) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide propertyCode, propertyName, qualificationName, or qualificationCode. Or set returnAll to 'all/show all/list/existing/available'."
      };
    }

    /* -------------------------------------------------
     * 3) Initial page state (hidden fields)
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("QualificationProperty");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/QualificationProperty.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/QualificationProperty.aspx`;

    const parser = new DOMParser();

    const extractState = (doc) => ({
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || ""
    });

    const extractPagerInfo = (doc) => {
      const pagerText = doc.querySelector(".PagerRight_Default")?.textContent || "";
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
        // You used <td colspan="4"> in pager, so grid likely has 4 columns or more.
        // We only need first 3 textual columns: code, property name, qualification name
        if (cells.length < 3) continue;

        const rowPropertyCode = (cells[0]?.textContent || "").trim();
        const rowPropertyName = (cells[1]?.textContent || "").trim();
        const rowQualificationName = (cells[2]?.textContent || "").trim();

        if (!rowPropertyCode && !rowPropertyName && !rowQualificationName) continue;

        out.push({
          propertyCode: rowPropertyCode,
          propertyName: rowPropertyName,
          qualificationName: rowQualificationName
        });
      }
      return out;
    };

    const applyFilter = (items) => {
      if (returnAll) return items;

      if (propertyCode) {
        return items.filter((x) => x.propertyCode === propertyCode);
      }

      if (propertyName) {
        const n = propertyName.toLowerCase();
        return items.filter((x) => (x.propertyName || "").toLowerCase().includes(n));
      }

      if (qualificationCode) {
        // Qualification code may not be in grid columns. If your grid doesn't show it,
        // then code filtering must be done by searchCriteria, not in-row filtering.
        // Here, keep all results returned by server.
        return items;
      }

      const qn = qualificationName.toLowerCase();
      return items.filter((x) => (x.qualificationName || "").toLowerCase().includes(qn));
    };

    /* -------------------------------------------------
     * 4) Determine search criteria + value
     *    Based on your request payload:
     *      QATT.QATT_CODE, QATT.QATT_NAME, QUA.QUALIFI_NAME
     * ------------------------------------------------- */
    let searchCriteria = "QATT.QATT_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (propertyCode) {
        searchCriteria = "QATT.QATT_CODE";
        searchValue = propertyCode;
      } else if (propertyName) {
        searchCriteria = "QATT.QATT_NAME";
        searchValue = propertyName;
      } else if (qualificationCode) {
        // Only use this if your dropdown actually supports qualification code.
        // If it doesn't, you should remove this branch.
        searchCriteria = "QUA.QUALIFI_CODE";
        searchValue = qualificationCode;
      } else {
        searchCriteria = "QUA.QUALIFI_NAME";
        searchValue = qualificationName;
      }
    }

    /* -------------------------------------------------
     * 5) POST #1: Search or Show All (gets page 1 + pager targets)
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

    const firstDoc = await postSearchOrAll();

    /* -------------------------------------------------
     * 6) Pager postback to navigate to a specific page (REAL FIX)
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
     * 7) Single-page mode (prompt user for next page)
     * ------------------------------------------------- */
    const runSinglePage = async () => {
      let doc = firstDoc;
      const pager1 = extractPagerInfo(firstDoc);
      const safeTarget = Math.min(pageNumber, pager1.totalPages || pageNumber);

      if (safeTarget > 1) {
        const paged = await postToPage(firstDoc, safeTarget);
        if (paged) doc = paged;
      }

      const pager = extractPagerInfo(doc);
      const rows = extractRows(doc);
      const filtered = applyFilter(rows);

      const moreAvailable = pager.currentPage < pager.totalPages;
      const nextPage = moreAvailable ? String(pager.currentPage + 1) : "";

      if (!filtered.length) {
        return {
          status: "NOT_FOUND",
          message: returnAll
            ? `No Qualification Property records found on page ${pager.currentPage}.`
            : "No Qualification Properties found matching the search criteria.",
          returnAll: returnAll ? "true" : "false",
          pageNumber: String(pager.currentPage),
          totalPages: String(pager.totalPages || 1),
          moreAvailable: moreAvailable ? "true" : "false",
          nextPage
        };
      }

      const msg =
        returnAll && moreAvailable
          ? `Here are the qualification properties (page ${pager.currentPage} of ${pager.totalPages}). More records are available. Would you like to see the next page?`
          : returnAll
            ? `Here are the qualification properties (page ${pager.currentPage} of ${pager.totalPages}).`
            : `Found ${filtered.length} matching Qualification Property record(s) on page ${pager.currentPage} of ${pager.totalPages}.`;

      return {
        status: "SUCCESS",
        message: msg,
        returnAll: returnAll ? "true" : "false",
        pageNumber: String(pager.currentPage),
        totalPages: String(pager.totalPages || 1),
        moreAvailable: moreAvailable ? "true" : "false",
        nextPage,
        count: filtered.length,
        qualificationProperties: filtered
      };
    };

    /* -------------------------------------------------
     * 8) Auto-fetch-all-pages mode (optional)
     * ------------------------------------------------- */
    const runAutoFetchAll = async () => {
      const all = [];

      // Start from page 1
      let currentDoc = firstDoc;
      let pager = extractPagerInfo(currentDoc);

      let safety = 0;
      while (safety < maxPages) {
        safety += 1;

        const rows = extractRows(currentDoc);
        const filtered = applyFilter(rows);
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
            ? "No Qualification Property records found."
            : "No Qualification Properties found matching the search criteria.",
          returnAll: returnAll ? "true" : "false"
        };
      }

      return {
        status: "SUCCESS",
        message: `Returned ${all.length} Qualification Property record(s).`,
        returnAll: returnAll ? "true" : "false",
        count: all.length,
        qualificationProperties: all
      };
    };

    // Choose mode
    if (autoFetchAllPages) return await runAutoFetchAll();
    return await runSinglePage();
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: String(err)
    };
  }
});
