(async function (data, args, reqOptions) {
  debugger;
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCashBenifit.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const modified = args.editId.replace(/\$[^$]*$/, '$');
  const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.cashBenefit.viewState,
    __VIEWSTATEGENERATOR: window.cashBenefit.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.cashBenefit.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$hdnQuickmenu": "1"
  }, "AssignCashBenifit");

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
    [`${modified}nuamount`]: args.updateAmount
  }, "AssignCashBenifit");

  const postBackResponse2 = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __VIEWSTATE: postBackResponse1.viewState,
    __VIEWSTATEGENERATOR: postBackResponse1.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: postBackResponse1.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$hdnQuickmenu": "1",
    "ctl00$body$butSave": "Save"
  }, "AssignCashBenifit");

  return "update sucessfully";
})