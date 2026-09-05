(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/StationInformation.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Station Information screen. Please contact HR Admin."
    };
  }

  // Validate required fields
  if (!args.stationName || !args.transportCost) {
    return {
      status: "INVALID_ARGS",
      message: "Both stationName and transportCost are required to create a new station"
    };
  }

  // Validate that either routeCode or routeName is provided
  if (!args.routeCode && !args.routeName) {
    return {
      status: "INVALID_ARGS",
      message: "Either routeCode or routeName is required to create a new station"
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

  // Click New button to open new station form
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
  newFormData.append("ctl00$body$ContentSearch$cboCriteria", "STATION_CODE");
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

  // Determine route code - with flexible input handling
  let routeCode = "";
  
  // If routeCode is provided, use it directly
  if (args.routeCode) {
    routeCode = args.routeCode;
  }
  // If routeName is provided, look it up in the dropdown
  else if (args.routeName) {
    const routeDropdown = newDoc.querySelector("#ctl00_body_dpRoute");
    const options = routeDropdown?.querySelectorAll("option") || [];
    
    let foundRouteCode = null;
    for (const option of options) {
      const optionText = option.textContent.trim();
      const optionValue = option.value;
      
      if (optionText.toLowerCase().includes(args.routeName.toLowerCase()) && optionValue !== "-1") {
        foundRouteCode = optionValue;
        break;
      }
    }
    
    if (foundRouteCode) {
      routeCode = foundRouteCode;
    } else {
      return {
        status: "INVALID_ARGS",
        message: `Route "${args.routeName}" not found in the dropdown. Please verify the route name.`
      };
    }
  }

  // Save the new station
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
  saveFormData.append("ctl00$body$txtStation", args.stationName);
  saveFormData.append("ctl00$body$txtCost", args.transportCost);
  saveFormData.append("ctl00$body$dpRoute", routeCode);
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

    // Extract the newly created station code from the response
    const newCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value || "";

    // Get route name from the dropdown for response
    let routeName = null;
    if (routeCode) {
      const routeOption = newDoc.querySelector(`#ctl00_body_dpRoute option[value="${routeCode}"]`);
      routeName = routeOption?.textContent.trim() || null;
    }

    return {
      status: "SUCCESS",
      message: `Successfully created new Station Information${newCode ? ` (${newCode})` : ""}`,
      stationCode: newCode,
      stationName: args.stationName,
      transportCost: args.transportCost,
      routeCode: routeCode,
      routeName: routeName
    };
  }

  return {
    status: "ERROR",
    message: "Failed to create Station Information. Please verify in the UI."
  };
})