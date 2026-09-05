(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("Salutation");

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
    "ctl00$body$ContentSearch$cboCriteria": "SALU_ID",
    "ctl00$body$ContentSearch$txtContent": args.empTitleCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "Salutation");

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
    "ctl00$body$ContentSearch$cboCriteria": "SALU_ID",
    "ctl00$body$ContentSearch$txtContent": args.empTitleCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "Salutation");

  window.eti = postBackResponse;

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const employeetypeDetails = {
    code: doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "",
    employeeTitle: doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "",
    genderValidate: doc.querySelector("#ctl00_body_chkGenderValid")?.checked || false,
    gender: (() => {
      const selected = doc.querySelector("#ctl00_body_cboGender")?.selectedOptions?.[0];
      return selected ? selected.textContent.trim() : "";
    })(),
    maritalStatusLabel: doc.querySelector("#ctl00_body_lblMAritalStatus")?.textContent.trim() || "",
    maritalStatuses: []
  };

  const maritalTable = doc.querySelector("#ctl00_body_chkMaritalStatus");
  if (maritalTable) {
    const checkboxes = maritalTable.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => {
      const label = maritalTable.querySelector(`label[for="${checkbox.id}"]`);
      employeetypeDetails.maritalStatuses.push({
        label: label ? label.textContent.trim() : "",
        checked: checkbox.checked
      });
    });
  }

  return employeetypeDetails;
});
