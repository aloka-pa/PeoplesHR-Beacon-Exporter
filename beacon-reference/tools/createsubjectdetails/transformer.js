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
    if (!args?.subjectName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: subjectName is required"
      };
    }

    if (!args?.qualificationCode && !args?.qualificationName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either qualificationCode or qualificationName is required"
      };
    }

    const subjectName = args.subjectName.trim();

    if (subjectName.length === 0) {
      return {
        status: "INVALID_ARGS",
        message: "Error: subjectName cannot be empty"
      };
    }

    if (subjectName.length > 100) {
      return {
        status: "INVALID_ARGS",
        message: "Error: subjectName must be 100 characters or less"
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

    /* Step 1: Click New button to open create form */
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
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "SBJ_CODE");
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

    const createViewState = newDoc.querySelector("#__VIEWSTATE")?.value || "";
    const createEventValidation = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const createViewStateGen = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    /* Step 2: Determine qualification code */
    let finalQualificationCode = "";
    let finalQualificationName = "";
    
    if (args.qualificationCode !== undefined) {
      const inputQualificationCode = args.qualificationCode.trim();
      
      // If input is already a 6-digit code, use it directly
      if (/^\d{6}$/.test(inputQualificationCode)) {
        finalQualificationCode = inputQualificationCode;
        
        // Get the qualification name for this code
        const qualificationSelect = newDoc.querySelector("#ctl00_body_dpqfcode");
        const matchingOption = qualificationSelect?.querySelector(`option[value="${inputQualificationCode}"]`);
        
        if (!matchingOption || matchingOption.value === "-1") {
          return {
            status: "INVALID_ARGS",
            message: `Qualification code "${inputQualificationCode}" not found`
          };
        }
        
        finalQualificationName = matchingOption.textContent.trim();
      } else {
        // Search for qualification name (case-insensitive partial match)
        const qualificationSelect = newDoc.querySelector("#ctl00_body_dpqfcode");
        const qualificationOptions = qualificationSelect?.querySelectorAll("option");
        
        const matchingQualifications = [];
        
        for (const option of qualificationOptions) {
          const optionText = option.textContent.trim();
          const optionValue = option.value;
          
          if (optionValue !== "" && optionValue !== "-1" && 
              optionText.toLowerCase().includes(inputQualificationCode.toLowerCase())) {
            matchingQualifications.push({
              code: optionValue,
              name: optionText
            });
          }
        }
        
        if (matchingQualifications.length === 0) {
          const availableQualifications = Array.from(qualificationOptions)
            .filter(opt => opt.value !== "" && opt.value !== "-1")
            .map(opt => opt.textContent.trim());
          
          return {
            status: "INVALID_ARGS",
            message: `No qualifications found matching "${inputQualificationCode}"`,
            suggestion: `Available qualifications: ${availableQualifications.join(", ")}`
          };
        }
        
        if (matchingQualifications.length > 1) {
          return {
            status: "AMBIGUOUS",
            message: `Multiple qualifications found matching "${inputQualificationCode}". Please be more specific.`,
            matches: matchingQualifications
          };
        }
        
        finalQualificationCode = matchingQualifications[0].code;
        finalQualificationName = matchingQualifications[0].name;
      }
    } else if (args.qualificationName !== undefined) {
      // Search for qualification name (case-insensitive partial match)
      const inputQualificationName = args.qualificationName.trim();
      const qualificationSelect = newDoc.querySelector("#ctl00_body_dpqfcode");
      const qualificationOptions = qualificationSelect?.querySelectorAll("option");
      
      const matchingQualifications = [];
      
      for (const option of qualificationOptions) {
        const optionText = option.textContent.trim();
        const optionValue = option.value;
        
        if (optionValue !== "" && optionValue !== "-1" && 
            optionText.toLowerCase().includes(inputQualificationName.toLowerCase())) {
          matchingQualifications.push({
            code: optionValue,
            name: optionText
          });
        }
      }
      
      if (matchingQualifications.length === 0) {
        const availableQualifications = Array.from(qualificationOptions)
          .filter(opt => opt.value !== "" && opt.value !== "-1")
          .map(opt => opt.textContent.trim());
        
        return {
          status: "INVALID_ARGS",
          message: `No qualifications found matching "${inputQualificationName}"`,
          suggestion: `Available qualifications: ${availableQualifications.join(", ")}`
        };
      }
      
      if (matchingQualifications.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `Multiple qualifications found matching "${inputQualificationName}". Please be more specific.`,
          matches: matchingQualifications
        };
      }
      
      finalQualificationCode = matchingQualifications[0].code;
      finalQualificationName = matchingQualifications[0].name;
    }

    /* Step 3: Save new subject */
    const saveFormData = new FormData();
    saveFormData.append("scrollLeft", "0");
    saveFormData.append("scrollTop", "0");
    saveFormData.append("__EVENTTARGET", "");
    saveFormData.append("__EVENTARGUMENT", "");
    saveFormData.append("__VIEWSTATE", createViewState);
    saveFormData.append("__VIEWSTATEGENERATOR", createViewStateGen);
    saveFormData.append("__VIEWSTATEENCRYPTED", "");
    saveFormData.append("__EVENTVALIDATION", createEventValidation);
    saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFormData.append("ctl00$hdnQuickmenu", "1");
    saveFormData.append("ctl00$body$txtName", subjectName);
    saveFormData.append("ctl00$body$dpqfcode", finalQualificationCode);
    saveFormData.append("ctl00$body$butSave", "Save");

    const saveResponse = await fetch(url, {
      method: "POST",
      headers,
      body: saveFormData
    });

    const saveHtml = await saveResponse.text();

    if (saveResponse.status === 200) {
      const saveDoc = parser.parseFromString(saveHtml, "text/html");
      
      // Check for error messages
      const errorMsg = saveDoc.querySelector(".alert-danger, .error")?.textContent;
      
      if (errorMsg) {
        return {
          status: "ERROR",
          message: `Save failed: ${errorMsg.trim()}`
        };
      }

      // Extract the newly created subject code from the response
      const newSubjectCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

      return {
        status: "SUCCESS",
        message: `Successfully created Subject: ${subjectName}`,
        subjectCode: newSubjectCode,
        subjectName: subjectName,
        qualificationCode: finalQualificationCode,
        qualificationName: finalQualificationName
      };
    }

    return {
      status: "ERROR",
      message: "Failed to create subject. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})