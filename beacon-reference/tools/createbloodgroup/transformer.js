(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("BloodGroup");

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
    "ctl00$body$butNew": "New"
  }, "BloodGroup");

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: newInt.viewState,
    __VIEWSTATEGENERATOR: newInt.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: newInt.eventValidation,
    "ctl00$body$txtName": args.ctl00$body$txtName,
    "ctl00$body$butSave": "Save"
  }, "BloodGroup");

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const bloodgroup = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

  const createdetails = {
    code,
    bloodgroup
  };
  return createdetails;
})