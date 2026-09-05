(async function (data, args, reqOptions) {

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/StaffGroup.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "StaffGroup"
  }

  const editInit = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.eg.viewState,
    __VIEWSTATEGENERATOR: window.eg.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.eg.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$butEdit": "Edit"
  }, url);

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: editInit.viewState,
    __VIEWSTATEGENERATOR: editInit.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: editInit.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$txtName": args.empGroupName || "",
    "ctl00$body$butSave": "Save"
  }, url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const employeeGroupname = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

  const result = {
    code,
    employeeGroupname
  };
  if (saveResponse === false) {
    return "try again api is fail."
  } else {
    return result;
  }
});
