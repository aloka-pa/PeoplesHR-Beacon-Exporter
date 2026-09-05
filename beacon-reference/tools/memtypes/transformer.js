(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("Membership");
  const response = await BeaconBar.executeFunction("getEIMApii")(
    {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "MEMBSHIP_CODE",
      "ctl00$body$ContentSearch$txtContent": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New"
    },
    "Membership"
  )
  window.cm = response;
  const parser = new DOMParser();
  const document = parser.parseFromString(response.rawData, "text/html");

  const select = document.getElementById("ctl00_body_dpcountry");

  const allMembershipTypes = select
    ? Array.from(select.options)
      .filter(opt => opt.value !== "-1" && opt.value.trim() && opt.text.trim())
      .map(opt => ({ value: opt.value, text: opt.text.trim() }))
    : [];

  return allMembershipTypes;
})
