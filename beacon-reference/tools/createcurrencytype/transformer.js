(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/CurrencyType.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Currency Type screen. Please contact HR Admin."
    };
  }

  // Validate required fields
  if (!args.currencyName || !args.currencySymbol) {
    return {
      status: "INVALID_ARGS",
      message: "Both currencyName and currencySymbol are required to create a new currency"
    };
  }

  // Check if user wants to set as base currency
  const isBase = args.isBaseCurrency === "true" || args.isBaseCurrency === true;
  
  // If setting as base currency, require confirmation
  if (isBase && !args.confirmBaseChange) {
    return {
      status: "CONFIRMATION_REQUIRED",
      message: "You are about to change the base currency. This will affect all currency calculations in the system. Please confirm by setting confirmBaseChange to 'true'.",
      action: "Please add confirmBaseChange: 'true' to proceed with base currency change"
    };
  }

  const details = await BeaconBar.executeFunction("getApiList")("CurrencyType");

  const headers = new Headers();
  headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/CurrencyType.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/CurrencyType.aspx`;

  const parser = new DOMParser();

  // Click New button to open new currency form
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
  newFormData.append("ctl00$body$ContentSearch$cboCriteria", "CURRENCY_ID");
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

  const newViewState = newDoc.querySelector("#__VIEWSTATE")?.value || "";
  const newEventValidation = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const newViewStateGen = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  
  // Get the previous base currency name if exists
  const previousBaseCurrency = newDoc.querySelector("#ctl00_body_txtPreCur")?.value || "";

  // Determine exchange rate
  // If base currency is checked, rate should be 1 (or empty as system handles it)
  // If not base currency and user provided rate, use it
  let exchangeRate = "";
  if (isBase) {
    // When base currency, rate is automatically set to 1 by the system
    exchangeRate = "";
  } else if (args.exchangeRate !== undefined) {
    exchangeRate = args.exchangeRate;
  }

  // Save the new currency
  const saveFormData = new FormData();
  saveFormData.append("scrollLeft", "0");
  saveFormData.append("scrollTop", "0");
  saveFormData.append("__EVENTTARGET", "");
  saveFormData.append("__EVENTARGUMENT", "");
  saveFormData.append("__VIEWSTATE", newViewState);
  saveFormData.append("__VIEWSTATEGENERATOR", newViewStateGen);
  saveFormData.append("__VIEWSTATEENCRYPTED", "");
  saveFormData.append("__EVENTVALIDATION", newEventValidation);
  saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  saveFormData.append("ctl00$hdnQuickmenu", "1");
  saveFormData.append("ctl00$body$hdnPreCur", "");
  saveFormData.append("ctl00$body$txtName", args.currencyName);
  saveFormData.append("ctl00$body$txtPreCur", previousBaseCurrency);
  saveFormData.append("ctl00$body$txtSymbol", args.currencySymbol);
  
  // Add base currency checkbox if true
  if (isBase) {
    saveFormData.append("ctl00$body$chkBase", "on");
  }
  
  // Add exchange rate if provided and not base currency
  if (exchangeRate !== "") {
    saveFormData.append("ctl00$body$nuRate", exchangeRate);
  } else {
    saveFormData.append("ctl00$body$nuRate", "");
  }
  
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

    // Extract the newly created currency code from the response
    const newCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

    return {
      status: "SUCCESS",
      message: `Successfully created new Currency Type${newCode ? ` (${newCode})` : ""}`,
      currencyCode: newCode,
      currencyName: args.currencyName,
      currencySymbol: args.currencySymbol,
      isBaseCurrency: isBase,
      exchangeRate: isBase ? "1" : (exchangeRate || "Not set"),
      previousBaseCurrency: isBase && previousBaseCurrency ? previousBaseCurrency : null
    };
  }

  return {
    status: "ERROR",
    message: "Failed to create Currency Type. Please verify in the UI."
  };
})