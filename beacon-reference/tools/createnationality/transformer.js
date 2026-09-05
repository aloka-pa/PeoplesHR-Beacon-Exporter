(async function (data, args, reqOptions) {
  /* -------------------------------------------------
   * 1. Access validation
   * ------------------------------------------------- */
  if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Nationality.aspx")) {
    return "You do not have access to Nationality screen. Please contact HR Admin.";
  }

  /* -------------------------------------------------
   * 2. Input validation
   * ------------------------------------------------- */
  if (!args?.nationalityName || args.nationalityName.trim() === "") {
    return "Error: nationalityName is required";
  }

  /* -------------------------------------------------
   * 3. Initial page state
   * ------------------------------------------------- */
  const details = await BeaconBar.executeFunction("getApiList")("Nationality");

  const headers = new Headers();
  headers.append(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")(
    "EIM/Nationality.aspx"
  );

  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/Nationality.aspx`;

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
   * 6. POST #2 – Enter name & Save
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
  saveFormData.append(
    "ctl00$body$txtName",
    args.nationalityName.trim()
  );
  saveFormData.append("ctl00$body$butSave", "Save");

  const saveResponse = await fetch(url, {
    method: "POST",
    headers,
    body: saveFormData
  });

  await saveResponse.text();

  if (saveResponse.status === 200) {
    return "Successfully created nationality record!";
  }

  return "Failed to create nationality. Please verify in the UI.";
});
