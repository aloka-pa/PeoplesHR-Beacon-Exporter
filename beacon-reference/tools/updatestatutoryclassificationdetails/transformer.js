(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/EmpCatgary.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/EmpCatgary.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "EmpCatgary"
  }

  const editInit = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.sc.viewState,
    __VIEWSTATEGENERATOR: window.sc.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.sc.eventValidation,
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
    "ctl00$body$txtName": args.statutoryClassification || "",
    "ctl00$body$butSave": "Save"
  }, url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
  const statutoryClassification = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

  const result = {
    code,
    statutoryClassification
  };
  // return result;
  if (saveResponse === false) {
    return "try again api is fail."
  } else {
    return result;
  }
});
