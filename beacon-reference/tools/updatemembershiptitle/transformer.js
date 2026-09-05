(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipTitles.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipTitles.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "MemberShipTitles"
  }

  const editInit = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.mt.viewState,
    __VIEWSTATEGENERATOR: window.mt.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.mt.eventValidation,
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
    "ctl00$body$txtName": args.membershipTitleName,
    "ctl00$body$butSave": "Save"
  }, url);

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, 'text/html');

  const getValue = (id) => {
    const el = doc.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const createMembershipTitleDetails = {
    code: getValue("ctl00_body_txtCode"),
    membershipTitle: getValue("ctl00_body_txtName")
  };

  if (saveResponse === false) {
    return "try again api is fail."
  } else {
    return createMembershipTitleDetails;
  }
})
