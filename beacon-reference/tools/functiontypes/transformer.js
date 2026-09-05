(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/FunctionalRole.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const details = await BeaconBar.executeFunction("getApiList")("FunctionalRole");

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
    "ctl00$body$ContentSearch$cboCriteria": "F.FUNCTION_ROLE_ID",
    "ctl00$body$ContentSearch$txtContent": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "5",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$body$butNew": "New"
  }, "FunctionalRole");

  const parser = new DOMParser();
  const doc = parser.parseFromString(newInt.rawData, "text/html");

  window.ft = newInt;

  const selectElement = doc.querySelector("#ctl00_body_dpcountry");
  const functionList = [];

  if (selectElement) {
    for (const option of selectElement.options) {
      functionList.push({
        value: option.value,
        text: option.textContent.trim()
      });
    }
  }

  return functionList;
});
