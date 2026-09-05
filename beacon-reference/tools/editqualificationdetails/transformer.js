(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Qualifications.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Qualifications screen. Please contact HR Admin."
    };
  }

  // Validate input - user must provide either qualificationCode OR qualificationName to identify the record
  if (!args.qualificationCode && !args.qualificationName) {
    return {
      status: "INVALID_ARGS",
      message: "Either qualificationCode or qualificationName is required to identify the qualification"
    };
  }

  // Validate that at least one update field is provided
  if (args.newQualificationName === undefined && 
      args.ratingMethodCode === undefined && args.ratingMethodName === undefined &&
      args.qualificationTypeCode === undefined && args.qualificationTypeName === undefined &&
      args.classificationCode === undefined && args.classificationName === undefined &&
      args.hasExpiration === undefined) {
    return {
      status: "INVALID_ARGS",
      message: "At least one field to update must be provided: newQualificationName, ratingMethodCode/Name, qualificationTypeCode/Name, classificationCode/Name, or hasExpiration"
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

  // Determine search criteria based on what user provided
  let searchCriteria, searchValue;
  if (args.qualificationCode) {
    searchCriteria = "QUALIFI_CODE";
    searchValue = args.qualificationCode;
  } else {
    searchCriteria = "QUALIFI_NAME";
    searchValue = args.qualificationName;
  }

  // STEP 1: Search for the Qualification
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
  searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "100");
  searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  searchFormData.append("ctl00_body_grdsummary_ClientState", "");

  const searchResponse = await fetch(url, {
    method: "POST",
    headers,
    body: searchFormData
  });

  const searchDoc = parser.parseFromString(await searchResponse.text(), "text/html");

  const searchViewState = searchDoc.querySelector("#__VIEWSTATE")?.value || "";
  const searchEventValidation = searchDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const searchViewStateGen = searchDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // Find the matching row
  let row = null;
  const rows = searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
  
  for (const r of rows) {
    const cells = r.querySelectorAll("td");
    const rowCode = cells[0]?.textContent.trim();
    const rowName = cells[1]?.textContent.trim();
    
    if (args.qualificationCode && rowCode === args.qualificationCode) {
      row = r;
      break;
    } else if (args.qualificationName && rowName === args.qualificationName) {
      row = r;
      break;
    }
  }

  if (!row) {
    return {
      status: "NOT_FOUND",
      message: "Qualification not found. Please verify the qualification code or name."
    };
  }

  // Get the edit link
  const editKey = row
    .querySelector("a")
    ?.getAttribute("href")
    ?.match(/__doPostBack\('([^']+)'/)?.[1];

  if (!editKey) {
    return {
      status: "ERROR",
      message: "Unable to open Qualification record."
    };
  }

  // STEP 2: Click on the row to open detail view
  const rowClickFormData = new FormData();
  rowClickFormData.append("scrollLeft", "0");
  rowClickFormData.append("scrollTop", "0");
  rowClickFormData.append("__EVENTTARGET", editKey);
  rowClickFormData.append("__EVENTARGUMENT", "");
  rowClickFormData.append("__VIEWSTATE", searchViewState);
  rowClickFormData.append("__VIEWSTATEGENERATOR", searchViewStateGen);
  rowClickFormData.append("__VIEWSTATEENCRYPTED", "");
  rowClickFormData.append("__EVENTVALIDATION", searchEventValidation);
  rowClickFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  rowClickFormData.append("ctl00$hdnQuickmenu", "1");
  rowClickFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
  rowClickFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);
  rowClickFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  rowClickFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  rowClickFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "100");
  rowClickFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  rowClickFormData.append("ctl00_body_grdsummary_ClientState", "");

  const detailResponse = await fetch(url, {
    method: "POST",
    headers,
    body: rowClickFormData
  });

  const detailDoc = parser.parseFromString(await detailResponse.text(), "text/html");

  // Extract current values from detail view
  const currentCode = detailDoc.querySelector("#ctl00_body_txtCode")?.value || "";
  const currentName = detailDoc.querySelector("#ctl00_body_txtName")?.value || "";
  const currentRatingMethodCode = detailDoc.querySelector("#ctl00_body_dpRatmethod")?.value || "";
  const currentQualificationTypeCode = detailDoc.querySelector("#ctl00_body_dpSalary")?.value || "";
  const currentClassificationCode = detailDoc.querySelector("#ctl00_body_dpClassification")?.value || "";
  const currentHasExpiration = detailDoc.querySelector("#ctl00_body_ChkisExpire")?.checked || false;

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

  // Determine rating method code
  let updatedRatingMethodCode = currentRatingMethodCode;
  if (args.ratingMethodCode !== undefined) {
    updatedRatingMethodCode = args.ratingMethodCode;
  } else if (args.ratingMethodName !== undefined) {
    const foundCode = findDropdownCode(detailDoc, "#ctl00_body_dpRatmethod", args.ratingMethodName);
    if (foundCode) {
      updatedRatingMethodCode = foundCode;
    } else if (args.ratingMethodName !== "") {
      return {
        status: "INVALID_ARGS",
        message: `Rating Method "${args.ratingMethodName}" not found in the dropdown. Please verify the rating method name.`
      };
    }
  }

  // Determine qualification type code
  let updatedQualificationTypeCode = currentQualificationTypeCode;
  if (args.qualificationTypeCode !== undefined) {
    updatedQualificationTypeCode = args.qualificationTypeCode;
  } else if (args.qualificationTypeName !== undefined) {
    const foundCode = findDropdownCode(detailDoc, "#ctl00_body_dpSalary", args.qualificationTypeName);
    if (foundCode) {
      updatedQualificationTypeCode = foundCode;
    } else if (args.qualificationTypeName !== "") {
      return {
        status: "INVALID_ARGS",
        message: `Qualification Type "${args.qualificationTypeName}" not found in the dropdown. Please verify the qualification type name.`
      };
    }
  }

  // Determine classification code (will be resolved after qualification type change if needed)
  let updatedClassificationCode = currentClassificationCode;
  if (args.classificationCode !== undefined) {
    updatedClassificationCode = args.classificationCode;
  } else if (args.classificationName !== undefined) {
    const foundCode = findDropdownCode(detailDoc, "#ctl00_body_dpClassification", args.classificationName);
    if (foundCode) {
      updatedClassificationCode = foundCode;
    } else if (args.classificationName !== "") {
      // Don't return error yet - might need to refresh classification options first
      updatedClassificationCode = null;
    }
  }

  // Merge with updates (only update fields that are provided)
  const updatedName = args.newQualificationName !== undefined ? args.newQualificationName : currentName;
  const updatedHasExpiration = args.hasExpiration !== undefined ? 
    (args.hasExpiration === "true" || args.hasExpiration === true) : currentHasExpiration;

  const detailViewState = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
  const detailEventValidation = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const detailViewStateGen = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // STEP 3: Click Edit button to enter edit mode
  const editFormData = new FormData();
  editFormData.append("scrollLeft", "0");
  editFormData.append("scrollTop", "0");
  editFormData.append("__EVENTTARGET", "");
  editFormData.append("__EVENTARGUMENT", "");
  editFormData.append("__VIEWSTATE", detailViewState);
  editFormData.append("__VIEWSTATEGENERATOR", detailViewStateGen);
  editFormData.append("__VIEWSTATEENCRYPTED", "");
  editFormData.append("__EVENTVALIDATION", detailEventValidation);
  editFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  editFormData.append("ctl00$hdnQuickmenu", "1");
  editFormData.append("ctl00$body$butEdit", "Edit");

  const editModeResponse = await fetch(url, {
    method: "POST",
    headers,
    body: editFormData
  });

  const editModeDoc = parser.parseFromString(await editModeResponse.text(), "text/html");

  let saveViewState = editModeDoc.querySelector("#__VIEWSTATE")?.value || "";
  let saveEventValidation = editModeDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  let saveViewStateGen = editModeDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // STEP 4: If qualification type is being changed, trigger intermediate POST to refresh classification options
  let finalDoc = editModeDoc;
  if ((args.qualificationTypeCode !== undefined || args.qualificationTypeName !== undefined) && 
      updatedQualificationTypeCode !== currentQualificationTypeCode) {
    
    const typeChangeFormData = new FormData();
    typeChangeFormData.append("scrollLeft", "0");
    typeChangeFormData.append("scrollTop", "0");
    typeChangeFormData.append("__EVENTTARGET", "ctl00$body$dpSalary");
    typeChangeFormData.append("__EVENTARGUMENT", "");
    typeChangeFormData.append("__VIEWSTATE", saveViewState);
    typeChangeFormData.append("__VIEWSTATEGENERATOR", saveViewStateGen);
    typeChangeFormData.append("__VIEWSTATEENCRYPTED", "");
    typeChangeFormData.append("__EVENTVALIDATION", saveEventValidation);
    typeChangeFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    typeChangeFormData.append("ctl00$hdnQuickmenu", "1");
    typeChangeFormData.append("ctl00$body$txtName", updatedName);
    
    if (updatedHasExpiration) {
      typeChangeFormData.append("ctl00$body$ChkisExpire", "on");
    }
    
    typeChangeFormData.append("ctl00$body$dpRatmethod", updatedRatingMethodCode);
    typeChangeFormData.append("ctl00$body$dpSalary", updatedQualificationTypeCode);
    typeChangeFormData.append("ctl00$body$dpClassification", "-1");

    const typeChangeResponse = await fetch(url, {
      method: "POST",
      headers,
      body: typeChangeFormData
    });

    finalDoc = parser.parseFromString(await typeChangeResponse.text(), "text/html");
    
    saveViewState = finalDoc.querySelector("#__VIEWSTATE")?.value || saveViewState;
    saveEventValidation = finalDoc.querySelector("#__EVENTVALIDATION")?.value || saveEventValidation;
    saveViewStateGen = finalDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || saveViewStateGen;

    // Now try to resolve classification by name if it was provided and not found earlier
    if (args.classificationName !== undefined && updatedClassificationCode === null) {
      const foundCode = findDropdownCode(finalDoc, "#ctl00_body_dpClassification", args.classificationName);
      if (foundCode) {
        updatedClassificationCode = foundCode;
      } else {
        return {
          status: "INVALID_ARGS",
          message: `Classification "${args.classificationName}" not found in the dropdown after changing qualification type. Please verify the classification name.`
        };
      }
    }
  }

  // Ensure classification code is valid
  if (updatedClassificationCode === null) {
    updatedClassificationCode = currentClassificationCode;
  }

  // STEP 5: Save the changes
  const saveFormData = new FormData();
  saveFormData.append("scrollLeft", "0");
  saveFormData.append("scrollTop", "0");
  saveFormData.append("__EVENTTARGET", "");
  saveFormData.append("__EVENTARGUMENT", "");
  saveFormData.append("__VIEWSTATE", saveViewState);
  saveFormData.append("__VIEWSTATEGENERATOR", saveViewStateGen);
  saveFormData.append("__VIEWSTATEENCRYPTED", "");
  saveFormData.append("__EVENTVALIDATION", saveEventValidation);
  saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  saveFormData.append("ctl00$hdnQuickmenu", "1");
  saveFormData.append("ctl00$body$txtName", updatedName);
  
  // Handle expiration checkbox
  if (updatedHasExpiration) {
    saveFormData.append("ctl00$body$ChkisExpire", "on");
  }
  
  saveFormData.append("ctl00$body$dpRatmethod", updatedRatingMethodCode);
  saveFormData.append("ctl00$body$dpSalary", updatedQualificationTypeCode);
  saveFormData.append("ctl00$body$dpClassification", updatedClassificationCode);
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

    // Get dropdown names for response
    const getRatingMethodName = () => {
      if (updatedRatingMethodCode) {
        const option = finalDoc.querySelector(`#ctl00_body_dpRatmethod option[value="${updatedRatingMethodCode}"]`);
        return option?.textContent.trim() || null;
      }
      return null;
    };

    const getQualificationTypeName = () => {
      if (updatedQualificationTypeCode) {
        const option = finalDoc.querySelector(`#ctl00_body_dpSalary option[value="${updatedQualificationTypeCode}"]`);
        return option?.textContent.trim() || null;
      }
      return null;
    };

    const getClassificationName = () => {
      if (updatedClassificationCode) {
        const option = finalDoc.querySelector(`#ctl00_body_dpClassification option[value="${updatedClassificationCode}"]`);
        return option?.textContent.trim() || null;
      }
      return null;
    };

    return {
      status: "SUCCESS",
      message: `Successfully updated Qualification (${currentCode})`,
      qualificationCode: currentCode,
      qualificationName: updatedName,
      ratingMethodCode: updatedRatingMethodCode,
      ratingMethodName: getRatingMethodName(),
      qualificationTypeCode: updatedQualificationTypeCode,
      qualificationTypeName: getQualificationTypeName(),
      classificationCode: updatedClassificationCode,
      classificationName: getClassificationName(),
      hasExpiration: updatedHasExpiration
    };
  }

  return {
    status: "ERROR",
    message: "Failed to update Qualification. Please verify in the UI."
  };
})