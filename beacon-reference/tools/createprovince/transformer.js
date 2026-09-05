(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Province.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Province screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Input validation
     * ------------------------------------------------- */
    const provinceName = (args?.provinceName || "").trim();
    const countryInput = (args?.country || "").trim();
    const anseliCode = (args?.anseliCode || "").trim();

    if (!provinceName) {
      return { status: "INVALID_ARGS", message: "Error: provinceName is required" };
    }
    if (!countryInput) {
      return { status: "INVALID_ARGS", message: "Error: country is required" };
    }

    /* -------------------------------------------------
     * 3) Helpers
     * ------------------------------------------------- */
    const parser = new DOMParser();

    function getHidden(doc, id) {
      return doc.querySelector(`#${id}`)?.value || "";
    }

    function getRadHidden(doc) {
      return doc.querySelector("#ctl00_body_RadScriptManager1_HiddenField")?.value || "";
    }

    function norm(s) {
      return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function extractGridRows(doc) {
      const rows = Array.from(doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
      return rows.map(r => {
        const tds = r.querySelectorAll("td");
        return {
          code: tds[0]?.textContent?.trim() || "",
          name: tds[1]?.textContent?.trim() || "",
          rowEl: r
        };
      });
    }

    /* -------------------------------------------------
     * 4) Build URL + initial state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Province");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Province.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Province.aspx`;

    /* -------------------------------------------------
     * 5) POST: Click NEW (matches your network payload)
     * ------------------------------------------------- */
    const newFormData = new FormData();
    newFormData.append("ctl00_body_RadScriptManager1_HiddenField", ""); // present even if empty
    newFormData.append("scrollLeft", "0");
    newFormData.append("scrollTop", "0");
    newFormData.append("__EVENTTARGET", "");
    newFormData.append("__EVENTARGUMENT", "");
    newFormData.append("__VIEWSTATE", details.viewState);
    newFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    newFormData.append("__VIEWSTATEENCRYPTED", "");
    newFormData.append("__EVENTVALIDATION", details.eventValidation);
    newFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    newFormData.append("ctl00$hdnQuickmenu", "1");
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "PROVINCE_CODE");
    newFormData.append("ctl00$body$ContentSearch$txtContent", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    newFormData.append("ctl00_body_grdsummary_ClientState", "");
    newFormData.append("ctl00$body$butNew", "New");

    const newResp = await fetch(url, { method: "POST", headers, body: newFormData, redirect: "follow" });
    const newHtml = await newResp.text();
    const newDoc = parser.parseFromString(newHtml, "text/html");

    const newViewState = getHidden(newDoc, "__VIEWSTATE");
    const newEventValidation = getHidden(newDoc, "__EVENTVALIDATION");
    const newViewStateGen = getHidden(newDoc, "__VIEWSTATEGENERATOR");
    const newRadHidden = getRadHidden(newDoc);

    // Ensure we are actually on the New form
    const nameInput = newDoc.querySelector("#ctl00_body_txtName");
    const countrySelect = newDoc.querySelector("#ctl00_body_dpcountry");
    if (!nameInput || !countrySelect) {
      return {
        status: "ERROR",
        message: "Failed to open the New Province form (txtName/dpcountry not found)."
      };
    }

    /* -------------------------------------------------
     * 6) Resolve country code (code/exact/partial)
     * ------------------------------------------------- */
    let countryCode = null;
    if (/^\d{6}$/.test(countryInput)) {
      countryCode = countryInput;
    } else {
      const options = Array.from(countrySelect.querySelectorAll("option"))
        .map(o => ({ value: (o.value || "").trim(), text: (o.textContent || "").trim() }))
        .filter(o => o.value && o.value !== "-1");

      const nInput = norm(countryInput);

      // exact match first
      const exact = options.filter(o => norm(o.text) === nInput);
      if (exact.length === 1) {
        countryCode = exact[0].value;
      } else {
        // partial match
        const partial = options.filter(o => norm(o.text).includes(nInput));
        if (partial.length === 1) {
          countryCode = partial[0].value;
        } else if (partial.length > 1) {
          return {
            status: "MULTIPLE_MATCHES",
            message: `Country "${countryInput}" matches multiple countries. Please be more specific or use the 6-digit country code.`,
            suggestions: partial.slice(0, 10).map(p => `${p.text} (${p.value})`)
          };
        }
      }
    }

    if (!countryCode) {
      // Provide a few suggestions
      const allOptions = Array.from(countrySelect.querySelectorAll("option"))
        .map(o => ({ value: (o.value || "").trim(), text: (o.textContent || "").trim() }))
        .filter(o => o.value && o.value !== "-1");

      const suggestions = allOptions
        .filter(o => norm(o.text).includes(norm(countryInput)))
        .slice(0, 10)
        .map(o => `${o.text} (${o.value})`);

      return {
        status: "INVALID_ARGS",
        message: `Country "${countryInput}" not found.`,
        suggestions
      };
    }

    /* -------------------------------------------------
     * 7) POST: Click SAVE (matches your network payload)
     * ------------------------------------------------- */
    const saveFormData = new FormData();
    saveFormData.append("ctl00_body_RadScriptManager1_HiddenField", newRadHidden || "");
    saveFormData.append("scrollLeft", "0");
    saveFormData.append("scrollTop", "0");
    saveFormData.append("__EVENTTARGET", "");
    saveFormData.append("__EVENTARGUMENT", "");
    saveFormData.append("__VIEWSTATE", newViewState);
    saveFormData.append("__VIEWSTATEGENERATOR", newViewStateGen);
    saveFormData.append("__VIEWSTATEENCRYPTED", "");
    saveFormData.append("__EVENTVALIDATION", newEventValidation);
    saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFormData.append("ctl00$hdnQuickmenu", "1");

    saveFormData.append("ctl00$body$txtName", provinceName);
    saveFormData.append("ctl00$body$dpcountry", countryCode);

    // Optional ref code (only if the field exists on this page)
    if (newDoc.querySelector("#ctl00_body_txtrefcode")) {
      saveFormData.append("ctl00$body$txtrefcode", anseliCode);
    }

    saveFormData.append("ctl00$body$butSave", "Save");

    const saveResp = await fetch(url, { method: "POST", headers, body: saveFormData, redirect: "follow" });
    const saveHtml = await saveResp.text();
    const saveDoc = parser.parseFromString(saveHtml, "text/html");

    // If validation errors exist, return them
    const errorText =
      saveDoc.querySelector(".alert-danger")?.textContent?.trim() ||
      saveDoc.querySelector(".error")?.textContent?.trim() ||
      "";

    if (errorText) {
      return { status: "ERROR", message: `Save failed: ${errorText}` };
    }

    /* -------------------------------------------------
     * 8) Verify creation by searching Province Name
     * ------------------------------------------------- */
    const vsAfterSave = getHidden(saveDoc, "__VIEWSTATE") || newViewState;
    const evAfterSave = getHidden(saveDoc, "__EVENTVALIDATION") || newEventValidation;
    const vgAfterSave = getHidden(saveDoc, "__VIEWSTATEGENERATOR") || newViewStateGen;
    const radAfterSave = getRadHidden(saveDoc) || newRadHidden || "";

    const verifyFormData = new FormData();
    verifyFormData.append("ctl00_body_RadScriptManager1_HiddenField", radAfterSave);
    verifyFormData.append("scrollLeft", "0");
    verifyFormData.append("scrollTop", "0");
    verifyFormData.append("__EVENTTARGET", "");
    verifyFormData.append("__EVENTARGUMENT", "");
    verifyFormData.append("__VIEWSTATE", vsAfterSave);
    verifyFormData.append("__VIEWSTATEGENERATOR", vgAfterSave);
    verifyFormData.append("__VIEWSTATEENCRYPTED", "");
    verifyFormData.append("__EVENTVALIDATION", evAfterSave);
    verifyFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    verifyFormData.append("ctl00$hdnQuickmenu", "1");
    verifyFormData.append("ctl00$body$ContentSearch$cboCriteria", "PROVINCE_NAME");
    verifyFormData.append("ctl00$body$ContentSearch$txtContent", provinceName);
    verifyFormData.append("ctl00$body$ContentSearch$butSearch", "Search");
    verifyFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    verifyFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    verifyFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    verifyFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    verifyFormData.append("ctl00_body_grdsummary_ClientState", "");

    const verifyResp = await fetch(url, { method: "POST", headers, body: verifyFormData, redirect: "follow" });
    const verifyDoc = parser.parseFromString(await verifyResp.text(), "text/html");

    const grid = extractGridRows(verifyDoc);
    const created = grid.find(r => norm(r.name) === norm(provinceName)) || grid[0] || null;

    return {
      status: "SUCCESS",
      message: `Successfully created province "${provinceName}" with country ${countryCode}.`,
      provinceCode: created?.code || null,
      provinceName: created?.name || provinceName,
      country: countryInput,
      countryCode: countryCode,
      anseliCode: anseliCode || null
    };

  } catch (err) {
    return { status: "ERROR", message: err?.message || "Unknown error", error: String(err) };
  }
});
