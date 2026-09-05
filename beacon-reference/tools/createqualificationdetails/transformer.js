(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Qualifications.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Qualifications screen. Please contact HR Admin."
    };
  }

  // Validate required fields
  if (!args.qualificationName) {
    return {
      status: "INVALID_ARGS",
      message: "qualificationName is required to create a new qualification"
    };
  }

  if (!args.ratingMethodCode && !args.ratingMethodName) {
    return {
      status: "INVALID_ARGS",
      message: "Either ratingMethodCode or ratingMethodName is required"
    };
  }

  if (!args.qualificationTypeCode && !args.qualificationTypeName) {
    return {
      status: "INVALID_ARGS",
      message: "Either qualificationTypeCode or qualificationTypeName is required"
    };
  }

  if (!args.classificationCode && !args.classificationName) {
    return {
      status: "INVALID_ARGS",
      message: "Either classificationCode or classificationName is required"
    };
  }

  const details = await BeaconBar.executeFunction("getApiList")("Qualifications");

  const headers = new Headers();
  headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Qualifications.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/Qualifications.aspx`;

  const parser = new DOMParser();

  // Helper function to find dropdown code by name
  const findDropdownCode = (doc, dropdownSelector, searchName) => {
    const dropdown = doc.querySelector(dropdownSelector);
    const options = dropdown?.querySelectorAll("option") || [];
    
    for (const option of options) {
      const optionText = option.textContent.trim();
      const optionValue = option.value;
      
      if (optionText.toLowerCase().includes(searchName.toLowerCase()) && optionValue !== "-1") {
        return optionValue;
      }
    }
    return null;
  };

  // STEP 1: Click New button to open new qualification form
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
  newFormData.append("ctl00$body$ContentSearch$cboCriteria", "QUALIFI_CODE");
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

  let currentViewState = newDoc.querySelector("#__VIEWSTATE")?.value || "";
  let currentEventValidation = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  let currentViewStateGen = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // Determine hasExpiration
  const hasExpiration = args.hasExpiration !== undefined ? 
    (args.hasExpiration === "true" || args.hasExpiration === true) : false;

  // STEP 2: If expiration checkbox is being checked, trigger intermediate POST
  let currentDoc = newDoc;
  if (hasExpiration) {
    const expirationFormData = new FormData();
    expirationFormData.append("scrollLeft", "0");
    expirationFormData.append("scrollTop", "0");
    expirationFormData.append("__EVENTTARGET", "ctl00$body$ChkisExpire");
    expirationFormData.append("__EVENTARGUMENT", "");
    expirationFormData.append("__VIEWSTATE", currentViewState);
    expirationFormData.append("__VIEWSTATEGENERATOR", currentViewStateGen);
    expirationFormData.append("__VIEWSTATEENCRYPTED", "");
    expirationFormData.append("__EVENTVALIDATION", currentEventValidation);
    expirationFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    expirationFormData.append("ctl00$hdnQuickmenu", "1");
    expirationFormData.append("ctl00$body$txtName", args.qualificationName);
    expirationFormData.append("ctl00$body$ChkisExpire", "on");
    expirationFormData.append("ctl00$body$dpRatmethod", "-1");
    expirationFormData.append("ctl00$body$dpSalary", "-1");
    expirationFormData.append("ctl00$body$dpClassification", "-1");

    const expirationResponse = await fetch(url, {
      method: "POST",
      headers,
      body: expirationFormData
    });

    currentDoc = parser.parseFromString(await expirationResponse.text(), "text/html");
    
    currentViewState = currentDoc.querySelector("#__VIEWSTATE")?.value || currentViewState;
    currentEventValidation = currentDoc.querySelector("#__EVENTVALIDATION")?.value || currentEventValidation;
    currentViewStateGen = currentDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || currentViewStateGen;
  }

  // Determine rating method code
  let ratingMethodCode = "";
  if (args.ratingMethodCode) {
    ratingMethodCode = args.ratingMethodCode;
  } else if (args.ratingMethodName) {
    const foundCode = findDropdownCode(currentDoc, "#ctl00_body_dpRatmethod", args.ratingMethodName);
    if (foundCode) {
      ratingMethodCode = foundCode;
    } else {
      return {
        status: "INVALID_ARGS",
        message: `Rating Method "${args.ratingMethodName}" not found in the dropdown. Please verify the rating method name.`
      };
    }
  }

  // Determine qualification type code
  let qualificationTypeCode = "";
  if (args.qualificationTypeCode) {
    qualificationTypeCode = args.qualificationTypeCode;
  } else if (args.qualificationTypeName) {
    const foundCode = findDropdownCode(currentDoc, "#ctl00_body_dpSalary", args.qualificationTypeName);
    if (foundCode) {
      qualificationTypeCode = foundCode;
    } else {
      return {
        status: "INVALID_ARGS",
        message: `Qualification Type "${args.qualificationTypeName}" not found in the dropdown. Please verify the qualification type name.`
      };
    }
  }

  // STEP 3: Trigger qualification type change to load classification options
  const typeChangeFormData = new FormData();
  typeChangeFormData.append("scrollLeft", "0");
  typeChangeFormData.append("scrollTop", "0");
  typeChangeFormData.append("__EVENTTARGET", "ctl00$body$dpSalary");
  typeChangeFormData.append("__EVENTARGUMENT", "");
  typeChangeFormData.append("__VIEWSTATE", currentViewState);
  typeChangeFormData.append("__VIEWSTATEGENERATOR", currentViewStateGen);
  typeChangeFormData.append("__VIEWSTATEENCRYPTED", "");
  typeChangeFormData.append("__EVENTVALIDATION", currentEventValidation);
  typeChangeFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  typeChangeFormData.append("ctl00$hdnQuickmenu", "1");
  typeChangeFormData.append("ctl00$body$txtName", args.qualificationName);
  
  if (hasExpiration) {
    typeChangeFormData.append("ctl00$body$ChkisExpire", "on");
  }
  
  typeChangeFormData.append("ctl00$body$dpRatmethod", ratingMethodCode);
  typeChangeFormData.append("ctl00$body$dpSalary", qualificationTypeCode);
  typeChangeFormData.append("ctl00$body$dpClassification", "-1");

  const typeChangeResponse = await fetch(url, {
    method: "POST",
    headers,
    body: typeChangeFormData
  });

  const typeChangeDoc = parser.parseFromString(await typeChangeResponse.text(), "text/html");
  
  currentViewState = typeChangeDoc.querySelector("#__VIEWSTATE")?.value || currentViewState;
  currentEventValidation = typeChangeDoc.querySelector("#__EVENTVALIDATION")?.value || currentEventValidation;
  currentViewStateGen = typeChangeDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || currentViewStateGen;

  // Determine classification code (now that options are loaded)
  let classificationCode = "";
  if (args.classificationCode) {
    classificationCode = args.classificationCode;
  } else if (args.classificationName) {
    const foundCode = findDropdownCode(typeChangeDoc, "#ctl00_body_dpClassification", args.classificationName);
    if (foundCode) {
      classificationCode = foundCode;
    } else {
      return {
        status: "INVALID_ARGS",
        message: `Classification "${args.classificationName}" not found in the dropdown. Please verify the classification name.`
      };
    }
  }

  // STEP 4: Save the new qualification
  const saveFormData = new FormData();
  saveFormData.append("scrollLeft", "0");
  saveFormData.append("scrollTop", "0");
  saveFormData.append("__EVENTTARGET", "");
  saveFormData.append("__EVENTARGUMENT", "");
  saveFormData.append("__VIEWSTATE", currentViewState);
  saveFormData.append("__VIEWSTATEGENERATOR", currentViewStateGen);
  saveFormData.append("__VIEWSTATEENCRYPTED", "");
  saveFormData.append("__EVENTVALIDATION", currentEventValidation);
  saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  saveFormData.append("ctl00$hdnQuickmenu", "1");
  saveFormData.append("ctl00$body$txtName", args.qualificationName);
  
  if (hasExpiration) {
    saveFormData.append("ctl00$body$ChkisExpire", "on");
  }
  
  saveFormData.append("ctl00$body$dpRatmethod", ratingMethodCode);
  saveFormData.append("ctl00$body$dpSalary", qualificationTypeCode);
  saveFormData.append("ctl00$body$dpClassification", classificationCode);
  saveFormData.append("ctl00$body$butSave", "Save");

  const finalResponse = await fetch(url, {
    method: "POST",
    headers,
    body: saveFormData
  });

  const saveHtml = await finalResponse.text();

  if (finalResponse.status === 200) {
    const saveDoc = parser.parseFromString(saveHtml, "text/html");
    const errorMsg = saveDoc.querySelector(".alert-danger, .error")?.textContent;
    
    if (errorMsg) {
      return {
        status: "ERROR",
        message: `Save failed: ${errorMsg.trim()}`
      };
    }

    // Extract the newly created qualification code
    const newCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

    // Get dropdown names for response
    const getRatingMethodName = () => {
      if (ratingMethodCode) {
        const option = typeChangeDoc.querySelector(`#ctl00_body_dpRatmethod option[value="${ratingMethodCode}"]`);
        return option?.textContent.trim() || null;
      }
      return null;
    };

    const getQualificationTypeName = () => {
      if (qualificationTypeCode) {
        const option = typeChangeDoc.querySelector(`#ctl00_body_dpSalary option[value="${qualificationTypeCode}"]`);
        return option?.textContent.trim() || null;
      }
      return null;
    };

    const getClassificationName = () => {
      if (classificationCode) {
        const option = typeChangeDoc.querySelector(`#ctl00_body_dpClassification option[value="${classificationCode}"]`);
        return option?.textContent.trim() || null;
      }
      return null;
    };

    return {
      status: "SUCCESS",
      message: `Successfully created new Qualification${newCode ? ` (${newCode})` : ""}`,
      qualificationCode: newCode,
      qualificationName: args.qualificationName,
      ratingMethodCode: ratingMethodCode,
      ratingMethodName: getRatingMethodName(),
      qualificationTypeCode: qualificationTypeCode,
      qualificationTypeName: getQualificationTypeName(),
      classificationCode: classificationCode,
      classificationName: getClassificationName(),
      hasExpiration: hasExpiration
    };
  }

  return {
    status: "ERROR",
    message: "Failed to create Qualification. Please verify in the UI."
  };
})