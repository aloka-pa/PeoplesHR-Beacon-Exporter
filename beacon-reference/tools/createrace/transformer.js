(async function (data, args, reqOptions) {
  /* -------------------------------------------------
   * 1. Access validation
   * ------------------------------------------------- */
  if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Race.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Race screen. Please contact HR Admin."
    };
  }

  /* -------------------------------------------------
   * 2. Input validation
   * ------------------------------------------------- */
  if (!args?.raceName || args.raceName.trim() === "") {
    return {
      status: "INVALID_ARGS",
      message: "Error: raceName is required"
    };
  }

  /* -------------------------------------------------
   * 3. Initial page state
   * ------------------------------------------------- */
  const details = await BeaconBar.executeFunction("getApiList")("Race");

  const headers = new Headers();
  headers.append(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")(
    "EIM/Race.aspx"
  );

  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/Race.aspx`;

  const parser = new DOMParser();

  /* -------------------------------------------------
   * 4. POST #1 – Click New
   * ------------------------------------------------- */
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
  
  // Add the search-related fields (from your network trace)
  newFormData.append("ctl00$body$ContentSearch$cboCriteria", "RAC_CODE");
  newFormData.append("ctl00$body$ContentSearch$txtContent", "");
  newFormData.append(
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox",
    "1"
  );
  newFormData.append(
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState",
    ""
  );
  newFormData.append(
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox",
    "5"
  );
  newFormData.append(
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState",
    ""
  );
  newFormData.append("ctl00_body_grdsummary_ClientState", "");
  
  newFormData.append("ctl00$body$butNew", "New");

  const newResponse = await fetch(url, {
    method: "POST",
    headers,
    body: newFormData
  });

  const newDoc = parser.parseFromString(
    await newResponse.text(),
    "text/html"
  );

  /* -------------------------------------------------
   * 5. Extract state after New
   * ------------------------------------------------- */
  const viewState =
    newDoc.querySelector("#__VIEWSTATE")?.value || "";
  const eventValidation =
    newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const viewStateGen =
    newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  /* -------------------------------------------------
   * 6. POST #2 – Enter name, description & Save
   * ------------------------------------------------- */
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
  
  // Enter the race name and optional description
  saveFormData.append("ctl00$body$txtrecName", args.raceName.trim());
  saveFormData.append("ctl00$body$txtrecDesc", args.raceDescription?.trim() || "");
  
  saveFormData.append("ctl00$body$butSave", "Save");

  const saveResponse = await fetch(url, {
    method: "POST",
    headers,
    body: saveFormData
  });

  await saveResponse.text();

  if (saveResponse.status === 200) {
    return {
      status: "SUCCESS",
      message: "Successfully created race record!",
      raceName: args.raceName,
      raceDescription: args.raceDescription || null
    };
  }

  return {
    status: "ERROR",
    message: "Failed to create race. Please verify in the UI."
  };
});