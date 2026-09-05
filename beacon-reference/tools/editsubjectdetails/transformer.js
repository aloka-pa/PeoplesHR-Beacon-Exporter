(async function (data, args, reqOptions) {
  try {
    /* Access validation */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Subjects.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Subjects screen. Please contact HR Admin."
      };
    }

    /* Input validation */
    if (!args?.subjectCode && !args?.subjectName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either subjectCode or subjectName is required to identify the record"
      };
    }

    if (!args?.newSubjectName && !args?.qualificationCode && !args?.qualificationName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: at least one of newSubjectName, qualificationCode, or qualificationName must be provided to update the record"
      };
    }

    if (args?.newSubjectName && args.newSubjectName.length > 100) {
      return {
        status: "INVALID_ARGS",
        message: "Error: newSubjectName must be 100 characters or less"
      };
    }

    /* Initial page state */
    const details = await BeaconBar.executeFunction("getApiList")("Subjects");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Subjects.aspx");

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Subjects.aspx`;

    const parser = new DOMParser();

    /* Determine search criteria */
    let searchCriteria, searchValue;
    if (args.subjectCode) {
      searchCriteria = "SBJ_CODE";
      searchValue = args.subjectCode.trim();
    } else {
      searchCriteria = "SBJ_NAME";
      searchValue = args.subjectName.trim();
    }

    /* Step 1: Search for the subject */
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

    /* Find matching row - CASE-INSENSITIVE PARTIAL MATCH for names, EXACT for codes */
    let row = null;
    const rows = searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
    
    for (const r of rows) {
      const cells = r.querySelectorAll("td");
      const rowCode = cells[0]?.textContent.trim();
      const rowName = cells[1]?.textContent.trim();
      
      if (args.subjectCode && rowCode === args.subjectCode) {
        row = r;
        break;
      } else if (args.subjectName && rowName.toLowerCase().includes(args.subjectName.toLowerCase())) {
        row = r;
        break;
      }
    }

    if (!row) {
      return {
        status: "NOT_FOUND",
        message: `Subject not found: "${searchValue}"`
      };
    }

    /* Get edit link */
    const editKey = row
      .querySelector("a")
      ?.getAttribute("href")
      ?.match(/__doPostBack\('([^']+)'/)?.[1];

    if (!editKey) {
      return {
        status: "ERROR",
        message: "Unable to open subject record for editing"
      };
    }

    /* Step 2: Click on edit icon to open detail view */
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

    /* Extract current values */
    const currentSubjectCode = detailDoc.querySelector("#ctl00_body_txtCode")?.value || "";
    const currentSubjectName = detailDoc.querySelector("#ctl00_body_txtName")?.value || "";
    const currentQualificationSelect = detailDoc.querySelector("#ctl00_body_dpqfcode");
    const currentQualificationCode = currentQualificationSelect?.value || "";

    const detailViewState = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
    const detailEventValidation = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const detailViewStateGen = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    /* Step 3: Click Edit button */
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

    const saveViewState = editModeDoc.querySelector("#__VIEWSTATE")?.value || "";
    const saveEventValidation = editModeDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const saveViewStateGen = editModeDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    /* Determine new qualification code if qualification name/code is provided */
    let finalQualificationCode = currentQualificationCode;
    
    if (args.qualificationCode !== undefined) {
      const inputQualificationCode = args.qualificationCode.trim();
      
      // If input is already a 6-digit code, use it directly
      if (/^\d{6}$/.test(inputQualificationCode)) {
        finalQualificationCode = inputQualificationCode;
      } else {
        // Search for qualification name (case-insensitive)
        const qualificationSelect = editModeDoc.querySelector("#ctl00_body_dpqfcode");
        const qualificationOptions = qualificationSelect?.querySelectorAll("option");
        
        let foundQualification = false;
        for (const option of qualificationOptions) {
          const optionText = option.textContent.trim();
          const optionValue = option.value;
          
          if (optionValue !== "" && optionValue !== "-1" && 
              optionText.toLowerCase() === inputQualificationCode.toLowerCase()) {
            finalQualificationCode = optionValue;
            foundQualification = true;
            break;
          }
        }
        
        if (!foundQualification) {
          const availableQualifications = Array.from(qualificationOptions)
            .filter(opt => opt.value !== "" && opt.value !== "-1")
            .map(opt => opt.textContent.trim());
          
          return {
            status: "INVALID_ARGS",
            message: `Qualification "${inputQualificationCode}" not found`,
            suggestion: `Available qualifications: ${availableQualifications.join(", ")}`
          };
        }
      }
    } else if (args.qualificationName !== undefined) {
      // Search for qualification name (case-insensitive)
      const inputQualificationName = args.qualificationName.trim();
      const qualificationSelect = editModeDoc.querySelector("#ctl00_body_dpqfcode");
      const qualificationOptions = qualificationSelect?.querySelectorAll("option");
      
      let foundQualification = false;
      for (const option of qualificationOptions) {
        const optionText = option.textContent.trim();
        const optionValue = option.value;
        
        if (optionValue !== "" && optionValue !== "-1" && 
            optionText.toLowerCase() === inputQualificationName.toLowerCase()) {
          finalQualificationCode = optionValue;
          foundQualification = true;
          break;
        }
      }
      
      if (!foundQualification) {
        const availableQualifications = Array.from(qualificationOptions)
          .filter(opt => opt.value !== "" && opt.value !== "-1")
          .map(opt => opt.textContent.trim());
        
        return {
          status: "INVALID_ARGS",
          message: `Qualification "${inputQualificationName}" not found`,
          suggestion: `Available qualifications: ${availableQualifications.join(", ")}`
        };
      }
    }

    /* Determine final subject name */
    const finalSubjectName = args.newSubjectName ? args.newSubjectName.trim() : currentSubjectName;

    /* Step 4: Save changes */
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
    saveFormData.append("ctl00$body$txtName", finalSubjectName);
    saveFormData.append("ctl00$body$dpqfcode", finalQualificationCode);
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

      return {
        status: "SUCCESS",
        message: `Successfully updated Subject (${currentSubjectCode})`,
        subjectCode: currentSubjectCode,
        previousSubjectName: currentSubjectName,
        newSubjectName: finalSubjectName,
        previousQualificationCode: currentQualificationCode,
        newQualificationCode: finalQualificationCode
      };
    }

    return {
      status: "ERROR",
      message: "Failed to update subject. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})