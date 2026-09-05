(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("Classification");

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
    "ctl00$body$ContentSearch$cboCriteria": "CLASSIFICATION_ID",
    "ctl00$body$ContentSearch$txtContent": args.classificationCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "Classification");

  const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: searchResponse.postBackCode,
    __EVENTARGUMENT: "",
    __VIEWSTATE: searchResponse.viewState,
    __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: searchResponse.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$ContentSearch$cboCriteria": "CLASSIFICATION_ID",
    "ctl00$body$ContentSearch$txtContent": args.classificationCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "Classification");

  window.cl = postBackResponse;

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const classification = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

  const result = {
    code,
    classification
  };
  return result;
  
});
