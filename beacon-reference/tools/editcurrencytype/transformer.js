(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/CurrencyType.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Currency Type screen. Please contact HR Admin."
    };
  }

  // Validate input - user must provide either currencyCode, currencyName, OR currencySymbol to identify the record
  if (!args.currencyCode && !args.currencyName && !args.currencySymbol) {
    return {
      status: "INVALID_ARGS",
      message: "Either currencyCode, currencyName, or currencySymbol is required to identify the currency"
    };
  }

  // Validate that at least one update field is provided
  if (args.newCurrencyName === undefined && args.newCurrencySymbol === undefined && 
      args.isBaseCurrency === undefined && args.exchangeRate === undefined) {
    return {
      status: "INVALID_ARGS",
      message: "At least one field to update must be provided: newCurrencyName, newCurrencySymbol, isBaseCurrency, or exchangeRate"
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

  // Determine search criteria based on what user provided
  let searchCriteria, searchValue;
  if (args.currencyCode) {
    searchCriteria = "CURRENCY_ID";
    searchValue = args.currencyCode;
  } else if (args.currencyName) {
    searchCriteria = "CURRENCY_NAME";
    searchValue = args.currencyName;
  } else {
    searchCriteria = "CURRENCY_SYMBOL";
    searchValue = args.currencySymbol;
  }

  // Search for the Currency Type
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
    const rowSymbol = cells[2]?.textContent.trim();
    
    if (args.currencyCode && rowCode === args.currencyCode) {
      row = r;
      break;
    } else if (args.currencyName && rowName === args.currencyName) {
      row = r;
      break;
    } else if (args.currencySymbol && rowSymbol === args.currencySymbol) {
      row = r;
      break;
    }
  }

  if (!row) {
    return {
      status: "NOT_FOUND",
      message: "Currency Type not found. Please verify the currency code, name, or symbol."
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
      message: "Unable to open Currency Type record."
    };
  }

  // Click on the row to open detail view
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
  const currentSymbol = detailDoc.querySelector("#ctl00_body_txtSymbol")?.value || "";
  const currentRate = detailDoc.querySelector("#ctl00_body_nuRate")?.value || "";
  const currentPreCur = detailDoc.querySelector("#ctl00_body_txtPreCur")?.value || "";
  const currentIsBase = detailDoc.querySelector("#ctl00_body_chkBase")?.checked || false;

  // Merge with updates (only update fields that are provided)
  const updatedName = args.newCurrencyName !== undefined ? args.newCurrencyName : currentName;
  const updatedSymbol = args.newCurrencySymbol !== undefined ? args.newCurrencySymbol : currentSymbol;
  const updatedRate = args.exchangeRate !== undefined ? args.exchangeRate : currentRate;

  const detailViewState = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
  const detailEventValidation = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const detailViewStateGen = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // Click Edit button to enter edit mode
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
  editFormData.append("ctl00$body$hdnPreCur", "");
  editFormData.append("ctl00$body$txtPreCur", currentPreCur);
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

  // Save the changes
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
  saveFormData.append("ctl00$body$hdnPreCur", "");
  saveFormData.append("ctl00$body$txtName", updatedName);
  saveFormData.append("ctl00$body$txtPreCur", currentPreCur);
  saveFormData.append("ctl00$body$txtSymbol", updatedSymbol);
  
  // Handle base currency checkbox
  if (args.isBaseCurrency !== undefined) {
    const isBase = args.isBaseCurrency === "true" || args.isBaseCurrency === true;
    if (isBase) {
      saveFormData.append("ctl00$body$chkBase", "on");
    }
  } else if (currentIsBase) {
    saveFormData.append("ctl00$body$chkBase", "on");
  }
  
  saveFormData.append("ctl00$body$nuRate", updatedRate);
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
      message: `Successfully updated Currency Type (${currentCode})`,
      currencyCode: currentCode,
      currencyName: updatedName,
      currencySymbol: updatedSymbol,
      exchangeRate: updatedRate,
      isBaseCurrency: args.isBaseCurrency !== undefined ? (args.isBaseCurrency === "true" || args.isBaseCurrency === true) : currentIsBase
    };
  }

  return {
    status: "ERROR",
    message: "Failed to update Currency Type. Please verify in the UI."
  };
})