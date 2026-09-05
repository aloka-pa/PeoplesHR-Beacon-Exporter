(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("CashBenifit");

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
    "ctl00$body$ContentSearch$cboCriteria": "DATA.BEN_CODE",
    "ctl00$body$ContentSearch$txtContent": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$body$butNew": "New"
  }, "CashBenifit");

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
    "ctl00$body$txtName": args["ctl00_body_txtName"] || "",
    "ctl00$body$nuamount": args["ctl00_body_nuamount"] || "",
    "ctl00$body$cboCurrency": args["ctl00_body_cboCurrency"] || "",
    "ctl00$body$dtRateEffDate$txtDate": args["ctl00_body_dtRateEffDate_txtDate"] || "",
    "ctl00$body$dtRateEffDate$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$butSave": "Save"
  }, "CashBenifit");

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const getValue = (id) => doc.getElementById(id)?.value?.trim() || "";

  const getSelectedText = (id) => {
    const el = doc.getElementById(id);
    return el ? el.options[el.selectedIndex]?.text.trim() || "" : "";
  };

  const createCashBenefitDetails = {
    code: getValue("ctl00_body_txtCode"),
    description: getValue("ctl00_body_txtName"),
    amount: getValue("ctl00_body_nuamount"),
    currency: getSelectedText("ctl00_body_cboCurrency"),
    rateEffectiveDate: getValue("ctl00_body_dtRateEffDate_txtDate")
  };

  return createCashBenefitDetails;
})