(async function (data, args, reqOptions) {
  try {
    /* Access validation */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/QualificationProperty.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Qualification Property screen. Please contact HR Admin."
      };
    }

    /* Input validation */
    if (!args?.propertyName || args.propertyName.trim() === "") {
      return {
        status: "INVALID_ARGS",
        message: "Error: propertyName is required"
      };
    }

    if (args.propertyName.length > 120) {
      return {
        status: "INVALID_ARGS",
        message: "Error: propertyName must be 120 characters or less"
      };
    }

    if (!args?.qualificationCode && !args?.qualificationName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either qualificationCode or qualificationName is required"
      };
    }

    if (!args?.dataType || args.dataType.trim() === "") {
      return {
        status: "INVALID_ARGS",
        message: "Error: dataType is required. Available types: String, Numeric, Boolean, Date"
      };
    }

    /* Initial page state */
    const details = await BeaconBar.executeFunction("getApiList")("QualificationProperty");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/QualificationProperty.aspx");

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/QualificationProperty.aspx`;

    const parser = new DOMParser();

    /* Step 1: Click New to get the form with dropdowns */
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
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "QATT.QATT_CODE");
    newFormData.append("ctl00$body$ContentSearch$txtContent", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "100");
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

    /* Determine qualification code */
    let qualificationCodeToUse = "-1";
    
    if (args.qualificationCode !== undefined) {
      const inputQualificationCode = args.qualificationCode.trim();
      
      // If input is already a 6-digit code, use it directly
      if (/^\d{6}$/.test(inputQualificationCode)) {
        qualificationCodeToUse = inputQualificationCode;
      } else {
        // Search for qualification name (case-insensitive)
        const qualificationSelect = newDoc.querySelector("#ctl00_body_dpQualification");
        const qualificationOptions = qualificationSelect?.querySelectorAll("option");
        
        for (const option of qualificationOptions) {
          const optionText = option.textContent.trim();
          const optionValue = option.value;
          
          if (optionValue !== "" && optionValue !== "-1" &&
              optionText.toLowerCase() === inputQualificationCode.toLowerCase()) {
            qualificationCodeToUse = optionValue;
            break;
          }
        }
      }
    } else if (args.qualificationName !== undefined) {
      // Search for qualification name (case-insensitive)
      const inputQualificationName = args.qualificationName.trim();
      const qualificationSelect = newDoc.querySelector("#ctl00_body_dpQualification");
      const qualificationOptions = qualificationSelect?.querySelectorAll("option");
      
      for (const option of qualificationOptions) {
        const optionText = option.textContent.trim();
        const optionValue = option.value;
        
        if (optionValue !== "" && optionValue !== "-1" &&
            optionText.toLowerCase() === inputQualificationName.toLowerCase()) {
          qualificationCodeToUse = optionValue;
          break;
        }
      }
    }

    if (qualificationCodeToUse === "-1") {
      const qualificationSelect = newDoc.querySelector("#ctl00_body_dpQualification");
      const qualificationOptions = qualificationSelect?.querySelectorAll("option");
      const availableQualifications = Array.from(qualificationOptions)
        .filter(opt => opt.value !== "" && opt.value !== "-1")
        .map(opt => opt.textContent.trim());

      const searchTerm = args.qualificationCode || args.qualificationName;
      return {
        status: "INVALID_ARGS",
        message: `Qualification "${searchTerm}" not found in the system`,
        suggestion: `Available qualifications: ${availableQualifications.join(", ")}`
      };
    }

    /* Validate and determine data type */
    const inputDataType = args.dataType.trim();
    const dataTypeSelect = newDoc.querySelector("#ctl00_body_dpDataType");
    const dataTypeOptions = dataTypeSelect?.querySelectorAll("option");
    
    let dataTypeToUse = "";
    for (const option of dataTypeOptions) {
      const optionValue = option.value;
      
      if (optionValue !== "" && 
          optionValue.toLowerCase() === inputDataType.toLowerCase()) {
        dataTypeToUse = optionValue;
        break;
      }
    }
    
    if (!dataTypeToUse) {
      const availableDataTypes = Array.from(dataTypeOptions)
        .filter(opt => opt.value !== "")
        .map(opt => opt.value);
      
      return {
        status: "INVALID_ARGS",
        message: `Data type "${inputDataType}" not found`,
        suggestion: `Available data types: ${availableDataTypes.join(", ")}`
      };
    }

    /* Step 2: Save with all required fields */
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
    saveFormData.append("ctl00$body$txtName", args.propertyName.trim());
    saveFormData.append("ctl00$body$dpQualification", qualificationCodeToUse);
    saveFormData.append("ctl00$body$dpDataType", dataTypeToUse);
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

      // Extract the generated property code from the saved record
      const propertyCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

      return {
        status: "SUCCESS",
        message: "Successfully created Qualification Property!",
        propertyCode: propertyCode,
        propertyName: args.propertyName.trim(),
        qualificationCode: qualificationCodeToUse,
        dataType: dataTypeToUse
      };
    }

    return {
      status: "ERROR",
      message: "Failed to create qualification property. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})