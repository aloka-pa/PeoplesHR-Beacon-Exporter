(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers (STRING ARGS ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const lower = (v) => okText(v).toLowerCase();

    const isTruthy = (v) => {
      const t = lower(v);
      return [
        "true", "1", "yes", "y",
        "all", "available", "existing", "list",
        "showall", "show all", "returnall"
      ].includes(t);
    };

    const safeInt = (v, def) => {
      const n = Number(okText(v));
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    const extractHidden = (doc, name) =>
      doc.querySelector(`input[name="${name}"]`)?.getAttribute("value") || "";

    const extractState = (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return {
        doc,
        viewState: extractHidden(doc, "__VIEWSTATE"),
        viewStateGen: extractHidden(doc, "__VIEWSTATEGENERATOR"),
        eventValidation: extractHidden(doc, "__EVENTVALIDATION")
      };
    };

    const parseTotalPages = (doc) => {
      // Example: "Displaying page 1 of 3, items 1 to 2 of 6."
      const pagerText =
        doc.querySelector(".PagerRight_Default")?.textContent ||
        doc.querySelector("tr.GridPager_Default")?.textContent ||
        "";

      const m = pagerText.match(/Displaying\s+page\s+(\d+)\s+of\s+(\d+)/i);
      if (!m) return { current: 1, total: 1 };

      const current = safeInt(m[1], 1);
      const total = safeInt(m[2], 1);
      return { current, total };
    };

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const out = [];

      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) continue;

        const code = okText(cells[0]?.textContent);
        const name = okText(cells[1]?.textContent);
        if (!code && !name) continue;

        out.push({ code, statutoryName: name });
      }
      return out;
    };

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/StatutoryItems.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Statutory Items screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args (string-only)
     * ------------------------------------------------- */
    const statutoryCode = okText(args?.statutoryCode);
    const statutoryName = okText(args?.statutoryName);

    const returnAll = isTruthy(args?.returnAll || args?.showAll);
    const autoFetchAllPages =
      args?.autoFetchAllPages === undefined ? (returnAll ? "true" : "false") : okText(args?.autoFetchAllPages);

    const shouldAutoFetch = isTruthy(autoFetchAllPages);

    const pageNumber = safeInt(args?.pageNumber, 1);
    const pageSize = safeInt(args?.pageSize, 100);
    const maxPages = safeInt(args?.maxPages, 50);

    if (!returnAll && !statutoryCode && !statutoryName) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide either statutoryCode or statutoryName. To return all records, pass returnAll as 'true'/'all'/'available'/'existing'/'list'.",
        examples: {
          searchByCode: { statutoryCode: "000001" },
          searchByName: { statutoryName: "Tax" },
          returnAll: { returnAll: "all" }
        }
      };
    }

    /* -------------------------------------------------
     * 3) Initial page hidden fields
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("StatutoryItems");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/StatutoryItems.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/StatutoryItems.aspx`;

    /* -------------------------------------------------
     * 4) Determine criteria
     * ------------------------------------------------- */
    let searchCriteria = "STA_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (statutoryCode) {
        searchCriteria = "STA_CODE";
        searchValue = statutoryCode;
      } else {
        searchCriteria = "STA_NAME";
        searchValue = statutoryName;
      }
    } else {
      // keep a stable criteria for show-all
      searchCriteria = "STA_CODE";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 5) POST #1 (Search or Show All) -> page 1
     * ------------------------------------------------- */
    const postPage = async (state, eventTarget, gotoPageValue) => {
      const formData = new FormData();
      formData.append("scrollLeft", "0");
      formData.append("scrollTop", "0");
      formData.append("__EVENTTARGET", eventTarget || "");
      formData.append("__EVENTARGUMENT", "");
      formData.append("__VIEWSTATE", state.viewState);
      formData.append("__VIEWSTATEGENERATOR", state.viewStateGen);
      formData.append("__VIEWSTATEENCRYPTED", "");
      formData.append("__EVENTVALIDATION", state.eventValidation);

      formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      formData.append("ctl00$hdnQuickmenu", "1");

      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // IMPORTANT: Only on first call we click Search/Show All.
      // On later paging calls, we just postback via GoToPageLinkButton.
      if (!eventTarget) {
        if (returnAll) formData.append("ctl00$body$ContentSearch$butAll", "Show All");
        else formData.append("ctl00$body$ContentSearch$butSearch", "Search");
      }

      // RadGrid paging fields
      const pageToSet = gotoPageValue ? String(gotoPageValue) : "1";
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", pageToSet);
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      // Use bigger page size but server may cap; still fine (we will page-loop anyway)
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const resp = await fetch(url, { method: "POST", headers, body: formData });
      const html = await resp.text();
      return extractState(html);
    };

    // initial state from getApiList
    let state = {
      viewState: details.viewState,
      viewStateGen: details.viewStateGen,
      eventValidation: details.eventValidation
    };

    // 1st request
    let pageState = await postPage(state, "", "1");
    state = pageState;

    /* -------------------------------------------------
     * 6) Decide paging approach
     * ------------------------------------------------- */
    const { total } = parseTotalPages(state.doc);
    const boundedTotal = Math.min(total, maxPages);

    // If not returnAll, we only need the current page’s content (already page 1).
    // But user may request a specific pageNumber (without returnAll)
    // -> go to that page using GoToPageLinkButton.
    const goToButtonTarget = "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton";

    const fetchSpecificPageIfNeeded = async () => {
      if (pageNumber <= 1) return state;
      const nextState = await postPage(state, goToButtonTarget, pageNumber);
      state = nextState;
      return state;
    };

    if (!returnAll) {
      await fetchSpecificPageIfNeeded();

      // extract + filter within that page
      const rows = extractRows(state.doc);

      const final = rows.filter((r) => {
        if (statutoryCode) return r.code === statutoryCode; // exact
        if (statutoryName) return r.statutoryName.toLowerCase().includes(statutoryName.toLowerCase()); // partial
        return true;
      });

      if (final.length === 0) {
        return {
          status: "NOT_FOUND",
          message: `No Statutory Items found matching "${searchValue}"`,
          searchCriteria,
          searchValue
        };
      }

      return {
        status: "SUCCESS",
        message: `Found ${final.length} Statutory Item(s).`,
        mode: statutoryCode ? "CODE_SEARCH" : "NAME_SEARCH",
        pageNumber: String(pageNumber),
        count: final.length,
        statutoryItems: final
      };
    }

    // returnAll mode:
    // - if autoFetchAllPages true => loop all pages and aggregate
    // - else => return only current page and provide nextPage + moreAvailable
    if (!shouldAutoFetch) {
      const pageRows = extractRows(state.doc);
      return {
        status: "SUCCESS",
        message: `Returned ${pageRows.length} Statutory Item(s) from page 1.`,
        mode: "ALL_PAGE",
        pageNumber: "1",
        totalPages: String(total),
        moreAvailable: total > 1 ? "true" : "false",
        nextPage: total > 1 ? "2" : "",
        count: pageRows.length,
        statutoryItems: pageRows
      };
    }

    /* -------------------------------------------------
     * 7) Auto-loop pages (FIX for “page 1 only”)
     * ------------------------------------------------- */
    const map = new Map();
    const addRows = (arr) => {
      for (const it of arr) {
        if (!map.has(it.code)) map.set(it.code, it);
      }
    };

    // page 1
    addRows(extractRows(state.doc));

    // pages 2..N
    for (let p = 2; p <= boundedTotal; p++) {
      const nextState = await postPage(state, goToButtonTarget, p);
      state = nextState;

      addRows(extractRows(state.doc));
    }

    const allItems = Array.from(map.values());

    return {
      status: "SUCCESS",
      message: `Returned ${allItems.length} Statutory Item(s) across ${boundedTotal} page(s).`,
      mode: "ALL",
      totalPages: String(total),
      fetchedPages: String(boundedTotal),
      count: allItems.length,
      statutoryItems: allItems
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
