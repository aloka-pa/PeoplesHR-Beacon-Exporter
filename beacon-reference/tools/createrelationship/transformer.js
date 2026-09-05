(async function (data, args, reqOptions) {
  try {
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
     * 2) Args validation (strings only)
     * ------------------------------------------------- */
    const relationshipName = (args?.relationshipName || "").toString().trim();
    const anseliCode = (args?.anseliCode || "").toString().trim();

    if (!relationshipName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: relationshipName is required"
      };
    }

    if (relationshipName.length > 20) {
      return {
        status: "INVALID_ARGS",
        message: "Error: relationshipName must be 20 characters or less"
      };
    }

    if (anseliCode && anseliCode.length > 10) {
      return {
        status: "INVALID_ARGS",
        message: "Error: anseliCode must be 10 characters or less"
      };
    }

    /* -------------------------------------------------
     * 3) Initial page state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Relationship");

    const headers = new Headers();
    headers.append(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    );
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Relationship.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Relationship.aspx`;

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 4) Click NEW (mirror your network payload)
     * ------------------------------------------------- */
    const newFormData = new FormData();
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
    newFormData.append("ctl00$body$hdnIsHead", "");
    newFormData.append("ctl00$body$hdnEditItemIndex", "");
    newFormData.append("ctl00_body_RadWindowManager1_ClientState", "");

    // These appear in your New request
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "REL_ID");
    newFormData.append("ctl00$body$ContentSearch$txtContent", "");
    newFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    newFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    newFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "9");
    newFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    newFormData.append("ctl00_body_grdSummary_ClientState", "");

    newFormData.append("ctl00$body$butNew", "New");
    newFormData.append("ctl00$body$hdnDefCountry", "");

    const newResp = await fetch(url, { method: "POST", headers, body: newFormData });
    const newHtml = await newResp.text();
    const newDoc = parser.parseFromString(newHtml, "text/html");

    const viewState = newDoc.querySelector("#__VIEWSTATE")?.value || "";
    const eventValidation = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const viewStateGen = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    if (!viewState || !eventValidation || !viewStateGen) {
      return {
        status: "ERROR",
        message: "Failed to enter New mode (missing VIEWSTATE/EVENTVALIDATION)."
      };
    }

    // IMPORTANT: carry these forward from NEW response (don’t keep them blank)
    const hdnIsHead = newDoc.querySelector("#ctl00_body_hdnIsHead")?.value || "";
    const hdnEditItemIndex = newDoc.querySelector("#ctl00_body_hdnEditItemIndex")?.value || "";
    const radWinState = newDoc.querySelector("#ctl00_body_RadWindowManager1_ClientState")?.value || "";
    const hdnDefCountry = newDoc.querySelector("#ctl00_body_hdnDefCountry")?.value || "";

    // Optional field existence check (some tenants show it, some don’t)
    const hasRefCodeField = !!newDoc.querySelector("#ctl00_body_txtrefcode");

    /* -------------------------------------------------
     * 5) SAVE (mirror your network payload)
     * ------------------------------------------------- */
    const saveFormData = new FormData();
    saveFormData.append("scrollLeft", "0");
    saveFormData.append("scrollTop", "0");
    saveFormData.append("__EVENTTARGET", "");
    saveFormData.append("__EVENTARGUMENT", "");
    saveFormData.append("__VIEWSTATE", viewState);
    saveFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
    saveFormData.append("__VIEWSTATEENCRYPTED", "");
    saveFormData.append("__EVENTVALIDATION", eventValidation);

    saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFormData.append("ctl00$hdnQuickmenu", "1");
    saveFormData.append("ctl00$body$hdnIsHead", hdnIsHead);
    saveFormData.append("ctl00$body$hdnEditItemIndex", hdnEditItemIndex);
    saveFormData.append("ctl00_body_RadWindowManager1_ClientState", radWinState);

    // Mandatory field (matches your request)
    saveFormData.append("ctl00$body$txtName", relationshipName);

    // Optional field (only if present)
    if (hasRefCodeField) {
      saveFormData.append("ctl00$body$txtrefcode", anseliCode);
    }

    saveFormData.append("ctl00$body$butSave", "Save");
    saveFormData.append("ctl00$body$hdnDefCountry", hdnDefCountry);

    const saveResp = await fetch(url, { method: "POST", headers, body: saveFormData });
    const saveHtml = await saveResp.text();
    const saveDoc = parser.parseFromString(saveHtml, "text/html");

    // Most EIM pages show server messages here
    const serverMsg =
      saveDoc.querySelector("#ctl00_body_lblMessage")?.textContent?.trim() ||
      saveDoc.querySelector(".alert-danger, .error")?.textContent?.trim() ||
      "";

    if (serverMsg) {
      return {
        status: "ERROR",
        message: `Save failed: ${serverMsg}`
      };
    }

    // Try to read created code after save
    const relationshipCode =
      saveDoc.querySelector("#ctl00_body_txtCode")?.value ||
      saveDoc.querySelector("#ctl00_body_txtcode")?.value ||
      "";

    return {
      status: "SUCCESS",
      message: "Successfully created Relationship!",
      relationshipCode: relationshipCode || null,
      relationshipName: relationshipName,
      anseliCode: hasRefCodeField ? (anseliCode || null) : null
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
