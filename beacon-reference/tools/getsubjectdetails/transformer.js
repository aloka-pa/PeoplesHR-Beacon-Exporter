(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Subjects.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Subjects screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Helpers (STRING ARGS ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const toLower = (v) => okText(v).toLowerCase();

    const subjectCode = okText(args?.subjectCode);
    const subjectName = okText(args?.subjectName);

    const returnAllRaw = toLower(args?.returnAll);
    const returnAll = [
      "true", "1", "yes", "y",
      "all", "showall", "show all",
      "list", "a list", "available", "existing"
    ].includes(returnAllRaw);

    const pageNumberRaw = okText(args?.pageNumber) || "1";
    const pageNumber = Number.isFinite(Number(pageNumberRaw)) ? Math.max(1, parseInt(pageNumberRaw, 10)) : 1;

    const pageSizeRaw = okText(args?.pageSize) || "100";
    const pageSize = Number.isFinite(Number(pageSizeRaw)) ? Math.max(1, parseInt(pageSizeRaw, 10)) : 100;

    if (!returnAll && !subjectCode && !subjectName) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide subjectCode or subjectName. Or set returnAll to 'all/show all/list/existing/available'."
      };
    }

    /* -------------------------------------------------
     * 3) Resolve URL + get hidden fields (initial)
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Subjects");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Subjects.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Subjects.aspx`;

    const parser = new DOMParser();

    const extractState = (doc) => ({
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || ""
    });

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const out = [];
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) continue;
        const code = (cells[0]?.textContent || "").trim();
        const name = (cells[1]?.textContent || "").trim();
        if (code) out.push({ code, subjectName: name });
      }
      return out;
    };

    const extractPagerInfo = (doc) => {
      const pagerText = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const m = pagerText.match(/Displaying page\s+(\d+)\s+of\s+(\d+).*?items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i);

      const currentPage = m ? parseInt(m[1], 10) : 1;
      const totalPages = m ? parseInt(m[2], 10) : 1;
      const totalItems = m ? parseInt(m[5], 10) : null;

      // Map pageNo -> __EVENTTARGET used by RadGrid pager links
      const pageTargets = {};
      doc.querySelectorAll(".PagerLeft_Default a").forEach((a) => {
        const pageNo = (a.textContent || "").trim();
        const href = a.getAttribute("href") || "";
        const mm = href.match(/__doPostBack\('([^']+)','([^']*)'\)/);
        if (pageNo && mm) {
          pageTargets[pageNo] = { target: mm[1], arg: mm[2] || "" };
        }
      });

      return { currentPage, totalPages, totalItems, pageTargets };
    };

    const applyFilter = (items) => {
      if (returnAll) return items;

      if (subjectCode) {
        // Code search should be exact
        return items.filter((x) => x.code === subjectCode);
      }

      // Name search partial match
      const n = subjectName.toLowerCase();
      return items.filter((x) => (x.subjectName || "").toLowerCase().includes(n));
    };

    /* -------------------------------------------------
     * 4) Determine search criteria/value
     * ------------------------------------------------- */
    let searchCriteria = "SBJ_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (subjectCode) {
        searchCriteria = "SBJ_CODE";
        searchValue = subjectCode;
      } else {
        searchCriteria = "SBJ_NAME";
        searchValue = subjectName;
      }
    }

    /* -------------------------------------------------
     * 5) POST #1: Search or Show All (always page 1 state)
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

      // Page + size fields (server may cap, but ok)
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
    const firstPager = extractPagerInfo(firstDoc);

    /* -------------------------------------------------
     * 6) If user requested a specific page > 1, do pager POST
     *     NOTE: This is the real fix. Use __EVENTTARGET from pager links.
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

      // Keep these (safe)
      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", searchValue);
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", key);
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();
      return parser.parseFromString(html, "text/html");
    };

    let finalDoc = firstDoc;

    // If pageNumber > totalPages, clamp
    const safeTargetPage = Math.min(pageNumber, firstPager.totalPages || pageNumber);

    if (safeTargetPage > 1) {
      const pagedDoc = await postToPage(firstDoc, safeTargetPage);
      if (pagedDoc) finalDoc = pagedDoc;
    }

    /* -------------------------------------------------
     * 7) Extract + filter results for the selected page
     * ------------------------------------------------- */
    const allRowsThisPage = extractRows(finalDoc);
    const results = applyFilter(allRowsThisPage);

    const pager = extractPagerInfo(finalDoc);
    const moreAvailable = pager.currentPage < pager.totalPages;
    const nextPage = moreAvailable ? String(pager.currentPage + 1) : "";

    if (results.length === 0) {
      return {
        status: "NOT_FOUND",
        message: returnAll
          ? `No Subjects records found on page ${pager.currentPage}.`
          : "No Subjects found matching the search criteria.",
        returnAll: returnAll ? "true" : "false",
        pageNumber: String(pager.currentPage),
        totalPages: String(pager.totalPages || 1),
        moreAvailable: moreAvailable ? "true" : "false",
        nextPage
      };
    }

    // Message logic: if listing all, prompt for next page
    const msg =
      returnAll && moreAvailable
        ? `Here are the subjects (page ${pager.currentPage} of ${pager.totalPages}). There are more subjects available. Would you like to see the next page?`
        : returnAll
          ? `Here are the subjects (page ${pager.currentPage} of ${pager.totalPages}).`
          : `Found ${results.length} matching Subject record(s) on page ${pager.currentPage} of ${pager.totalPages}.`;

    return {
      status: "SUCCESS",
      message: msg,
      returnAll: returnAll ? "true" : "false",
      pageNumber: String(pager.currentPage),
      totalPages: String(pager.totalPages || 1),
      moreAvailable: moreAvailable ? "true" : "false",
      nextPage,
      count: results.length,
      subjects: results
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: String(err)
    };
  }
});
