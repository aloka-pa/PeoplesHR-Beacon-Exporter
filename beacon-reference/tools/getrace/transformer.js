(async function (data, args, reqOptions) {
  try {
    /* ---------------------------------------------
     * 0) Helpers
     * --------------------------------------------- */
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

    const extractHidden = (doc, selector) => doc.querySelector(selector)?.value || "";

    const parsePager = (doc) => {
      const pagerText =
        doc.querySelector(".PagerRight_Default")?.textContent ||
        doc.querySelector("tr.GridPager_Default")?.textContent ||
        "";
      const m = pagerText.match(/Displaying\s+page\s+(\d+)\s+of\s+(\d+)/i);
      if (!m) return { current: 1, total: 1 };
      return { current: safeInt(m[1], 1), total: safeInt(m[2], 1) };
    };

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const out = [];
      for (const r of rows) {
        const cells = r.querySelectorAll("td");
        const code = okText(cells[0]?.textContent);
        const name = okText(cells[1]?.textContent);
        if (!code && !name) continue;
        out.push({ raceCode: code, raceName: name });
      }
      return out;
    };

    const parseHtmlState = (html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return {
        doc,
        viewState: extractHidden(doc, "#__VIEWSTATE"),
        eventValidation: extractHidden(doc, "#__EVENTVALIDATION"),
        viewStateGenerator: extractHidden(doc, "#__VIEWSTATEGENERATOR"),
        viewStateEncrypted: extractHidden(doc, "#__VIEWSTATEENCRYPTED") || ""
      };
    };

    /* ---------------------------------------------
     * 1) Access control
     * --------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Race.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Race. Please contact HR Admin."
      };
    }

    /* ---------------------------------------------
     * 2) Args (strings only)
     * --------------------------------------------- */
    const raceCode = okText(args?.raceCode);
    const searchRaceName = okText(args?.searchRaceName);

    const returnAll = isTruthy(args?.returnAll || args?.showAll);

    // Optional safety controls
    const pageSize = safeInt(args?.pageSize, 100);   // server may cap
    const maxPages = safeInt(args?.maxPages, 50);    // loop safety cap

    if (!returnAll && !raceCode && !searchRaceName) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide either raceCode or searchRaceName. To return all records, pass returnAll as 'true' or 'all'.",
        examples: {
          searchByCode: { raceCode: "000001" },
          searchByName: { searchRaceName: "asian" },
          returnAll: { returnAll: "all" }
        }
      };
    }

    /* ---------------------------------------------
     * 3) Build URL
     * --------------------------------------------- */
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Race.aspx");
    const url = updateurl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Race.aspx`;

    const headersCommon = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0"
    };

    /* ---------------------------------------------
     * 4) GET tokens (ViewState etc.)
     * --------------------------------------------- */
    const getRes = await fetch(url, { method: "GET", headers: headersCommon });
    const getHtml = await getRes.text();
    let state = parseHtmlState(getHtml);

    if (!state.viewState || !state.eventValidation || !state.viewStateGenerator) {
      return {
        status: "ERROR",
        message: "Failed to load Race page tokens (VIEWSTATE/EVENTVALIDATION missing)."
      };
    }

    /* ---------------------------------------------
     * 5) Determine search criteria
     * --------------------------------------------- */
    const isSearchByCode = !!raceCode;
    const searchCriteria = returnAll
      ? "RAC_CODE" // can be any valid criteria
      : (isSearchByCode ? "RAC_CODE" : "RAC_NAME");

    const searchValue = returnAll ? "" : (isSearchByCode ? raceCode : searchRaceName);

    const goToBtnTarget = "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton";

    /* ---------------------------------------------
     * 6) POST helper
     *    - First call: eventTarget="" and include Search/ShowAll button
     *    - Next pages: eventTarget=GoToPageLinkButton, set GoToPageTextBox
     * --------------------------------------------- */
    const postPage = async (eventTarget, gotoPage) => {
      const formData = new FormData();
      formData.append("scrollLeft", "0");
      formData.append("scrollTop", "0");

      formData.append("__EVENTTARGET", eventTarget || "");
      formData.append("__EVENTARGUMENT", "");

      formData.append("__VIEWSTATE", state.viewState);
      formData.append("__VIEWSTATEGENERATOR", state.viewStateGenerator);
      formData.append("__VIEWSTATEENCRYPTED", state.viewStateEncrypted);
      formData.append("__EVENTVALIDATION", state.eventValidation);

      formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      formData.append("ctl00$hdnQuickmenu", "1");

      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", searchValue);

      // Only on the FIRST request (no eventTarget) we click a button
      if (!eventTarget) {
        if (returnAll) formData.append("ctl00$body$ContentSearch$butAll", "Show All");
        else formData.append("ctl00$body$ContentSearch$butSearch", "Search");
      }

      const pageToSet = gotoPage ? String(gotoPage) : "1";

      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", pageToSet);
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");

      formData.append("ctl00_body_grdsummary_ClientState", "");

      const postRes = await fetch(url, {
        method: "POST",
        headers: { ...headersCommon, "x-requested-with": "XMLHttpRequest" },
        body: formData
      });

      const html = await postRes.text();
      state = parseHtmlState(html);

      if (!state.viewState || !state.eventValidation || !state.viewStateGenerator) {
        throw new Error("Postback returned missing VIEWSTATE/EVENTVALIDATION.");
      }

      return state.doc;
    };

    /* ---------------------------------------------
     * 7) First POST (page 1)
     * --------------------------------------------- */
    const doc1 = await postPage("", 1);
    const rows1 = extractRows(doc1);

    if (!rows1 || rows1.length === 0) {
      return {
        status: "NOT_FOUND",
        message: returnAll ? "No Race records found." : `No races found matching "${searchValue}"`,
        searchBy: returnAll ? "all" : (isSearchByCode ? "code" : "name"),
        searchValue: returnAll ? "" : searchValue
      };
    }

    /* ---------------------------------------------
     * 8) If NOT returnAll -> filter page 1 results and return
     * --------------------------------------------- */
    if (!returnAll) {
      const nameLower = lower(searchRaceName);
      const filtered = rows1.filter((r) => {
        if (isSearchByCode) return r.raceCode === raceCode;
        return lower(r.raceName).includes(nameLower);
      });

      if (filtered.length === 0) {
        return {
          status: "NOT_FOUND",
          message: `No races found matching "${searchValue}"`,
          searchBy: isSearchByCode ? "code" : "name",
          searchValue
        };
      }

      return {
        status: "SUCCESS",
        message: `Found ${filtered.length} matching Race record(s)`,
        searchBy: isSearchByCode ? "code" : "name",
        searchValue,
        count: filtered.length,
        races: filtered
      };
    }

    /* ---------------------------------------------
     * 9) returnAll -> loop pages 2..N and aggregate
     * --------------------------------------------- */
    const { total } = parsePager(doc1);
    const totalToFetch = Math.min(total, maxPages);

    const map = new Map();
    const add = (arr) => {
      for (const it of arr) {
        if (!map.has(it.raceCode)) map.set(it.raceCode, it);
      }
    };

    add(rows1);

    for (let p = 2; p <= totalToFetch; p++) {
      const docP = await postPage(goToBtnTarget, p);
      add(extractRows(docP));
    }

    const all = Array.from(map.values());

    return {
      status: "SUCCESS",
      message: `Returned ${all.length} Race record(s) across ${totalToFetch} page(s).`,
      searchBy: "all",
      searchValue: "",
      totalPages: String(total),
      fetchedPages: String(totalToFetch),
      count: all.length,
      races: all
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
