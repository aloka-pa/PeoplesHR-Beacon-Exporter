(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/StationInformation.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Station Information screen. Please contact HR Admin."
    };
  }

  // Validate input - user must provide one of the four search criteria to identify the record
  if (!args.stationCode && !args.stationName && !args.transportCost && !args.routeName) {
    return {
      status: "INVALID_ARGS",
      message: "Either stationCode, stationName, transportCost, or routeName is required to identify the station"
    };
  }

  // Validate that at least one update field is provided
  if (args.newStationName === undefined && args.newTransportCost === undefined && 
      args.newRouteCode === undefined && args.newRouteName === undefined) {
    return {
      status: "INVALID_ARGS",
      message: "At least one field to update must be provided: newStationName, newTransportCost, newRouteCode, or newRouteName"
    };
  }

  const details = await BeaconBar.executeFunction("getApiList")("StationInformation");

  const headers = new Headers();
  headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/StationInformation.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/StationInformation.aspx`;

  const parser = new DOMParser();

  // Determine search criteria based on what user provided
  let searchCriteria, searchValue;
  if (args.stationCode) {
    searchCriteria = "STATION_CODE";
    searchValue = args.stationCode;
  } else if (args.stationName) {
    searchCriteria = "STATION_NAME";
    searchValue = args.stationName;
  } else if (args.transportCost) {
    searchCriteria = "STATION_COST";
    searchValue = args.transportCost;
  } else {
    searchCriteria = "R.RT_NAME";
    searchValue = args.routeName;
  }

  // Search for the Station
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
  let currentRoute = null;
  const allTableRows = searchDoc.querySelectorAll("tbody tr");
  
  for (const r of allTableRows) {
    // Track group headers for route
    if (r.classList.contains("GroupHeader_Default")) {
      const routeText = r.querySelector("p")?.textContent.trim();
      if (routeText && routeText.startsWith("Route :")) {
        currentRoute = routeText.replace("Route :", "").trim();
      }
      continue;
    }
    
    // Check data rows
    if (r.id && r.id.startsWith("ctl00_body_grdsummary_ctl00__")) {
      const cells = r.querySelectorAll("td");
      const rowCode = cells[1]?.textContent.trim();
      const rowName = cells[2]?.textContent.trim();
      const rowCost = cells[3]?.querySelector("span")?.textContent.trim() || cells[3]?.textContent.trim();
      
      if (args.stationCode && rowCode === args.stationCode) {
        row = r;
        break;
      } else if (args.stationName && rowName === args.stationName) {
        row = r;
        break;
      } else if (args.transportCost && rowCost === args.transportCost) {
        row = r;
        break;
      } else if (args.routeName && currentRoute && currentRoute.toLowerCase().includes(args.routeName.toLowerCase())) {
        row = r;
        break;
      }
    }
  }

  if (!row) {
    return {
      status: "NOT_FOUND",
      message: "Station not found. Please verify the station code, name, transport cost, or route name."
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
      message: "Unable to open Station record."
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
  const currentStation = detailDoc.querySelector("#ctl00_body_txtStation")?.value || "";
  const currentCost = detailDoc.querySelector("#ctl00_body_txtCost")?.value || "";
  const currentRouteCode = detailDoc.querySelector("#ctl00_body_dpRoute")?.value || "";

  // Determine route code to use - with flexible input handling
  let updatedRouteCode = currentRouteCode;
  
  // If newRouteCode is provided, use it directly
  if (args.newRouteCode !== undefined) {
    updatedRouteCode = args.newRouteCode;
  }
  // If newRouteName is provided, look it up in the dropdown
  else if (args.newRouteName !== undefined) {
    const routeDropdown = detailDoc.querySelector("#ctl00_body_dpRoute");
    const options = routeDropdown?.querySelectorAll("option") || [];
    
    let foundRouteCode = null;
    for (const option of options) {
      const optionText = option.textContent.trim();
      const optionValue = option.value;
      
      if (optionText.toLowerCase().includes(args.newRouteName.toLowerCase()) && optionValue !== "-1") {
        foundRouteCode = optionValue;
        break;
      }
    }
    
    if (foundRouteCode) {
      updatedRouteCode = foundRouteCode;
    } else if (args.newRouteName !== "") {
      return {
        status: "INVALID_ARGS",
        message: `Route "${args.newRouteName}" not found in the dropdown. Please verify the route name.`
      };
    }
  }

  // Merge with updates (only update fields that are provided)
  const updatedStation = args.newStationName !== undefined ? args.newStationName : currentStation;
  const updatedCost = args.newTransportCost !== undefined ? args.newTransportCost : currentCost;

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
  saveFormData.append("ctl00$body$txtStation", updatedStation);
  saveFormData.append("ctl00$body$txtCost", updatedCost);
  saveFormData.append("ctl00$body$dpRoute", updatedRouteCode);
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

    // Get route name from the dropdown for response
    let routeName = null;
    if (updatedRouteCode) {
      const routeOption = editModeDoc.querySelector(`#ctl00_body_dpRoute option[value="${updatedRouteCode}"]`);
      routeName = routeOption?.textContent.trim() || null;
    }

    return {
      status: "SUCCESS",
      message: `Successfully updated Station Information (${currentCode})`,
      stationCode: currentCode,
      stationName: updatedStation,
      transportCost: updatedCost,
      routeCode: updatedRouteCode,
      routeName: routeName
    };
  }

  return {
    status: "ERROR",
    message: "Failed to update Station Information. Please verify in the UI."
  };
})