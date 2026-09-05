(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifit.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const details = await BeaconBar.executeFunction("getApiList")("NonCashBenifit");

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
    "ctl00$body$ContentSearch$cboCriteria": "B.NBEN_CODE",
    "ctl00$body$ContentSearch$txtContent": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$body$butNew": "New"
  }, "NonCashBenifit");

  window.ncd = newInt;

  const parser = new DOMParser();
  const doc = parser.parseFromString(newInt.rawData, "text/html");

  const categorySelect = doc.getElementById("ctl00_body_dpCategory");
  const categories = [];

  if (categorySelect) {
    for (const option of categorySelect.options) {
      categories.push({
        value: option.value,
        text: option.text.trim()
      });
    }
  }
  return categories;
});
