(async function (data, args, reqOptions) {
  const stringToBoolean = (val) => {
    if (typeof val === "string") {
      return ["true", "yes", "1"].includes(val.toLowerCase().trim());
    }
    return Boolean(val);
  };

  if (!BeaconBar.user.metaData.menus.includes("EIM/Country.aspx")) {
    return "You do not have access to Country screen. Please contact HR Admin.";
  }

  if (!args.countryCode) {
    return "Error: countryCode is required";
  }

  const details = await BeaconBar.executeFunction("getApiList")("Country");

  const headers = new Headers();
  headers.append(
    "Accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
  );
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Country.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/Country.aspx`;

  const parser = new DOMParser();

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
  searchFormData.append("ctl00$body$ContentSearch$cboCriteria", "COU_CODE");
  searchFormData.append("ctl00$body$ContentSearch$txtContent", args.countryCode);
  searchFormData.append("ctl00$body$ContentSearch$butSearch", "Search");
  searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
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

  let row = null;
  const rows = searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
  for (const r of rows) {
    const code = r.querySelector("td")?.textContent.trim();
    if (code === args.countryCode) {
      row = r;
      break;
    }
  }

  if (!row) {
    return "Country not found. Please verify the country code.";
  }

  const editKey = row
    .querySelector("a")
    ?.getAttribute("href")
    ?.match(/__doPostBack\('([^']+)'/)?.[1];

  if (!editKey) {
    return "Unable to open country record.";
  }

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

  const detailResponse = await fetch(url, {
    method: "POST",
    headers,
    body: rowClickFormData
  });

  const detailDoc = parser.parseFromString(await detailResponse.text(), "text/html");

  const currentCode = detailDoc.querySelector("#ctl00_body_txtCode")?.value || args.countryCode;
  const currentName = detailDoc.querySelector("#ctl00_body_txtName")?.value || "";
  const currentIsBase = detailDoc.querySelector("#ctl00_body_chkBase")?.checked || false;
  const hdnPreCountry = detailDoc.querySelector("#ctl00_body_hdnPreCountry")?.value || "";

  const updatedName = args.countryName !== undefined ? args.countryName : currentName;
  const updatedIsBase = args.isBase !== undefined ? stringToBoolean(args.isBase) : currentIsBase;

  const detailViewState = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
  const detailEventValidation = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const detailViewStateGen = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

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

  saveFormData.append("ctl00$body$txtCode", currentCode);
  saveFormData.append("ctl00$body$txtName", updatedName);
  saveFormData.append("ctl00$body$chkBase", updatedIsBase ? "on" : "");
  saveFormData.append("ctl00$body$hdnPreCountry", hdnPreCountry);
  saveFormData.append("ctl00$body$butSave", "Save");

  const finalResponse = await fetch(url, {
    method: "POST",
    headers,
    body: saveFormData
  });

  await finalResponse.text();

  if (finalResponse.status === 200) {
    return `Successfully updated country (${args.countryCode}).`;
  }

  return "Failed to update country. Please verify in the UI.";

});
