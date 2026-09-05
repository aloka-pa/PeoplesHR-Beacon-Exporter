(async function (data, args, reqOptions) {
  try {
    /* Access validation */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/StatutoryItems.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Statutory Items screen. Please contact HR Admin."
      };
    }

    /* Input validation */
    if (!args?.statutoryName || args.statutoryName.trim() === "") {
      return {
        status: "INVALID_ARGS",
        message: "Error: statutoryName is required"
      };
    }

    if (args.statutoryName.length > 100) {
      return {
        status: "INVALID_ARGS",
        message: "Error: statutoryName must be 100 characters or less"
      };
    }

    /* Initial page state */
    const details = await BeaconBar.executeFunction("getApiList")("StatutoryItems");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/StatutoryItems.aspx");

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/StatutoryItems.aspx`;

    const parser = new DOMParser();

    /* Step 1: Click New to get the creation form */
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
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "STA_CODE");
    newFormData.append("ctl00$body$ContentSearch$txtContent", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    newFormData.append("ctl00_body_grdsummary_ClientState", "");
    newFormData.append("ctl00$body$butNew", "New");

    const newResponse = await fetch(url, {
      method: "POST",
      headers,
      body: newFormData
    });

    const newDoc = parser.parseFromString(await newResponse.text(), "text/html");

    /* Extract ViewState after clicking New */
    const viewState = newDoc.querySelector("#__VIEWSTATE")?.value || "";
    const eventValidation = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const viewStateGen = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    /* Step 2: Save with the statutory item name */
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
    saveFormData.append("ctl00$body$txtName", args.statutoryName.trim());
    saveFormData.append("ctl00$body$butSave", "Save");

    const saveResponse = await fetch(url, {
      method: "POST",
      headers,
      body: saveFormData
    });

    const saveHtml = await saveResponse.text();

    if (saveResponse.status === 200) {
      const saveDoc = parser.parseFromString(saveHtml, "text/html");
      const errorMsg = saveDoc.querySelector(".alert-danger, .error")?.textContent;
      
      if (errorMsg) {
        return {
          status: "ERROR",
          message: `Save failed: ${errorMsg.trim()}`
        };
      }

      // Extract the generated statutory item code from the saved record
      const statutoryCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

      return {
        status: "SUCCESS",
        message: "Successfully created Statutory Item!",
        statutoryName: args.statutoryName.trim(),
        statutoryCode: statutoryCode
      };
    }

    return {
      status: "ERROR",
      message: "Failed to create statutory item. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})