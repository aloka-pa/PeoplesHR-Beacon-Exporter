(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();
    const safeInt = (v, def = 1) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
    };

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
    }

    function parsePagerInfo(doc) {
      const pagerRight = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const text = pagerRight.replace(/\s+/g, " ").trim();
      const m = text.match(/Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+\d+\s+to\s+\d+\s+of\s+(\d+)/i);
      if (!m) return { currentPage: null, totalPages: null, totalItems: null, raw: text };
      return { currentPage: safeInt(m[1], 1), totalPages: safeInt(m[2], 1), totalItems: safeInt(m[3], 0), raw: text };
    }

    function extractGridRowsWithEditKey(doc) {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const results = [];
      for (const r of rows) {
        const tds = r.querySelectorAll("td");
        const districtCode = tds[0]?.textContent?.trim() || "";
        const districtName = tds[1]?.textContent?.trim() || "";
        const provinceName = tds[2]?.textContent?.trim() || "";

        const href = r.querySelector("a")?.getAttribute("href") || "";
        const editKey = href.match(/__doPostBack\('([^']+)'/)?.[1] || null;

        results.push({ districtCode, districtName, provinceName, editKey });
      }
      return results;
    }

    function matchRow(row, { districtCode, districtName, provinceName }) {
      const codeNeedle = toLower(districtCode);
      const distNeedle = toLower(districtName);
      const provNeedle = toLower(provinceName);

      const codeHay = toLower(row.districtCode);
      const distHay = toLower(row.districtName);
      const provHay = toLower(row.provinceName);

      // If code provided -> exact match
      if (!isEmpty(districtCode)) {
        return codeHay === codeNeedle;
      }

      // name/province searches -> partial
      const hasDist = !isEmpty(districtName);
      const hasProv = !isEmpty(provinceName);

      if (hasDist && hasProv) return distHay.includes(distNeedle) && provHay.includes(provNeedle);
      if (hasDist) return distHay.includes(distNeedle);
      return provHay.includes(provNeedle);
    }

    async function postAndParse(url, headers, formData) {
      const resp = await fetch(url, { method: "POST", headers, body: formData, redirect: "follow" });
      const html = await resp.text();
      const parser = new DOMParser();
      return parser.parseFromString(html, "text/html");
    }

    function buildBaseForm({ viewState, viewStateGen, eventValidation }) {
      const fd = new FormData();
      fd.append("scrollLeft", "0");
      fd.append("scrollTop", "0");
      fd.append("__EVENTTARGET", "");
      fd.append("__EVENTARGUMENT", "");
      fd.append("__VIEWSTATE", viewState);
      fd.append("__VIEWSTATEGENERATOR", viewStateGen);
      fd.append("__VIEWSTATEENCRYPTED", "");
      fd.append("__EVENTVALIDATION", eventValidation);
      fd.append("ctl00$hdnDateFormat", "dd/mm/yy");
      fd.append("ctl00$hdnQuickmenu", "1");
      return fd;
    }

    function findProvinceOption(detailDoc, { newProvinceCode, newProvinceName }) {
      const select = detailDoc.querySelector("#ctl00_body_dpcountry");
      if (!select) return { value: null, text: null, reason: "Province dropdown not found." };

      // Prefer code
      if (!isEmpty(newProvinceCode)) {
        const opt = Array.from(select.options).find((o) => okText(o.value) === okText(newProvinceCode));
        if (!opt) return { value: null, text: null, reason: "No matching province option for newProvinceCode." };
        return { value: opt.value, text: opt.textContent?.trim() || "" };
      }

      // Fallback: name contains match
      const needle = toLower(newProvinceName);
      const opt = Array.from(select.options).find((o) => toLower(o.textContent).includes(needle));
      if (!opt) return { value: null, text: null, reason: "No matching province option for newProvinceName." };
      return { value: opt.value, text: opt.textContent?.trim() || "" };
    }

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/District.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to District screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args validation
     * ------------------------------------------------- */
    const districtCode = okText(args?.districtCode);
    const districtName = okText(args?.districtName);
    const provinceName = okText(args?.provinceName);

    const newDistrictName = okText(args?.newDistrictName);
    const newProvinceCode = okText(args?.newProvinceCode);
    const newProvinceName = okText(args?.newProvinceName);

    const maxPages = safeInt(args?.maxPages, 75);
    const wantsProvinceChange = !isEmpty(newProvinceCode) || !isEmpty(newProvinceName);
    const wantsNameChange = !isEmpty(newDistrictName);

    if (isEmpty(districtCode) && isEmpty(districtName)) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide districtCode (exact) or districtName (partial) to locate the district record."
      };
    }

    if (!wantsNameChange && !wantsProvinceChange) {
      return {
        status: "INVALID_ARGS",
        message: "Please provide at least one update: newDistrictName and/or newProvinceCode/newProvinceName."
      };
    }

    /* -------------------------------------------------
     * 3) Build URL + Headers
     * ------------------------------------------------- */
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")("EIM/District.aspx");
    const url = updateurl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/District.aspx`;

    const headers = new Headers();
    headers.append(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    );
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    /* -------------------------------------------------
     * 4) Initial hidden fields
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("District");

    /* -------------------------------------------------
     * 5) Step A: Load grid (Search) on page 1
     *    Use criteria based on args to reduce server-side results
     * ------------------------------------------------- */
    let searchCriteria = "D.DISTRICT_CODE";
    let searchValue = "";

    if (!isEmpty(districtCode)) {
      searchCriteria = "D.DISTRICT_CODE";
      searchValue = districtCode;
    } else if (!isEmpty(districtName)) {
      searchCriteria = "D.DISTRICT_NAME";
      searchValue = districtName;
    } else if (!isEmpty(provinceName)) {
      searchCriteria = "P.PROVINCE_NAME";
      searchValue = provinceName;
    }

    const firstFormData = new FormData();
    firstFormData.append("scrollLeft", "0");
    firstFormData.append("scrollTop", "0");
    firstFormData.append("__EVENTTARGET", "");
    firstFormData.append("__EVENTARGUMENT", "");
    firstFormData.append("__VIEWSTATE", details.viewState);
    firstFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    firstFormData.append("__VIEWSTATEENCRYPTED", "");
    firstFormData.append("__EVENTVALIDATION", details.eventValidation);

    firstFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    firstFormData.append("ctl00$hdnQuickmenu", "1");

    firstFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    firstFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);
    firstFormData.append("ctl00$body$ContentSearch$butSearch", "Search");

    // pager defaults
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    firstFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    firstFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    firstFormData.append("ctl00_body_grdsummary_ClientState", "");

    let gridDoc = await postAndParse(url, headers, firstFormData);

    let vs = getHidden(gridDoc, "#__VIEWSTATE");
    let ev = getHidden(gridDoc, "#__EVENTVALIDATION");
    let vsg = getHidden(gridDoc, "#__VIEWSTATEGENERATOR");

    if (!vs || !ev || !vsg) {
      return { status: "ERROR", message: "Failed to load District grid state (missing ASP.NET hidden fields)." };
    }

    const pager = parsePagerInfo(gridDoc);
    const totalPages = Math.min(pager.totalPages || 1, maxPages);

    /* -------------------------------------------------
     * 6) Step B: Find matching row across pages
     * ------------------------------------------------- */
    let selectedRow = null;
    let selectedPage = 1;

    for (let p = 1; p <= totalPages; p++) {
      let docP = gridDoc;

      if (p > 1) {
        const gotoFD = buildBaseForm({ viewState: vs, viewStateGen: vsg, eventValidation: ev });
        gotoFD.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");

        // keep search context
        gotoFD.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
        gotoFD.append("ctl00$body$ContentSearch$txtContent", searchValue);

        gotoFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(p));
        gotoFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
        gotoFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
        gotoFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
        gotoFD.append("ctl00_body_grdsummary_ClientState", "");

        docP = await postAndParse(url, headers, gotoFD);

        // update state
        vs = getHidden(docP, "#__VIEWSTATE");
        ev = getHidden(docP, "#__EVENTVALIDATION");
        vsg = getHidden(docP, "#__VIEWSTATEGENERATOR");
      }

      const rows = extractGridRowsWithEditKey(docP);
      const match = rows.find((r) => r.editKey && matchRow(r, { districtCode, districtName, provinceName }));

      if (match) {
        selectedRow = match;
        selectedPage = p;
        gridDoc = docP;
        break;
      }
    }

    if (!selectedRow) {
      return {
        status: "NOT_FOUND",
        message: "No matching district record found for the given search criteria."
      };
    }

    /* -------------------------------------------------
     * 7) Step C: Click grid edit icon (row select)
     * ------------------------------------------------- */
    const clickRowFD = buildBaseForm({ viewState: vs, viewStateGen: vsg, eventValidation: ev });
    clickRowFD.set("__EVENTTARGET", selectedRow.editKey);

    // keep search context + pager context (as in your payload)
    clickRowFD.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    clickRowFD.append("ctl00$body$ContentSearch$txtContent", searchValue);
    clickRowFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(selectedPage));
    clickRowFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    clickRowFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    clickRowFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    clickRowFD.append("ctl00_body_grdsummary_ClientState", "");

    let detailDoc = await postAndParse(url, headers, clickRowFD);

    let dvs = getHidden(detailDoc, "#__VIEWSTATE");
    let dev = getHidden(detailDoc, "#__EVENTVALIDATION");
    let dvsg = getHidden(detailDoc, "#__VIEWSTATEGENERATOR");

    if (!dvs || !dev || !dvsg) {
      return { status: "ERROR", message: "Failed to open district record (missing hidden fields after row click)." };
    }

    /* -------------------------------------------------
     * 8) Step D: Click Edit button
     * ------------------------------------------------- */
    const editFD = buildBaseForm({ viewState: dvs, viewStateGen: dvsg, eventValidation: dev });
    editFD.append("ctl00$body$butEdit", "Edit");

    detailDoc = await postAndParse(url, headers, editFD);

    dvs = getHidden(detailDoc, "#__VIEWSTATE");
    dev = getHidden(detailDoc, "#__EVENTVALIDATION");
    dvsg = getHidden(detailDoc, "#__VIEWSTATEGENERATOR");

    if (!dvs || !dev || !dvsg) {
      return { status: "ERROR", message: "Failed to enter edit mode (missing hidden fields after Edit click)." };
    }

    /* -------------------------------------------------
     * 9) Step E: Resolve current + new values
     * ------------------------------------------------- */
    const currentName = detailDoc.querySelector("#ctl00_body_txtName")?.value?.trim() || selectedRow.districtName;
    const currentProvinceSelect = detailDoc.querySelector("#ctl00_body_dpcountry");
    const currentProvinceCode = currentProvinceSelect?.value?.trim() || "";
    const currentProvinceName = currentProvinceSelect?.selectedOptions?.[0]?.textContent?.trim() || selectedRow.provinceName;

    let finalName = currentName;
    if (wantsNameChange) finalName = newDistrictName;

    let finalProvinceCode = currentProvinceCode;
    let finalProvinceName = currentProvinceName;

    if (wantsProvinceChange) {
      const found = findProvinceOption(detailDoc, { newProvinceCode, newProvinceName });
      if (!found.value) {
        return {
          status: "INVALID_ARGS",
          message: found.reason || "Invalid province selection.",
          current: { districtCode: selectedRow.districtCode, districtName: currentName, provinceCode: currentProvinceCode, provinceName: currentProvinceName }
        };
      }
      finalProvinceCode = found.value;
      finalProvinceName = found.text;
    }

    /* -------------------------------------------------
     * 10) Step F: Click Save with updated fields
     * ------------------------------------------------- */
    const saveFD = buildBaseForm({ viewState: dvs, viewStateGen: dvsg, eventValidation: dev });
    saveFD.append("ctl00$body$txtName", finalName);
    saveFD.append("ctl00$body$dpcountry", finalProvinceCode);
    saveFD.append("ctl00$body$butSave", "Save");

    const afterSaveDoc = await postAndParse(url, headers, saveFD);

    // Detect common ASP.NET validation summary / page messages (best-effort)
    const pageMsg =
      afterSaveDoc.querySelector("#ctl00_body_lblMessage")?.textContent?.trim() ||
      afterSaveDoc.querySelector(".alert")?.textContent?.trim() ||
      "";

    // Re-read fields if still present (sometimes stays in edit/view)
    const savedName = afterSaveDoc.querySelector("#ctl00_body_txtName")?.value?.trim() || finalName;
    const savedProvinceSelect = afterSaveDoc.querySelector("#ctl00_body_dpcountry");
    const savedProvinceCode = savedProvinceSelect?.value?.trim() || finalProvinceCode;
    const savedProvinceName = savedProvinceSelect?.selectedOptions?.[0]?.textContent?.trim() || finalProvinceName;

    return {
      status: "SUCCESS",
      message: pageMsg || "District updated successfully.",
      updated: {
        districtCode: selectedRow.districtCode,
        districtName: savedName,
        provinceCode: savedProvinceCode,
        provinceName: savedProvinceName
      },
      previous: {
        districtCode: selectedRow.districtCode,
        districtName: currentName,
        provinceCode: currentProvinceCode,
        provinceName: currentProvinceName
      },
      matchedBy: !isEmpty(districtCode)
        ? { districtCode: districtCode }
        : { districtName: districtName || null, provinceName: provinceName || null }
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
});
