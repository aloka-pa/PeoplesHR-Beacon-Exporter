(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifitCategory.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/NonCashBenifitCategory.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "NonCashBenifitCategory"
  }
  const editInit = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.ncb.viewState,
    __VIEWSTATEGENERATOR: window.ncb.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.ncb.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$dtRateEffDate$hdnDateFormat": "dd/mm/yy",
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
    "ctl00$body$txtName": args.ctl00bodytxtName || "",
    "ctl00$body$butSave": "Save"
  }, url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const code = doc.getElementById("ctl00_body_txtCode")?.value?.trim() || "";
  const description = doc.getElementById("ctl00_body_txtName")?.value?.trim() || "";

  if (saveResponse === false) {
    return "try again api is fail."
  } else {
    return {
      code,
      description
    };
  }
});
