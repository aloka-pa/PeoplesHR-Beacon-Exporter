(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("BloodGroup");

  const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: details.viewState,
    __VIEWSTATEGENERATOR: details.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: details.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$ContentSearch$cboCriteria": "BLGRP_ID",
    "ctl00$body$ContentSearch$txtContent": args.bloodgroupCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "BloodGroup");

  const parser = new DOMParser();
  const doc = parser.parseFromString(searchResponse.rawData, "text/html");

  const link = doc.querySelector("tr.GridRow_Default a[href^='javascript:__doPostBack']");
  const href = link?.getAttribute("href") || "";
  const match = href.match(/__doPostBack\('([^']+)'/);

  const postBackId = match ? match[1] : "";
  const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: postBackId,
    __EVENTARGUMENT: "",
    __VIEWSTATE: searchResponse.viewState,
    __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: searchResponse.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$ContentSearch$cboCriteria": "BLGRP_ID",
    "ctl00$body$ContentSearch$txtContent": args.bloodgroupCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "BloodGroup");

  window.bg = postBackResponse;

  const document = parser.parseFromString(postBackResponse.rawData, "text/html");

  const code = document.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const bloodgroup = document.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

  const result = {
    code,
    bloodgroup
  };

  return result;
});
