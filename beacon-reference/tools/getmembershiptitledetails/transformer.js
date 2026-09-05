(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("MemberShipTitles");

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
    "ctl00$body$ContentSearch$cboCriteria": "MEMBTITLE_CODE",
    "ctl00$body$ContentSearch$txtContent": args.membershipTitleCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "MemberShipTitles");

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
    "ctl00$body$ContentSearch$cboCriteria": "MEMBTITLE_CODE",
    "ctl00$body$ContentSearch$txtContent": args.membershipTitleCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "MemberShipTitles");

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const getValue = (id) => {
    const el = doc.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const membershipTitleDetails = {
    code: getValue("ctl00_body_txtCode"),
    membershipTitle: getValue("ctl00_body_txtName")
  };

  window.mt = postBackResponse;

  return membershipTitleDetails;
})
