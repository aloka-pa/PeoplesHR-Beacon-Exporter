(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Electorate.aspx")) {
    return "You do not have access to Electorate screen. Please contact HR Admin.";
  }

  // Validate input - user must provide either electorateCode OR electorateName to identify the electorate
  if (!args.electorateCode && !args.electorateName) {
    return "Error: Either electorateCode or electorateName is required to identify the electorate";
  }

  const details = await BeaconBar.executeFunction("getApiList")("Electorate");

  const headers = new Headers();
  headers.append(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Electorate.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/Electorate.aspx`;

  const parser = new DOMParser();

  // Determine search criteria based on what user provided
  let searchCriteria, searchValue;
  if (args.electorateCode) {
    searchCriteria = "ELECTORATE_CODE";
    searchValue = args.electorateCode;
  } else {
    searchCriteria = "ELECTORATE_NAME";
    searchValue = args.electorateName;
  }

  // Search for the electorate
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
  searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
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
    
    if (args.electorateCode && rowCode === args.electorateCode) {
      row = r;
      break;
    } else if (args.electorateName && rowName === args.electorateName) {
      row = r;
      break;
    }
  }

  if (!row) {
    return "Electorate not found. Please verify the electorate code or name.";
  }

  // Get the edit link
  const editKey = row
    .querySelector("a")
    ?.getAttribute("href")
    ?.match(/__doPostBack\('([^']+)'/)?.[1];

  if (!editKey) {
    return "Unable to open electorate record.";
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
  rowClickFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
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
  const currentDistrictCode = detailDoc.querySelector("#ctl00_body_drpDistrict")?.value || "";

  // Determine district code to use
  let updatedDistrictCode = currentDistrictCode;
  
  // If districtCode is provided, use it directly
  if (args.districtCode !== undefined) {
    updatedDistrictCode = args.districtCode;
  }
  // If districtName is provided, look it up in the dropdown
  else if (args.districtName !== undefined) {
    const districtDropdown = detailDoc.querySelector("#ctl00_body_drpDistrict");
    const options = districtDropdown?.querySelectorAll("option") || [];
    
    let foundDistrictCode = null;
    for (const option of options) {
      const optionText = option.textContent.trim();
      const optionValue = option.value;
      
      if (optionText.toLowerCase() === args.districtName.toLowerCase() && optionValue !== "") {
        foundDistrictCode = optionValue;
        break;
      }
    }
    
    if (foundDistrictCode) {
      updatedDistrictCode = foundDistrictCode;
    } else if (args.districtName !== "") {
      return `District "${args.districtName}" not found in the dropdown. Please verify the district name.`;
    }
  }

  // Merge with updates (only update fields that are provided)
  const updatedName = args.newElectorateName !== undefined ? args.newElectorateName : currentName;

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
  saveFormData.append("ctl00$body$txtName", updatedName);
  saveFormData.append("ctl00$body$drpDistrict", updatedDistrictCode);
  saveFormData.append("ctl00$body$butSave", "Save");

  const finalResponse = await fetch(url, {
    method: "POST",
    headers,
    body: saveFormData
  });

  await finalResponse.text();

  if (finalResponse.status === 200) {
    return `Successfully updated electorate (${currentCode}).`;
  }

  return "Failed to update electorate. Please verify in the UI.";
});