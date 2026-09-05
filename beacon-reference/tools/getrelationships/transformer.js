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

    const safeInt = (v, def = 1) => {
      const n = Number(okText(v));
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    const extractHidden = (doc, name) =>
      doc.querySelector(`input[name="${name}"]`)?.getAttribute("value") || "";

    const parseHtmlState = (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return {
        doc,
        viewState: extractHidden(doc, "__VIEWSTATE"),
        viewStateGen: extractHidden(doc, "__VIEWSTATEGENERATOR"),
        eventValidation: extractHidden(doc, "__EVENTVALIDATION")
      };
    };

    const parsePager = (doc) => {
      // "Displaying page 1 of 3, items 1 to 4 of 9."
      const pagerText =
        doc.querySelector(".PagerRight_Default")?.textContent ||
        doc.querySelector("tr.GridPager_Default")?.textContent ||
        "";

      const m = pagerText.match(/Displaying\s+page\s+(\d+)\s+of\s+(\d+)/i);
      if (!m) return { current: 1, total: 1 };

      return {
        current: safeInt(m[1], 1),
        total: safeInt(m[2], 1)
      };
    };

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdSummary_ctl00__']");
      const out = [];

      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) continue;

        const code = okText(cells[0]?.textContent);
        const name = okText(cells[1]?.textContent);
        if (!code && !name) continue;

        out.push({ code, relationshipName: name });
      }
      return out;
    };

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Relationship.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Relationship screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args (strings)
     * ------------------------------------------------- */
    const relationshipCode = okText(args?.relationshipCode);
    const relationshipName = okText(args?.relationshipName);

    const returnAll = isTruthy(args?.returnAll || args?.showAll);

    // Optional paging controls
    const pageSize = safeInt(args?.pageSize, 100); // server may cap, but ok
    const maxPages = safeInt(args?.maxPages, 50);

    if (!returnAll && !relationshipCode && !relationshipName) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide either relationshipCode or relationshipName. To return all records, pass returnAll as 'true'/'all'/'available'/'existing'/'list'.",
        examples: {
          searchByCode: { relationshipCode: "000001" },
          searchByName: { relationshipName: "Father" },
          returnAll: { returnAll: "all" }
        }
      };
    }

    /* -------------------------------------------------
     * 3) Initial page hidden fields
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Relationship");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Relationship.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Relationship.aspx`;

    /* -------------------------------------------------
     * 4) Determine criteria
     * ------------------------------------------------- */
    let searchCriteria = "REL_ID";
    let searchValue = "";

    if (!returnAll) {
      if (relationshipCode) {
        searchCriteria = "REL_ID";
        searchValue = relationshipCode;
      } else {
        searchCriteria = "REL_NAME";
        searchValue = relationshipName;
      }
    } else {
      // stable defaults for Show All
      searchCriteria = "REL_ID";
      searchValue = "";
    }

    /* -------------------------------------------------
     * 5) Post helper (Search/Show All and GoToPage)
     * ------------------------------------------------- */
    const goToBtnTarget = "ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageLinkButton";

    const postPage = async (state, eventTarget, gotoPage) => {
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
      formData.append("ctl00$body$hdnIsHead", "");
      formData.append("ctl00$body$hdnEditItemIndex", "");
      formData.append("ctl00_body_RadWindowManager1_ClientState", "");
      formData.append("ctl00$body$hdnDefCountry", "");

      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // Only for the FIRST request (no eventTarget), click Search / Show All.
      if (!eventTarget) {
        if (returnAll) formData.append("ctl00$body$ContentSearch$butAll", "Show All");
        else formData.append("ctl00$body$ContentSearch$butSearch", "Search");
      }

      const pageToSet = gotoPage ? String(gotoPage) : "1";

      formData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", pageToSet);
      formData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      formData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdSummary_ClientState", "");

      const resp = await fetch(url, { method: "POST", headers, body: formData });
      const html = await resp.text();
      return parseHtmlState(html);
    };

    /* -------------------------------------------------
     * 6) First request (page 1)
     * ------------------------------------------------- */
    let state = {
      viewState: details.viewState,
      viewStateGen: details.viewStateGen,
      eventValidation: details.eventValidation
    };

    state = await postPage(state, "", 1);

    /* -------------------------------------------------
     * 7) If NOT returnAll -> filter page 1 only (or exact match)
     * ------------------------------------------------- */
    if (!returnAll) {
      const rows = extractRows(state.doc);

      const filtered = rows.filter((r) => {
        if (relationshipCode) return r.code === relationshipCode; // exact code
        return r.relationshipName.toLowerCase().includes(relationshipName.toLowerCase()); // partial name
      });

      if (filtered.length === 0) {
        return {
          status: "NOT_FOUND",
          message: `No Relationships found matching "${searchValue}"`,
          searchCriteria,
          searchValue
        };
      }

      return {
        status: "SUCCESS",
        message: `Found ${filtered.length} Relationship(s).`,
        searchCriteria,
        searchValue,
        count: filtered.length,
        relationships: filtered
      };
    }

    /* -------------------------------------------------
     * 8) returnAll -> loop ALL pages and aggregate
     * ------------------------------------------------- */
    const { total } = parsePager(state.doc);
    const totalToFetch = Math.min(total, maxPages);

    const map = new Map();
    const addRows = (arr) => {
      for (const it of arr) {
        if (!map.has(it.code)) map.set(it.code, it);
      }
    };

    // page 1 rows
    addRows(extractRows(state.doc));

    // pages 2..N using GoToPageLinkButton
    for (let p = 2; p <= totalToFetch; p++) {
      state = await postPage(state, goToBtnTarget, p);
      addRows(extractRows(state.doc));
    }

    const all = Array.from(map.values());

    return {
      status: "SUCCESS",
      message: `Returned ${all.length} Relationship(s) across ${totalToFetch} page(s).`,
      searchCriteria: "ALL",
      searchValue: "",
      totalPages: String(total),
      fetchedPages: String(totalToFetch),
      count: all.length,
      relationships: all
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
