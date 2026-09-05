(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/QualificationClassific.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Qualification Classification screen. Please contact HR Admin."
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

    const code = okText(args?.classificationCode);
    const name = okText(args?.classificationName);

    const includeDetails = isTruthy(args?.includeDetails);

    const fetchMode = toLower(args?.fetchMode);
    const isAllMode = ["all", "available", "existing", "list"].includes(fetchMode) || isTruthy(args?.returnAll);

    const pageNumberRaw = okText(args?.pageNumber) || "1";
    const pageNumber = Number.isFinite(Number(pageNumberRaw)) ? Math.max(1, parseInt(pageNumberRaw, 10)) : 1;

    const pageSizeRaw = okText(args?.pageSize) || "100";
    const pageSize = Number.isFinite(Number(pageSizeRaw)) ? Math.max(1, parseInt(pageSizeRaw, 10)) : 100;

    const autoFetchAllPages = isAllMode ? true : isTruthy(args?.autoFetchAllPages);

    const maxPagesRaw = okText(args?.maxPages) || "50";
    const maxPages = Number.isFinite(Number(maxPagesRaw)) ? Math.max(1, parseInt(maxPagesRaw, 10)) : 50;

    /* -------------------------------------------------
     * 3) Input validation
     * ------------------------------------------------- */
    if (!isAllMode && !code && !name) {
      return {
        status: "INVALID_ARGS",
        message:
          "Error: either classificationCode or classificationName is required, OR set fetchMode/returnAll to ALL/AVAILABLE/EXISTING/LIST."
      };
    }

    /* -------------------------------------------------
     * 4) Initial hidden fields + URL
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("QualificationClassific");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/QualificationClassific.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/QualificationClassific.aspx`;

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
      // "Displaying page 1 of 3, items 1 to 3 of 9."
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

        const rowCode = (cells[0]?.textContent || "").trim();
        const rowClassification = (cells[1]?.textContent || "").trim();
        const rowRank = (cells[2]?.textContent || "").trim();

        if (!rowCode && !rowClassification) continue;

        // store row element for edit link extraction if includeDetails
        out.push({ code: rowCode, classification: rowClassification, rank: rowRank, rowEl: row });
      }

      return out;
    };

    const applyFilter = (items) => {
      if (isAllMode) return items;

      const codeNeedle = code.toLowerCase();
      const nameNeedle = name.toLowerCase();

      return items.filter((r) => {
        if (code) return (r.code || "").toLowerCase().includes(codeNeedle);
        return (r.classification || "").toLowerCase().includes(nameNeedle);
      });
    };

    /* -------------------------------------------------
     * 5) Determine search criteria/value
     * ------------------------------------------------- */
    const searchCriteria = code ? "QUALCLASSIFIC_CODE" : "QUALCLASSIFIC_NAME";
    const searchValue = code || name;

    /* -------------------------------------------------
     * 6) POST #1: Search or Show All (page 1)
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
      formData.append("ctl00$body$hdnIsHead", "");
      formData.append("ctl00$body$hdnEditItemIndex", "");

      // criteria required even for ALL
      formData.append("ctl00$body$ContentSearch$cboCriteria", isAllMode ? "QUALCLASSIFIC_CODE" : searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", isAllMode ? "" : searchValue);

      if (isAllMode) {
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
     * 7) Pager postback (REAL FIX)
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
      formData.append("ctl00$body$hdnIsHead", "");
      formData.append("ctl00$body$hdnEditItemIndex", "");

      // Keep search context (safe)
      formData.append("ctl00$body$ContentSearch$cboCriteria", isAllMode ? "QUALCLASSIFIC_CODE" : searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", isAllMode ? "" : searchValue);

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
     * 8) includeDetails: open row (edit)
     * ------------------------------------------------- */
    const openRowDetails = async (pageDoc, rowEl) => {
      const editHref = rowEl.querySelector("a")?.getAttribute("href") || "";
      const mm = editHref.match(/__doPostBack\('([^']+)','([^']*)'\)/);
      const eventTarget = mm ? mm[1] : "";
      const eventArg = mm ? (mm[2] || "") : "";

      if (!eventTarget) return null;

      const state = extractState(pageDoc);

      const formData = new FormData();
      formData.append("scrollLeft", "0");
      formData.append("scrollTop", "0");
      formData.append("__EVENTTARGET", eventTarget);
      formData.append("__EVENTARGUMENT", eventArg);
      formData.append("__VIEWSTATE", state.viewState);
      formData.append("__VIEWSTATEGENERATOR", state.viewStateGen);
      formData.append("__VIEWSTATEENCRYPTED", "");
      formData.append("__EVENTVALIDATION", state.eventValidation);

      formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      formData.append("ctl00$hdnQuickmenu", "1");

      // Keep search context (safe)
      formData.append("ctl00$body$ContentSearch$cboCriteria", isAllMode ? "QUALCLASSIFIC_CODE" : searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", isAllMode ? "" : searchValue);

      // Keep pager fields (safe)
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();

      // You can parse html and extract extra fields if needed later.
      // For now we just confirm the open worked by returning html length.
      return { opened: true, htmlLength: html.length };
    };

    /* -------------------------------------------------
     * 9) Run
     * ------------------------------------------------- */
    const firstDoc = await postSearchOrAll();
    const pager1 = extractPagerInfo(firstDoc);

    // If ALL mode => fetch all pages
    if (autoFetchAllPages) {
      const allResults = [];
      let currentDoc = firstDoc;
      let pager = pager1;

      let safety = 0;
      while (safety < maxPages) {
        safety += 1;

        const pageRows = extractRows(currentDoc);
        const matches = applyFilter(pageRows);

        if (!includeDetails) {
          allResults.push(...matches.map(r => ({
            code: r.code,
            classification: r.classification,
            rank: r.rank
          })));
        } else {
          for (const r of matches) {
            // open details (optional)
            await openRowDetails(currentDoc, r.rowEl);
            allResults.push({
              code: r.code,
              classification: r.classification,
              rank: r.rank
            });
          }
        }

        if (!(pager.currentPage < pager.totalPages)) break;

        const next = pager.currentPage + 1;
        const nextDoc = await postToPage(currentDoc, next);
        if (!nextDoc) break;

        currentDoc = nextDoc;
        pager = extractPagerInfo(currentDoc);
      }

      if (!allResults.length) {
        return {
          status: "NOT_FOUND",
          message: isAllMode
            ? "No qualification classifications found."
            : "No qualification classifications found matching the search criteria.",
          searchedFor: isAllMode ? fetchMode : searchValue
        };
      }

      return {
        status: "SUCCESS",
        mode: isAllMode ? "ALL" : "SEARCH_ALL_PAGES",
        includeDetails: includeDetails ? "true" : "false",
        count: allResults.length,
        classifications: allResults
      };
    }

    // Single page mode: allow paging prompts
    let finalDoc = firstDoc;
    const safeTarget = Math.min(pageNumber, pager1.totalPages || pageNumber);

    if (safeTarget > 1) {
      const paged = await postToPage(firstDoc, safeTarget);
      if (paged) finalDoc = paged;
    }

    const pager = extractPagerInfo(finalDoc);
    const rows = extractRows(finalDoc);
    const matches = applyFilter(rows);

    const moreAvailable = pager.currentPage < pager.totalPages;
    const nextPage = moreAvailable ? String(pager.currentPage + 1) : "";

    if (!matches.length) {
      return {
        status: "NOT_FOUND",
        message: isAllMode
          ? `No qualification classifications found on page ${pager.currentPage}.`
          : "No qualification classifications found matching the search criteria.",
        pageNumber: String(pager.currentPage),
        totalPages: String(pager.totalPages || 1),
        moreAvailable: moreAvailable ? "true" : "false",
        nextPage
      };
    }

    const resultPage = [];
    if (!includeDetails) {
      for (const r of matches) {
        resultPage.push({ code: r.code, classification: r.classification, rank: r.rank });
      }
    } else {
      for (const r of matches) {
        await openRowDetails(finalDoc, r.rowEl);
        resultPage.push({ code: r.code, classification: r.classification, rank: r.rank });
      }
    }

    return {
      status: "SUCCESS",
      mode: isAllMode ? "ALL_PAGE" : "SEARCH_PAGE",
      includeDetails: includeDetails ? "true" : "false",
      pageNumber: String(pager.currentPage),
      totalPages: String(pager.totalPages || 1),
      moreAvailable: moreAvailable ? "true" : "false",
      nextPage,
      count: resultPage.length,
      classifications: resultPage
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: String(err)
    };
  }
});
