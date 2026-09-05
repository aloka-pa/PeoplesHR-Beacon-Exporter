(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("FunctionalRole");

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
    "ctl00$body$ContentSearch$cboCriteria": "F.FUNCTION_ROLE_ID",
    "ctl00$body$ContentSearch$txtContent": args.functionRoleCode,
    "ctl00$body$ContentSearch$butSearch": "Search",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "FunctionalRole");

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
    "ctl00$body$ContentSearch$cboCriteria": "F.FUNCTION_ROLE_ID",
    "ctl00$body$ContentSearch$txtContent": args.functionCode,
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "FunctionalRole");

  window.fr = postBackResponse;

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const functionRole = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

  const selectElement = doc.querySelector("#ctl00_body_dpcountry");
  let functionSelect = null;
  const options = [];

  if (selectElement) {
    const selected = selectElement.selectedOptions[0];
    functionSelect = {
      value: selected?.value || "",
      text: selected?.textContent.trim() || ""
    };

    for (const option of selectElement.options) {
      options.push({
        value: option.value,
        text: option.text.trim()
      });
    }
  }

  const result = {
    code,
    functionSelect,
    functionRole,
    options
  };

  return result;
});
