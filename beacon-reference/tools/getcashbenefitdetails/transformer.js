(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("CashBenifit");

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
    "ctl00$body$ContentSearch$cboCriteria": "DATA.BEN_CODE",
    "ctl00$body$ContentSearch$txtContent": args.cashBenefitCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "CashBenifit");

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
    "ctl00$body$ContentSearch$cboCriteria": "DATA.BEN_CODE",
    "ctl00$body$ContentSearch$txtContent": args.cashBenefitCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "CashBenifit");

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  window.cb = postBackResponse;

  const getValue = (id) => doc.getElementById(id)?.value?.trim() || "";
  const getSelectedText = (id) => {
    const el = doc.getElementById(id);
    return el ? el.options[el.selectedIndex]?.text.trim() || "" : "";
  };

  const cashbenefitdetails = {
    code: getValue("ctl00_body_txtCode"),
    description: getValue("ctl00_body_txtName"),
    amount: getValue("ctl00_body_nuamount"),
    currency: getSelectedText("ctl00_body_cboCurrency"),
    rateEffectiveDate: getValue("ctl00_body_dtRateEffDate_txtDate")
  };

  const select = doc.getElementById("ctl00_body_cboCurrency");
  if (!select) return [];

  const allcurrencies = Array.from(select.options)
    .filter(opt => opt.value && opt.value !== "-1")
    .map(opt => ({
      value: opt.value,
      text: opt.text.trim()
    }));

  return {cashbenefitdetails,allcurrencies};
})
