(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("BargainingUnit");

  const newInt = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: details.viewState,
    __VIEWSTATEGENERATOR: details.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: details.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$ContentSearch$cboCriteria": "BGN_UNIT_CODE",
    "ctl00$body$ContentSearch$txtContent": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$body$butNew": "New",
    "ctl00$body$hdnEventType": ""
  }, "BargainingUnit");

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: newInt.viewState,
    __VIEWSTATEGENERATOR: newInt.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: newInt.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$txtBGNName": args["ctl00_body_txtBGNName"] || "",
    "ctl00$body$txtAbbreviation": args["ctl00_body_txtAbbreviation"] || "",
    "ctl00$body$txtRegDate": args["ctl00_body_txtRegDate"] || "",
    "ctl00$body$txtRegNumber": args["ctl00_body_txtRegNumber"] || "",
    "ctl00$body$txtRegBody": args["ctl00_body_txtRegBody"] || "",
    "ctl00$body$butSave": "Save",
    "ctl00$body$hdnEventType": "1"
  }, "BargainingUnit");

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const getValue = (id) => {
    const el = doc.getElementById(id);
    return el ? el.value.trim() : "";
  };

  return {
    code: getValue("ctl00_body_txtBGNCode"),
    name: getValue("ctl00_body_txtBGNName"),
    abbreviation: getValue("ctl00_body_txtAbbreviation"),
    registeredDate: getValue("ctl00_body_txtRegDate"),
    registeredNumber: getValue("ctl00_body_txtRegNumber"),
    registeredBody: getValue("ctl00_body_txtRegBody")
  };
})