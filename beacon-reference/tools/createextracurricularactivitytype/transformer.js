(async function (data, args, reqOptions) {
  try {
    /* Access validation */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/ExtraCulActivityType.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Extra Curricular Activity Type screen. Please contact HR Admin."
      };
    }

    /* Input validation */
    if (!args?.typeName || args.typeName.trim() === "") {
      return {
        status: "INVALID_ARGS",
        message: "Error: typeName is required"
      };
    }

    if (args.typeName.length > 120) {
      return {
        status: "INVALID_ARGS",
        message: "Error: typeName must be 120 characters or less"
      };
    }

    if (!args?.categoryCode && !args?.categoryName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either categoryCode or categoryName is required for creating an activity type"
      };
    }

    /* Initial page state */
    const details = await BeaconBar.executeFunction("getApiList")("ExtraCulActivityType");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/ExtraCulActivityType.aspx");

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/ExtraCulActivityType.aspx`;

    const parser = new DOMParser();

    /* Step 1: Click New to get the form with category dropdown */
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
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "EATYPE_CODE");
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

    /* Extract category dropdown and find matching code */
    const categorySelect = newDoc.querySelector("#ctl00_body_dprating");
    const options = categorySelect?.querySelectorAll("option");

    let categoryCodeToUse = null;

    // Determine category code - prioritize direct code, then lookup name
    if (args.categoryCode !== undefined) {
      // If category code is provided directly, use it
      const inputCategoryCode = args.categoryCode.trim();
      
      // If input is already a 6-digit code, use it directly
      if (/^\d{6}$/.test(inputCategoryCode)) {
        categoryCodeToUse = inputCategoryCode;
      } else {
        // Search for category name (case-insensitive) in case user passed name to 'categoryCode' param
        for (const option of options) {
          const optionText = option.textContent.trim();
          const optionValue = option.value;
          
          if (optionValue !== "" && optionValue !== "-1" &&
              optionText.toLowerCase() === inputCategoryCode.toLowerCase()) {
            categoryCodeToUse = optionValue;
            break;
          }
        }
      }
    } else if (args.categoryName !== undefined) {
      // Search for category name (case-insensitive)
      const inputCategoryName = args.categoryName.trim();
      
      for (const option of options) {
        const optionText = option.textContent.trim();
        const optionValue = option.value;
        
        if (optionValue !== "" && optionValue !== "-1" &&
            optionText.toLowerCase() === inputCategoryName.toLowerCase()) {
          categoryCodeToUse = optionValue;
          break;
        }
      }
    }

    if (!categoryCodeToUse) {
      // Collect available categories for error message
      const availableCategories = Array.from(options)
        .filter(opt => opt.value !== "" && opt.value !== "-1")
        .map(opt => opt.textContent.trim());

      const searchTerm = args.categoryCode || args.categoryName;
      return {
        status: "INVALID_ARGS",
        message: `Category "${searchTerm}" not found in the system`,
        suggestion: `Available categories: ${availableCategories.join(", ")}`
      };
    }

    /* Step 2: Save with the resolved category code */
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
    saveFormData.append("ctl00$body$txtName", args.typeName.trim());
    saveFormData.append("ctl00$body$dprating", categoryCodeToUse);
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

      // Extract the generated activity type code from the saved record
      const activityTypeCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

      return {
        status: "SUCCESS",
        message: "Successfully created Extra Curricular Activity Type!",
        typeName: args.typeName.trim(),
        activityTypeCode: activityTypeCode,
        category: args.categoryCode || args.categoryName,
        categoryCode: categoryCodeToUse
      };
    }

    return {
      status: "ERROR",
      message: "Failed to create activity type. Please verify in the UI."
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
})