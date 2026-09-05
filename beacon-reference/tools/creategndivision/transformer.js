(async function (data, args, reqOptions) {
  try {
    /* Access validation */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/GNDivision.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to GN Division screen. Please contact HR Admin."
      };
    }

    /* Input validation */
    if (!args?.gnDivisionName || args.gnDivisionName.trim() === "") {
      return {
        status: "INVALID_ARGS",
        message: "Error: gnDivisionName is required"
      };
    }

    if (!args?.dsDivision && !args?.dsDivisionName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either dsDivision (code) or dsDivisionName is required for creating a GN Division"
      };
    }

    /* Initial page state */
    const details = await BeaconBar.executeFunction("getApiList")("GNDivision");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/GNDivision.aspx");

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/GNDivision.aspx`;

    const parser = new DOMParser();

    /* Click New to get the form with DS Division dropdown */
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
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "GNDIV_CODE");
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

    /* Extract DS Division dropdown and find matching code */
    const dsDivisionSelect = newDoc.querySelector("#ctl00_body_drpDSDiv");
    const options = dsDivisionSelect.querySelectorAll("option");

    let dsDivisionCode = null;

    // Determine DS Division code - prioritize direct code, then lookup name
    if (args.dsDivision !== undefined) {
      // If DS Division code is provided directly, use it
      const inputDSDivision = args.dsDivision.trim();
      
      // If input is already a 6-digit code, use it directly
      if (/^\d{6}$/.test(inputDSDivision)) {
        dsDivisionCode = inputDSDivision;
      } else {
        // Search for DS Division name (case-insensitive) in case user passed name to 'dsDivision' param
        for (const option of options) {
          const optionText = option.textContent.trim();
          const optionValue = option.value;
          
          if (optionValue !== "" && 
              optionText.toLowerCase() === inputDSDivision.toLowerCase()) {
            dsDivisionCode = optionValue;
            break;
          }
        }
      }
    } else if (args.dsDivisionName !== undefined) {
      // Search for DS Division name (case-insensitive)
      const inputDSDivisionName = args.dsDivisionName.trim();
      
      for (const option of options) {
        const optionText = option.textContent.trim();
        const optionValue = option.value;
        
        if (optionValue !== "" && 
            optionText.toLowerCase() === inputDSDivisionName.toLowerCase()) {
          dsDivisionCode = optionValue;
          break;
        }
      }
    }

    if (!dsDivisionCode) {
      // Collect available DS Divisions for error message
      const availableDSDivisions = Array.from(options)
        .filter(opt => opt.value !== "")
        .map(opt => opt.textContent.trim())
        .slice(0, 50);

      const searchTerm = args.dsDivision || args.dsDivisionName;
      return {
        status: "INVALID_ARGS",
        message: `DS Division "${searchTerm}" not found in the system`,
        suggestion: `Available DS Divisions include: ${availableDSDivisions.join(", ")}...`
      };
    }

    /* Save with the resolved DS Division code */
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

    saveFormData.append("ctl00$body$txtName", args.gnDivisionName.trim());
    saveFormData.append("ctl00$body$drpDSDiv", dsDivisionCode);
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

      return {
        status: "SUCCESS",
        message: "Successfully created GN Division record!",
        gnDivisionName: args.gnDivisionName,
        dsDivision: args.dsDivision || args.dsDivisionName,
        dsDivisionCode: dsDivisionCode
      };
    }

    return {
      status: "ERROR",
      message: "Failed to create GN Division. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})