(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access control
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Electorate.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Electorate screen. Please contact HR Admin."
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
      // "Displaying page 2 of 6, items 6 to 10 of 28."
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
      const allRows = Array.from(doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
      const out = [];
      for (const row of allRows) {
        const tds = row.querySelectorAll("td");
        const rowCode = ok(tds[0]?.textContent);
        const rowName = ok(tds[1]?.textContent);
        const rowDistrict = ok(tds[2]?.textContent);
        out.push({ code: rowCode, electorateName: rowName, district: rowDistrict, _rowEl: row });
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
    const codeRaw = ok(args?.electorateCode);
    const nameRaw = ok(args?.electorateName);
    const districtRaw = ok(args?.districtName);

    const fetchDetails = (low(args?.fetchDetails) === "no") ? "no" : "yes";

    const allKeywords = new Set(["all", "available", "existing", "list", "show all", "*"]);
    const returnAllExplicit = (low(args?.returnAll) === "yes" || low(args?.returnAll) === "true");
    const keywordTriggered =
      allKeywords.has(low(codeRaw)) || allKeywords.has(low(nameRaw)) || allKeywords.has(low(districtRaw));
    const returnAll = returnAllExplicit || keywordTriggered;

    if (!returnAll && isEmpty(codeRaw) && isEmpty(nameRaw) && isEmpty(districtRaw)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide electorateCode OR electorateName OR districtName, or set returnAll='yes'."
      };
    }

    const providedCount = [codeRaw, nameRaw, districtRaw].filter(v => !isEmpty(v)).length;
    if (!returnAll && providedCount > 1) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide only ONE of electorateCode, electorateName, or districtName (or use returnAll='yes')."
      };
    }

    /* -------------------------------------------------
     * 4) Get initial hidden fields + URL
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Electorate");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Electorate.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Electorate.aspx`;

    /* -------------------------------------------------
     * 5) Build initial Search / Show All POST (page 1)
     * ------------------------------------------------- */
    let criteria = "ELECTORATE_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (!isEmpty(codeRaw)) {
        criteria = "ELECTORATE_CODE";
        searchValue = codeRaw;
      } else if (!isEmpty(nameRaw)) {
        criteria = "ELECTORATE_NAME";
        searchValue = nameRaw;
      } else {
        criteria = "D.DISTRICT_NAME";
        searchValue = districtRaw;
      }
    }

    const firstFd = buildBaseForm(details.viewState, details.viewStateGen, details.eventValidation);
    firstFd.append("ctl00$body$ContentSearch$cboCriteria", criteria);
    firstFd.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

    if (returnAll) firstFd.append("ctl00$body$ContentSearch$butAll", "Show All");
    else firstFd.append("ctl00$body$ContentSearch$butSearch", "Search");

    // Keep page 1
    firstFd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");

    const firstRes = await fetch(url, { method: "POST", headers, body: firstFd, redirect: "follow" });
    const firstHtml = await firstRes.text();
    let doc = parser.parseFromString(firstHtml, "text/html");

    let pagerMeta = parsePager(getPagerText(doc));
    const uiPageSize = extractUiPageSize(doc);

    /* -------------------------------------------------
     * 6) Collect results from page 1 (and filter if needed)
     * ------------------------------------------------- */
    const applyMatch = (rowObj) => {
      if (returnAll) return true;

      if (criteria === "ELECTORATE_CODE") return rowObj.code === searchValue;
      if (criteria === "ELECTORATE_NAME") return low(rowObj.electorateName).includes(low(searchValue));
      if (criteria === "D.DISTRICT_NAME") return low(rowObj.district).includes(low(searchValue));
      return false;
    };

    let pageRows = extractRows(doc);
    let results = pageRows.filter(applyMatch).map(({ _rowEl, ...x }) => x);

    /* -------------------------------------------------
     * 7) If returnAll, iterate through ALL pages using GoToPageLinkButton
     * ------------------------------------------------- */
    const goToPage = async (pageNo) => {
      const vs = getHidden(doc, "#__VIEWSTATE");
      const vsg = getHidden(doc, "#__VIEWSTATEGENERATOR");
      const ev = getHidden(doc, "#__EVENTVALIDATION");

      const fd = buildBaseForm(vs, vsg, ev);

      // preserve search context
      fd.append("ctl00$body$ContentSearch$cboCriteria", criteria);
      fd.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

      // preserve UI page size
      fd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(uiPageSize));

      // set page textbox + trigger Go postback
      fd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(pageNo));
      fd.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      fd.set("__EVENTARGUMENT", "");

      const res = await fetch(url, { method: "POST", headers, body: fd, redirect: "follow" });
      const html = await res.text();
      doc = parser.parseFromString(html, "text/html");
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
        message: returnAll ? "No electorates found." : "No electorates found matching the search criteria."
      };
    }

    /* -------------------------------------------------
     * 8) fetchDetails (only when exactly one match)
     * ------------------------------------------------- */
    if (!returnAll && results.length === 1 && fetchDetails !== "no") {
      const oneCode = results[0].code;

      const rowEls = Array.from(doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
      const matchedRow = rowEls.find(r => ok(r.querySelectorAll("td")[0]?.textContent) === oneCode);

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

        const detailRes = await fetch(url, { method: "POST", headers, body: openFD, redirect: "follow" });
        const detailHtml = await detailRes.text();
        const detailDoc = parser.parseFromString(detailHtml, "text/html");

        const detailCode =
          ok(detailDoc.querySelector("#ctl00_body_txtCode")?.value) || oneCode;

        const detailName =
          ok(detailDoc.querySelector("#ctl00_body_txtName")?.value) ||
          ok(detailDoc.querySelector("#ctl00_body_txtElectorate")?.value) ||
          results[0].electorateName;

        const detailDistrict =
          ok(detailDoc.querySelector("#ctl00_body_txtDistrict")?.value) ||
          ok(detailDoc.querySelector("#ctl00_body_cboDistrict")?.selectedOptions?.[0]?.textContent) ||
          results[0].district;

        return {
          status: "SUCCESS",
          count: 1,
          electorates: [{
            code: detailCode,
            electorateName: detailName,
            district: detailDistrict
          }]
        };
      }
    }

    /* -------------------------------------------------
     * 9) Return results
     * ------------------------------------------------- */
    return {
      status: "SUCCESS",
      message: returnAll
        ? `Found ${results.length} electorate(s) across ${pagerMeta.totalPages} page(s) (UI page size = ${uiPageSize}).`
        : `Found ${results.length} electorate(s).`,
      count: results.length,
      uiPageSize,
      totalPages: pagerMeta.totalPages,
      totalItems: pagerMeta.totalItems,
      electorates: results
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: e?.message || "Unexpected error occurred in Electorate transformer."
    };
  }
});
