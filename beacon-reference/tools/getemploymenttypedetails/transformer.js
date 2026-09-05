(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("EmployeementType");

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
    "ctl00$body$ContentSearch$cboCriteria": "EMPT_TYPE_CODE",
    "ctl00$body$ContentSearch$txtContent": args.empTypeCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "EmployeementType");

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
    "ctl00$body$ContentSearch$cboCriteria": "EMPT_TYPE_CODE",
    "ctl00$body$ContentSearch$txtContent": args.empTypeCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "EmployeementType");

  window.et = postBackResponse;

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const employeeTypeDetails = {
    code: doc.querySelector("#ctl00_body_txtempcode")?.value?.trim() || "",
    employmentType: doc.querySelector("#ctl00_body_txtempdesc")?.value?.trim() || "",
    dateLimited: doc.querySelector("#ctl00_body_cbisdatelimit")?.checked || false,
    duration: doc.querySelector("#ctl00_body_nuDuration")?.value?.trim() || "",
    durationUnit: doc.querySelector("#ctl00_body_dpDurationType option:checked")?.textContent.trim() || "",
    retirementAgeRequired: doc.querySelector("#ctl00_body_chkRetirementAge")?.checked || false,
    retirementAgeMale: doc.querySelector("#ctl00_body_nuAgeofMale")?.value?.trim() || "",
    retirementAgeFemale: doc.querySelector("#ctl00_body_nuAgeofFemale")?.value?.trim() || "",
    employmentCategory: doc.querySelector("#ctl00_body_dpempcat option:checked")?.textContent.trim() || ""
  };

  return employeeTypeDetails;
});
