(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/BloodGroup.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/BloodGroup.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "BloodGroup"
  }
  const editInit = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.bg.viewState,
    __VIEWSTATEGENERATOR: window.bg.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.bg.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$butEdit": "Edit"
  }, url);

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: editInit.viewState,
    __VIEWSTATEGENERATOR: editInit.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: editInit.eventValidation,
    "ctl00$body$txtName": args.ctl00bodytxtName,
    "ctl00$body$butSave": "Save"
  }, url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const bloodgroup = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";
  const resetBtn = doc.querySelector("#ctl00_body_butReset");

  const updatedetails = {
    code,
    bloodgroup
  };

  if (resetBtn.disabled) {
    return updatedetails
  } else {
    return "Please specify a valid data"
  }
});
