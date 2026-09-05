(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignQualification.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const digest = await BeaconBar.executeFunction('getDigest')("IsShowButtons=1");

  const requestParams = {
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "ctl00$body$cboQaType",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: window.qualification.viewState,
    __VIEWSTATEGENERATOR: window.qualification.viewStateGenerator,
    __SCROLLPOSITIONX: "0",
    __SCROLLPOSITIONY: "0",
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.qualification.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.employeeNumber,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$cboQaType": args.qualificationTypeId || "",
    "ctl00$body$cboQa": "000001",
    "ctl00$body$txtschinData": args.institutionName || "",
    "ctl00$body$cboStatus": args.qualificationStatus || "",
    "ctl00$body$optJobRelative": args.jobRelated || "",
    "ctl00$body$nuQualDuration": "",
    "ctl00$body$dpDurationType": args.durationType || "",
    "ctl00$body$txtYear": args.yearOfPassing || "",
    "ctl00$body$txtComment": "",
    "ctl00$body$nuTotalCost": "",
    "ctl00$body$dpCurrTotalCost": args.currencyForTotalCost || "000081",
    "ctl00$body$txtStartdate": args.CostEffectDate,
    "ctl00$body$nuReimbursed": "",
    "ctl00$body$dpCurrReimbursed": args.currencyForReimbursement || "000081",
    "ctl00$body$txtEndDate": args.reimbursementEffectDate,
    "ctl00_body_grdUserDefine_ClientState": "",
    "ctl00$body$grdQualification$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdQualification_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdQualification$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
    "ctl00_body_grdQualification_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdQualification_ClientState": "",
    "ctl00$body$grdTND$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdTND_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdTND$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
    "ctl00_body_grdTND_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdTND_ClientState": "",
    "ctl00$body$lblIsHavingTND": "True",
    "ctl00$body$txtPublicKey": window.view.publicKey,
    "ctl00$body$txtempnumber": window.view.empEncId,
  };

  if (args.highestQualification === "on") {
    requestParams["ctl00$body$chkHighest"] = "on";
  }

  const editResponse = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/EIM/AssignQualification.aspx?IsShowButtons=1&digest=${digest.digest}`);
  window.qualification = editResponse

  const parser = new DOMParser();
  const doc = parser.parseFromString(editResponse.rawData, 'text/html');
  const options = doc.querySelectorAll('#ctl00_body_cboQa option');

  const qualifications = Array.from(options).map(option => ({
    value: option.value,
    name: option.textContent.trim()
  }));

  if (editResponse.Status === 200) {
    return { args, qualifications }
  } else {
    return "not update for educational given details api error"
  }
})