(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Religion.aspx")) {
    return "You do not have access to Religion screen. Please contact HR Admin.";
  }

  if (!args.religionName || args.religionName.trim() === "") {
    return "Error: religionName is required";
  }

  // Fetch initial page state for Religion
  const details = await BeaconBar.executeFunction("getApiList")("Religion");

  const headers = new Headers();
  headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Religion.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/Religion.aspx`;

  // POST #1: Click New button
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
    body: newFormData,
  });

  const newHtml = await newResponse.text();
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(newHtml, "text/html");

  // Extract updated state from new page
  const viewState = newDoc.querySelector("#__VIEWSTATE")?.value || "";
  const eventValidation = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const viewStateGen = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // POST #2: Click Save with religion name
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
  saveFormData.append("ctl00$body$txtName", args.religionName.trim());
  saveFormData.append("ctl00$body$butSave", "Save");

  const saveResponse = await fetch(url, {
    method: "POST",
    headers,
    body: saveFormData,
  });

  await saveResponse.text();

  if (saveResponse.status === 200) {
    return "Successfully created religion record!";
  } else {
    return "Failed to create religion. Please try again.";
  }
})
