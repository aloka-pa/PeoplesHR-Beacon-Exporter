(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("MemberShipTitles");

  const create = await BeaconBar.executeFunction("getEIMApii")({
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
    "ctl00$body$ContentSearch$txtContent": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$body$butNew": "New"
  }, "MemberShipTitles");

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: create.viewState,
    __VIEWSTATEGENERATOR: create.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: create.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$txtName": args.membershipTitleName,
    "ctl00$body$butSave": "Save"
  }, "MemberShipTitles");

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const getValue = (id) => {
    const el = doc.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const createMembershipTitleDetails = {
    code: getValue("ctl00_body_txtCode"),
    membershipTitle: getValue("ctl00_body_txtName")
  };

  return createMembershipTitleDetails;
})
