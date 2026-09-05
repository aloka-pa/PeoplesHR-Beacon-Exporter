(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignNonCashBenifit.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const modified = args.editId.replace(/\$[^$]*$/, '$');
  const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.noncashBenefit.viewState,
    __VIEWSTATEGENERATOR: window.noncashBenefit.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.noncashBenefit.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$hdnQuickmenu": "1",
    "ctl00_body_grdavailable_ClientState" : ""
  }, "AssignNonCashBenifit");

  const postBackResponse1 = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __VIEWSTATE: postBackResponse.viewState,
    __VIEWSTATEGENERATOR: postBackResponse.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: postBackResponse.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$hdnQuickmenu": "1",
    [`${modified}nuamount`]: args.Quantity
  }, "AssignNonCashBenifit");

  const postBackResponse2 = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: postBackResponse1.viewState,
    __VIEWSTATEGENERATOR: postBackResponse1.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: postBackResponse1.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$hdnQuickmenu": "1",
    "ctl00_body_grdavailable_ClientState" : "",
    "ctl00$body$butSave": "Save"
  }, "AssignNonCashBenifit");

  return "update sucessfully";
})