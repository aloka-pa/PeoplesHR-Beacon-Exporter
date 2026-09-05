(async function (data, args, reqOptions) {
  try {
    /* ----------------------------
     * 1) Access validation
     * ---------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Province.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Province screen. Please contact HR Admin."
      };
    }

    /* ----------------------------
     * 2) Input validation
     * ---------------------------- */
    if (!args?.provinceCode && !args?.provinceName) {
      return {
        status: "INVALID_ARGS",
        message: "Provide either provinceCode (exact) or provinceName (partial, case-insensitive)."
      };
    }

    const details = await BeaconBar.executeFunction("getApiList")("Province");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Province.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Province.aspx`;

    const parser = new DOMParser();

    const searchCriteria = args.provinceCode ? "PROVINCE_CODE" : "PROVINCE_NAME";
    const searchValue = (args.provinceCode || args.provinceName || "").trim();

    /* ----------------------------
     * Helpers
     * ---------------------------- */
    const lower = (s) => (s ?? "").toString().toLowerCase();

    function copyAllHiddenInputs(doc, formData) {
      doc.querySelectorAll("input[type='hidden']").forEach(h => {
        const n = h.getAttribute("name");
        if (n) formData.append(n, h.value ?? "");
      });
    }

    function getState(doc) {
      return {
        viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
        eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || "",
        viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || ""
      };
    }

    /* ----------------------------
     * 3) SEARCH
     * ---------------------------- */
    const searchFormData = new FormData();
    searchFormData.append("scrollLeft", "0");
    searchFormData.append("scrollTop", "0");
    searchFormData.append("__EVENTTARGET", "");
    searchFormData.append("__EVENTARGUMENT", "");
    searchFormData.append("__VIEWSTATE", details.viewState);
    searchFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    searchFormData.append("__VIEWSTATEENCRYPTED", "");
    searchFormData.append("__EVENTVALIDATION", details.eventValidation);
    searchFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    searchFormData.append("ctl00$hdnQuickmenu", "1");
    searchFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    searchFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);
    searchFormData.append("ctl00$body$ContentSearch$butSearch", "Search");
    // page controls (safe)
    searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "300");
    searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    searchFormData.append("ctl00_body_grdsummary_ClientState", "");

    const searchRes = await fetch(url, { method: "POST", headers, body: searchFormData });
    const searchHtml = await searchRes.text();
    const searchDoc = parser.parseFromString(searchHtml, "text/html");

    const rows = Array.from(searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
    if (rows.length === 0) {
      return { status: "NOT_FOUND", message: "No province rows found in grid.", searchedFor: searchValue };
    }

    // collect ALL matches (partial, case-insensitive for name; exact for code)
    const matches = [];
    for (const r of rows) {
      const tds = r.querySelectorAll("td");
      const rowCode = tds[0]?.textContent?.trim() || "";
      const rowName = tds[1]?.textContent?.trim() || "";
      const rowDistrictOrCountry = tds[2]?.textContent?.trim() || ""; // depends on grid columns

      let isMatch = false;
      if (args.provinceCode) {
        isMatch = rowCode === searchValue;
      } else {
        isMatch = lower(rowName).includes(lower(searchValue));
      }

      if (isMatch) {
        const href = r.querySelector("a")?.getAttribute("href") || "";
        const editTarget = href.match(/__doPostBack\('([^']+)'/)?.[1] || null;

        matches.push({
          code: rowCode,
          provinceName: rowName,
          extra: rowDistrictOrCountry,
          editTarget
        });
      }
    }

    if (matches.length === 0) {
      return {
        status: "NOT_FOUND",
        message: "No provinces matched the search value.",
        searchedFor: searchValue
      };
    }

    // If searching by name and multiple found, pick first but return list for transparency
    const chosen = matches[0];
    if (!chosen.editTarget) {
      return {
        status: "ERROR",
        message: "Could not find edit postback target from the grid row.",
        matches
      };
    }

    /* ----------------------------
     * 4) OPEN RECORD (click edit icon)
     * Uses current search page state fields (from searchDoc)
     * ---------------------------- */
    const sState = getState(searchDoc);

    const openFormData = new FormData();
    // safest: copy hidden inputs from the page we are posting from
    copyAllHiddenInputs(searchDoc, openFormData);

    // override the essentials for the postback click
    openFormData.set("scrollLeft", "0");
    openFormData.set("scrollTop", "0");
    openFormData.set("__EVENTTARGET", chosen.editTarget);
    openFormData.set("__EVENTARGUMENT", "");
    openFormData.set("__VIEWSTATE", sState.viewState);
    openFormData.set("__VIEWSTATEGENERATOR", sState.viewStateGen);
    openFormData.set("__EVENTVALIDATION", sState.eventValidation);
    openFormData.set("ctl00$hdnDateFormat", "dd/mm/yy");
    openFormData.set("ctl00$hdnQuickmenu", "1");
    // keep criteria/value (not mandatory but harmless)
    openFormData.set("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    openFormData.set("ctl00$body$ContentSearch$txtContent", searchValue);

    const detailRes = await fetch(url, { method: "POST", headers, body: openFormData });
    const detailHtml = await detailRes.text();
    const detailDoc = parser.parseFromString(detailHtml, "text/html");

    /* ----------------------------
     * 5) CLICK EDIT BUTTON
     * ---------------------------- */
    const dState = getState(detailDoc);

    const editFormData = new FormData();
    copyAllHiddenInputs(detailDoc, editFormData);

    editFormData.set("scrollLeft", "0");
    editFormData.set("scrollTop", "0");
    editFormData.set("__EVENTTARGET", "");
    editFormData.set("__EVENTARGUMENT", "");
    editFormData.set("__VIEWSTATE", dState.viewState);
    editFormData.set("__VIEWSTATEGENERATOR", dState.viewStateGen);
    editFormData.set("__EVENTVALIDATION", dState.eventValidation);
    editFormData.set("ctl00$hdnDateFormat", "dd/mm/yy");
    editFormData.set("ctl00$hdnQuickmenu", "1");
    editFormData.set("ctl00$body$butEdit", "Edit");

    const editModeRes = await fetch(url, { method: "POST", headers, body: editFormData });
    const editModeHtml = await editModeRes.text();
    const editModeDoc = parser.parseFromString(editModeHtml, "text/html");

    /* ----------------------------
     * 6) READ CURRENT VALUES (edit mode)
     * ---------------------------- */
    const nameEl = editModeDoc.querySelector("#ctl00_body_txtName");
    const countryEl = editModeDoc.querySelector("#ctl00_body_dpcountry");

    if (!nameEl || !countryEl) {
      return {
        status: "ERROR",
        message: "Edit mode controls not found (#ctl00_body_txtName or #ctl00_body_dpcountry)."
      };
    }

    const currentName = nameEl.value || "";
    const currentCountryCode = countryEl.value || "";

    /* ----------------------------
     * 7) RESOLVE NEW VALUES
     * ---------------------------- */
    const finalName =
      args.newProvinceName !== undefined && String(args.newProvinceName).trim() !== ""
        ? String(args.newProvinceName).trim()
        : currentName;

    let finalCountryCode = currentCountryCode;

    if (args.country !== undefined && String(args.country).trim() !== "") {
      const inputCountry = String(args.country).trim();

      // allow passing direct code
      if (/^\d{6}$/.test(inputCountry)) {
        finalCountryCode = inputCountry;
      } else {
        // match by country name (case-insensitive exact)
        const options = Array.from(countryEl.querySelectorAll("option"));
        const found = options.find(
          (o) => o.value && o.value !== "-1" && lower(o.textContent?.trim()) === lower(inputCountry)
        );
        if (!found) {
          return {
            status: "INVALID_ARGS",
            message: `Country "${inputCountry}" not found in dropdown.`,
            hint: "Pass a 6-digit country code (e.g., 000175) or an exact country name from the dropdown."
          };
        }
        finalCountryCode = found.value;
      }
    }

    if (finalName === currentName && finalCountryCode === currentCountryCode) {
      return {
        status: "NO_CHANGES",
        message: "No changes detected (province name and country are unchanged).",
        provinceCode: chosen.code,
        provinceName: currentName,
        countryCode: currentCountryCode
      };
    }

    /* ----------------------------
     * 8) SAVE
     * Network shows ONLY these keys + hidden state
     * ---------------------------- */
    const emState = getState(editModeDoc);

    const saveFormData = new FormData();
    copyAllHiddenInputs(editModeDoc, saveFormData);

    saveFormData.set("scrollLeft", "0");
    saveFormData.set("scrollTop", "0");
    saveFormData.set("__EVENTTARGET", "");
    saveFormData.set("__EVENTARGUMENT", "");
    saveFormData.set("__VIEWSTATE", emState.viewState);
    saveFormData.set("__VIEWSTATEGENERATOR", emState.viewStateGen);
    saveFormData.set("__EVENTVALIDATION", emState.eventValidation);
    saveFormData.set("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFormData.set("ctl00$hdnQuickmenu", "1");

    // EXACT network keys
    saveFormData.set(nameEl.getAttribute("name"), finalName);
    saveFormData.set(countryEl.getAttribute("name"), finalCountryCode);
    saveFormData.set("ctl00$body$butSave", "Save");

    const saveRes = await fetch(url, { method: "POST", headers, body: saveFormData });
    const saveHtml = await saveRes.text();
    const saveDoc = parser.parseFromString(saveHtml, "text/html");

    // verify persisted values from returned page
    const savedName = saveDoc.querySelector("#ctl00_body_txtName")?.value || "";
    const savedCountry = saveDoc.querySelector("#ctl00_body_dpcountry")?.value || "";

    if (savedName.trim() !== finalName.trim() || savedCountry !== finalCountryCode) {
      const err =
        saveDoc.querySelector(".alert-danger, .error, .validation-summary-errors")?.textContent?.trim() ||
        null;

      return {
        status: "ERROR",
        message: "Save did not persist (returned page does not reflect new values).",
        serverMessage: err,
        expected: { name: finalName, countryCode: finalCountryCode },
        actual: { name: savedName, countryCode: savedCountry }
      };
    }

    return {
      status: "SUCCESS",
      message: `Successfully updated Province (${chosen.code}).`,
      provinceCode: chosen.code,
      original: { name: currentName, countryCode: currentCountryCode },
      updated: { name: savedName, countryCode: savedCountry },
      matches: args.provinceName ? matches : undefined // helpful when name search was partial
    };
  } catch (err) {
    return { status: "ERROR", message: err?.message || String(err) };
  }
});
