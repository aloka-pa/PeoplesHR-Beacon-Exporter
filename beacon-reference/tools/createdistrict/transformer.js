(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers (string-only args)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const isEmpty = (v) => okText(v) === "";
    const toLower = (v) => okText(v).toLowerCase();

    const parseBool = (v, def = false) => {
      const t = toLower(v);
      if (t === "true" || t === "1" || t === "yes") return true;
      if (t === "false" || t === "0" || t === "no") return false;
      return def;
    };

    function getHidden(doc, sel) {
      return doc.querySelector(sel)?.value || "";
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

    function resolveProvince(detailDoc, { provinceCode, provinceName }) {
      const select = detailDoc.querySelector("#ctl00_body_dpcountry");
      if (!select) return { ok: false, message: "Province dropdown not found." };

      // Prefer code
      if (!isEmpty(provinceCode)) {
        const opt = Array.from(select.options).find((o) => okText(o.value) === okText(provinceCode));
        if (!opt) return { ok: false, message: "No matching province option for provinceCode." };
        if (okText(opt.value) === "-1") return { ok: false, message: "Invalid province selection (-1)." };
        return { ok: true, value: opt.value, text: opt.textContent?.trim() || "" };
      }

      // Fallback: name contains match (case-insensitive)
      const needle = toLower(provinceName);
      const opt = Array.from(select.options).find((o) => toLower(o.textContent).includes(needle));
      if (!opt) return { ok: false, message: "No matching province option for provinceName." };
      if (okText(opt.value) === "-1") return { ok: false, message: "Invalid province selection (-1)." };
      return { ok: true, value: opt.value, text: opt.textContent?.trim() || "" };
    }

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/District.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args (ALL STRING)
     * ------------------------------------------------- */
    const districtName = okText(args?.districtName);
    const provinceCode = okText(args?.provinceCode);
    const provinceName = okText(args?.provinceName);

    const openFromSearch = parseBool(args?.openFromSearch, false);
    const searchDistrictName = okText(args?.searchDistrictName);

    if (isEmpty(districtName)) {
      return { status: "INVALID_ARGS", message: "districtName is required." };
    }

    if (isEmpty(provinceCode) && isEmpty(provinceName)) {
      return { status: "INVALID_ARGS", message: "Please provide either provinceCode or provinceName." };
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
     * 5) Load a page render to obtain current VIEWSTATE
     *    Optionally do Search first (like your network capture)
     * ------------------------------------------------- */
    let docBeforeNew;

    if (openFromSearch) {
      const searchFD = new FormData();
      searchFD.append("scrollLeft", "0");
      searchFD.append("scrollTop", "0");
      searchFD.append("__EVENTTARGET", "");
      searchFD.append("__EVENTARGUMENT", "");
      searchFD.append("__VIEWSTATE", details.viewState);
      searchFD.append("__VIEWSTATEGENERATOR", details.viewStateGen);
      searchFD.append("__VIEWSTATEENCRYPTED", "");
      searchFD.append("__EVENTVALIDATION", details.eventValidation);

      searchFD.append("ctl00$hdnDateFormat", "dd/mm/yy");
      searchFD.append("ctl00$hdnQuickmenu", "1");

      searchFD.append("ctl00$body$ContentSearch$cboCriteria", "D.DISTRICT_NAME");
      searchFD.append("ctl00$body$ContentSearch$txtContent", searchDistrictName || "");
      searchFD.append("ctl00$body$ContentSearch$butSearch", "Search");

      searchFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      searchFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      searchFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
      searchFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      searchFD.append("ctl00_body_grdsummary_ClientState", "");

      docBeforeNew = await postAndParse(url, headers, searchFD);
    } else {
      const landingFD = new FormData();
      landingFD.append("scrollLeft", "0");
      landingFD.append("scrollTop", "0");
      landingFD.append("__EVENTTARGET", "");
      landingFD.append("__EVENTARGUMENT", "");
      landingFD.append("__VIEWSTATE", details.viewState);
      landingFD.append("__VIEWSTATEGENERATOR", details.viewStateGen);
      landingFD.append("__VIEWSTATEENCRYPTED", "");
      landingFD.append("__EVENTVALIDATION", details.eventValidation);

      landingFD.append("ctl00$hdnDateFormat", "dd/mm/yy");
      landingFD.append("ctl00$hdnQuickmenu", "1");

      landingFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      landingFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      landingFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
      landingFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      landingFD.append("ctl00_body_grdsummary_ClientState", "");

      docBeforeNew = await postAndParse(url, headers, landingFD);
    }

    let vs = getHidden(docBeforeNew, "#__VIEWSTATE");
    let ev = getHidden(docBeforeNew, "#__EVENTVALIDATION");
    let vsg = getHidden(docBeforeNew, "#__VIEWSTATEGENERATOR");

    if (!vs || !ev || !vsg) {
      return { status: "ERROR", message: "Failed to load District page state (missing ASP.NET hidden fields)." };
    }

    /* -------------------------------------------------
     * 6) Click New
     * ------------------------------------------------- */
    const newFD = buildBaseForm({ viewState: vs, viewStateGen: vsg, eventValidation: ev });

    if (openFromSearch) {
      newFD.append("ctl00$body$ContentSearch$cboCriteria", "D.DISTRICT_NAME");
      newFD.append("ctl00$body$ContentSearch$txtContent", searchDistrictName || "");
      newFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      newFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      newFD.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
      newFD.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      newFD.append("ctl00_body_grdsummary_ClientState", "");
    }

    newFD.append("ctl00$body$butNew", "New");

    const newDoc = await postAndParse(url, headers, newFD);

    let nvs = getHidden(newDoc, "#__VIEWSTATE");
    let nev = getHidden(newDoc, "#__EVENTVALIDATION");
    let nvsg = getHidden(newDoc, "#__VIEWSTATEGENERATOR");

    if (!nvs || !nev || !nvsg) {
      return { status: "ERROR", message: "Failed to open New District form (missing hidden fields)." };
    }

    /* -------------------------------------------------
     * 7) Resolve province option from New form
     * ------------------------------------------------- */
    const provinceResolved = resolveProvince(newDoc, { provinceCode, provinceName });
    if (!provinceResolved.ok) {
      return { status: "INVALID_ARGS", message: provinceResolved.message };
    }

    /* -------------------------------------------------
     * 8) Save new record
     * ------------------------------------------------- */
    const saveFD = buildBaseForm({ viewState: nvs, viewStateGen: nvsg, eventValidation: nev });
    saveFD.append("ctl00$body$txtName", districtName);
    saveFD.append("ctl00$body$dpcountry", provinceResolved.value);
    saveFD.append("ctl00$body$butSave", "Save");

    const afterSaveDoc = await postAndParse(url, headers, saveFD);

    const pageMsg =
      afterSaveDoc.querySelector("#ctl00_body_lblMessage")?.textContent?.trim() ||
      afterSaveDoc.querySelector(".alert")?.textContent?.trim() ||
      "";

    const savedName = afterSaveDoc.querySelector("#ctl00_body_txtName")?.value?.trim() || districtName;

    const savedProvinceSelect = afterSaveDoc.querySelector("#ctl00_body_dpcountry");
    const savedProvinceCode = savedProvinceSelect?.value?.trim() || provinceResolved.value;
    const savedProvinceName = savedProvinceSelect?.selectedOptions?.[0]?.textContent?.trim() || provinceResolved.text;

    const savedDistrictCode =
      afterSaveDoc.querySelector("#ctl00_body_txtCode")?.value?.trim() ||
      afterSaveDoc.querySelector("#ctl00_body_txtDistrict")?.value?.trim() ||
      null;

    return {
      status: "SUCCESS",
      message: pageMsg || "District created successfully.",
      created: {
        districtCode: savedDistrictCode,
        districtName: savedName,
        provinceCode: savedProvinceCode,
        provinceName: savedProvinceName
      }
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
});
