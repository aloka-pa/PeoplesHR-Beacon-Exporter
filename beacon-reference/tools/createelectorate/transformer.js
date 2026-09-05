(async function (data, args, reqOptions) {
  try {
    /* Access validation */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Electorate.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Electorate screen. Please contact HR Admin."
      };
    }

    /* Input validation */
    if (!args?.electorateName || args.electorateName.trim() === "") {
      return {
        status: "INVALID_ARGS",
        message: "Error: electorateName is required"
      };
    }

    if (!args?.district && !args?.districtName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either district (code) or districtName is required for creating an electorate"
      };
    }

    /* Initial page state */
    const details = await BeaconBar.executeFunction("getApiList")("Electorate");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Electorate.aspx");

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Electorate.aspx`;

    const parser = new DOMParser();

    /* Click New to get the form with district dropdown */
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
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "ELECTORATE_CODE");
    newFormData.append("ctl00$body$ContentSearch$txtContent", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "2");
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

    /* Extract district dropdown and find matching code */
    const districtSelect = newDoc.querySelector("#ctl00_body_drpDistrict");
    const options = districtSelect.querySelectorAll("option");

    let districtCode = null;

    // Determine district code - prioritize direct code, then lookup name
    if (args.district !== undefined) {
      // If district code is provided directly, use it
      const inputDistrict = args.district.trim();
      
      // If input is already a 6-digit code, use it directly
      if (/^\d{6}$/.test(inputDistrict)) {
        districtCode = inputDistrict;
      } else {
        // Search for district name (case-insensitive) in case user passed name to 'district' param
        for (const option of options) {
          const optionText = option.textContent.trim();
          const optionValue = option.value;
          
          if (optionValue !== "" && 
              optionText.toLowerCase() === inputDistrict.toLowerCase()) {
            districtCode = optionValue;
            break;
          }
        }
      }
    } else if (args.districtName !== undefined) {
      // Search for district name (case-insensitive)
      const inputDistrictName = args.districtName.trim();
      
      for (const option of options) {
        const optionText = option.textContent.trim();
        const optionValue = option.value;
        
        if (optionValue !== "" && 
            optionText.toLowerCase() === inputDistrictName.toLowerCase()) {
          districtCode = optionValue;
          break;
        }
      }
    }

    if (!districtCode) {
      // Collect available districts for error message
      const availableDistricts = Array.from(options)
        .filter(opt => opt.value !== "")
        .map(opt => opt.textContent.trim())
        .slice(0, 50);

      const searchTerm = args.district || args.districtName;
      return {
        status: "INVALID_ARGS",
        message: `District "${searchTerm}" not found in the system`,
        suggestion: `Available districts include: ${availableDistricts.join(", ")}...`
      };
    }

    /* Save with the resolved district code */
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

    saveFormData.append("ctl00$body$txtName", args.electorateName.trim());
    saveFormData.append("ctl00$body$drpDistrict", districtCode);
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
        message: "Successfully created electorate record!",
        electorateName: args.electorateName,
        district: args.district || args.districtName,
        districtCode: districtCode
      };
    }

    return {
      status: "ERROR",
      message: "Failed to create electorate. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})