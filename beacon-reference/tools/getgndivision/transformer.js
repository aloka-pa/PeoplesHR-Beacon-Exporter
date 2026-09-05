(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access control
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/GNDivision.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to GN Division screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Helpers (STRING ONLY)
     * ------------------------------------------------- */
    const ok = (v) => (v ?? "").toString().trim();
    const low = (v) => ok(v).toLowerCase();
    const isEmpty = (v) => ok(v) === "";
    const isNumStr = (v) => /^[0-9]+$/.test(ok(v));

    const getHidden = (doc, sel) => doc.querySelector(sel)?.value ?? "";

    const getPagerText = (doc) => ok(doc.querySelector(".PagerRight_Default")?.textContent);

    const parsePager = (pagerText) => {
      // Example: "Displaying page 2 of 6, items 6 to 10 of 28."
      const m = pagerText.match(/page\s+(\d+)\s+of\s+(\d+).*?of\s+(\d+)\./i);
      if (!m) return { page: 1, totalPages: 1, totalItems: null };
      return { page: Number(m[1]), totalPages: Number(m[2]), totalItems: Number(m[3]) };
    };

    const extractUiPageSize = (doc) => {
      const sel = 'input[name="ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox"]';
      const v = ok(doc.querySelector(sel)?.value);
      if (isNumStr(v)) return Number(v);

      const v2 = ok(doc.querySelector('input[id$="_ChangePageSizeTextBox_Value"]')?.value);
      if (isNumStr(v2)) return Number(v2);

      return 10;
    };

    const extractRows = (doc) => {
      const rows = Array.from(doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
      const out = [];
      for (const r of rows) {
        const tds = r.querySelectorAll("td");
        out.push({
          code: ok(tds[0]?.textContent),
          gnDivisionName: ok(tds[1]?.textContent),
          dsDivision: ok(tds[2]?.textContent),
          _rowEl: r
        });
      }
      return out;
    };

    const buildBaseForm = (vs, vsg, ev) => {
      const fd = new FormData();
      fd.append("scrollLeft", "0");
      fd.append("scrollTop", "0");
      fd.append("__EVENTTARGET", "");
      fd.append("__EVENTARGUMENT", "");
      fd.append("__VIEWSTATE", vs || "");
      fd.append("__VIEWSTATEGENERATOR", vsg || "");
      fd.append("__VIEWSTATEENCRYPTED", "");
      fd.append("__EVENTVALIDATION", ev || "");
      fd.append("ctl00$hdnDateFormat", "dd/mm/yy");
      fd.append("ctl00$hdnQuickmenu", "1");

      // Grid fields present in UI posts
      fd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      fd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      fd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
      fd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      fd.append("ctl00_body_grdsummary_ClientState", "");

      return fd;
    };

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 3) Normalize args + detect returnAll
     * ------------------------------------------------- */
    const codeRaw = ok(args?.gnDivisionCode);
    const gnNameRaw = ok(args?.gnDivisionName);
    const dsNameRaw = ok(args?.dsDivisionName);

    const fetchDetails = (low(args?.fetchDetails) === "no") ? "no" : "yes";

    const allKeywords = new Set(["all", "available", "existing", "list", "show all", "*"]);
    const returnAllExplicit = (low(args?.returnAll) === "yes" || low(args?.returnAll) === "true");
    const keywordTriggered =
      allKeywords.has(low(codeRaw)) || allKeywords.has(low(gnNameRaw)) || allKeywords.has(low(dsNameRaw));

    const returnAll = returnAllExplicit || keywordTriggered;

    if (!returnAll && isEmpty(codeRaw) && isEmpty(gnNameRaw) && isEmpty(dsNameRaw)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide gnDivisionCode OR gnDivisionName OR dsDivisionName, or set returnAll='yes'."
      };
    }

    const providedCount = [codeRaw, gnNameRaw, dsNameRaw].filter(v => !isEmpty(v)).length;
    if (!returnAll && providedCount > 1) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide only ONE of gnDivisionCode, gnDivisionName, or dsDivisionName (or use returnAll='yes')."
      };
    }

    /* -------------------------------------------------
     * 4) Initial hidden fields + URL
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("GNDivision");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/GNDivision.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/GNDivision.aspx`;

    /* -------------------------------------------------
     * 5) Determine criteria + search value
     * ------------------------------------------------- */
    let criteria = "GNDIV_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (!isEmpty(codeRaw)) {
        criteria = "GNDIV_CODE";
        searchValue = codeRaw;
      } else if (!isEmpty(gnNameRaw)) {
        criteria = "GNDIV_NAME";
        searchValue = gnNameRaw;
      } else {
        criteria = "D.DSDIV_NAME";
        searchValue = dsNameRaw;
      }
    }

    /* -------------------------------------------------
     * 6) First POST (Search / Show All) page 1
     * ------------------------------------------------- */
    const firstFd = buildBaseForm(details.viewState, details.viewStateGen, details.eventValidation);

    firstFd.append("ctl00$body$ContentSearch$cboCriteria", criteria);
    firstFd.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

    if (returnAll) firstFd.append("ctl00$body$ContentSearch$butAll", "Show All");
    else firstFd.append("ctl00$body$ContentSearch$butSearch", "Search");

    firstFd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");

    let res = await fetch(url, { method: "POST", headers, body: firstFd });
    let html = await res.text();
    let doc = parser.parseFromString(html, "text/html");

    let pagerMeta = parsePager(getPagerText(doc));
    const uiPageSize = extractUiPageSize(doc);

    /* -------------------------------------------------
     * 7) Filter + collect from page 1
     * ------------------------------------------------- */
    const applyMatch = (rowObj) => {
      if (returnAll) return true;

      if (criteria === "GNDIV_CODE") return rowObj.code === searchValue;
      if (criteria === "GNDIV_NAME") return low(rowObj.gnDivisionName).includes(low(searchValue));
      if (criteria === "D.DSDIV_NAME") return low(rowObj.dsDivision).includes(low(searchValue));
      return false;
    };

    let pageRows = extractRows(doc);
    let results = pageRows.filter(applyMatch).map(({ _rowEl, ...x }) => x);

    /* -------------------------------------------------
     * 8) If returnAll, iterate remaining pages (GoToPageLinkButton)
     * ------------------------------------------------- */
    const goToPage = async (pageNo) => {
      const vs = getHidden(doc, "#__VIEWSTATE");
      const vsg = getHidden(doc, "#__VIEWSTATEGENERATOR");
      const ev = getHidden(doc, "#__EVENTVALIDATION");

      const fd = buildBaseForm(vs, vsg, ev);

      // Preserve search context
      fd.append("ctl00$body$ContentSearch$cboCriteria", criteria);
      fd.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

      // Preserve UI page size
      fd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(uiPageSize));

      // Go to page
      fd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(pageNo));
      fd.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      fd.set("__EVENTARGUMENT", "");

      const r = await fetch(url, { method: "POST", headers, body: fd });
      const h = await r.text();
      doc = parser.parseFromString(h, "text/html");
      pagerMeta = parsePager(getPagerText(doc));
    };

    if (returnAll && pagerMeta.totalPages > 1) {
      for (let p = 2; p <= pagerMeta.totalPages; p++) {
        await goToPage(p);
        pageRows = extractRows(doc);
        const matches = pageRows.filter(applyMatch).map(({ _rowEl, ...x }) => x);
        results.push(...matches);
      }
    }

    if (results.length === 0) {
      return {
        status: "NOT_FOUND",
        message: returnAll ? "No GN Divisions found." : "No GN Divisions found matching the search criteria."
      };
    }

    /* -------------------------------------------------
     * 9) If one match and fetchDetails=yes, open record
     * ------------------------------------------------- */
    if (!returnAll && results.length === 1 && fetchDetails !== "no") {
      const target = results[0];

      const rowEls = Array.from(doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
      const matchedRow = rowEls.find(r => ok(r.querySelectorAll("td")[0]?.textContent) === target.code);

      const href = matchedRow?.querySelector("a")?.getAttribute("href") || "";
      const eventTarget = href.match(/__doPostBack\('([^']+)'/)?.[1];

      if (eventTarget) {
        const vs = getHidden(doc, "#__VIEWSTATE");
        const ev = getHidden(doc, "#__EVENTVALIDATION");
        const vg = getHidden(doc, "#__VIEWSTATEGENERATOR");

        const openFD = buildBaseForm(vs, vg, ev);
        openFD.set("__EVENTTARGET", eventTarget);
        openFD.set("__EVENTARGUMENT", "");

        openFD.append("ctl00$body$ContentSearch$cboCriteria", criteria);
        openFD.append("ctl00$body$ContentSearch$txtContent", searchValue);
        openFD.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(uiPageSize));

        const detailRes = await fetch(url, { method: "POST", headers, body: openFD });
        const detailHtml = await detailRes.text();
        const detailDoc = parser.parseFromString(detailHtml, "text/html");

        const detailCode =
          ok(detailDoc.querySelector("#ctl00_body_txtCode")?.value) || target.code;

        const detailName =
          ok(detailDoc.querySelector("#ctl00_body_txtName")?.value) || target.gnDivisionName;

        const dsDivisionCode =
          ok(detailDoc.querySelector("#ctl00_body_drpDSDivision")?.value) || null;

        let dsDivisionName = target.dsDivision;
        if (!isEmpty(dsDivisionCode)) {
          const opt = detailDoc.querySelector(`#ctl00_body_drpDSDivision option[value="${dsDivisionCode}"]`);
          dsDivisionName = ok(opt?.textContent) || dsDivisionName;
        }

        return {
          status: "SUCCESS",
          count: 1,
          uiPageSize,
          totalPages: pagerMeta.totalPages,
          totalItems: pagerMeta.totalItems,
          gnDivisions: [{
            code: detailCode,
            gnDivisionName: detailName,
            dsDivision: dsDivisionName,
            dsDivisionCode
          }]
        };
      }
    }

    /* -------------------------------------------------
     * 10) Return results
     * ------------------------------------------------- */
    return {
      status: "SUCCESS",
      message: returnAll
        ? `Found ${results.length} GN Division(s) across ${pagerMeta.totalPages} page(s) (UI page size = ${uiPageSize}).`
        : `Found ${results.length} GN Division(s).`,
      count: results.length,
      uiPageSize,
      totalPages: pagerMeta.totalPages,
      totalItems: pagerMeta.totalItems,
      gnDivisions: results
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: e?.message || "Unexpected error occurred in GN Division transformer."
    };
  }
});
