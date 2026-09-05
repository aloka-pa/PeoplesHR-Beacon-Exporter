(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignQualification.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const digest = await BeaconBar.executeFunction('getDigest')("IsShowButtons=1");

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.postbackId,
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: window.view.viewState,
    __VIEWSTATEGENERATOR: window.view.viewStateGenerator,
    __SCROLLPOSITIONX: "0",
    __SCROLLPOSITIONY: "0",
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.view.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.employeeNumber,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$cboQaType": "-1",
    // "ctl00$body$cboQa": "-1",
    "ctl00$body$txtschinData": args.institutionName,
    "ctl00$body$cboStatus": args.qualificationStatus || "-1",
    "ctl00$body$optJobRelative": args.jobRelated || "",
    "ctl00$body$nuQualDuration": args.durationValue || "",
    "ctl00$body$dpDurationType": args.durationType || "",
    "ctl00$body$txtYear": args.yearOfPassing || "",
    "ctl00$body$txtComment": args.comments || "",
    "ctl00$body$nuTotalCost": "",
    "ctl00$body$dpCurrTotalCost": args.currencyForTotalCost || "-1",
    "ctl00$body$txtStartdate": "",
    "ctl00$body$nuReimbursed": "",
    "ctl00$body$dpCurrReimbursed": args.currencyForReimbursement || "-1",
    "ctl00$body$txtEndDate": "",
    "ctl00_body_grdUserDefine_ClientState": "",
    "ctl00$body$grdQualification$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdQualification_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdQualification$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "5",
    "ctl00_body_grdQualification_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdQualification_ClientState": "",
    "ctl00$body$grdTND$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdTND_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdTND$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
    "ctl00_body_grdTND_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdTND_ClientState": "",
    "ctl00$body$lblIsHavingTND": "True",
    "ctl00$body$txtPublicKey": window.view.publicKey,
    "ctl00$body$txtempnumber": window.view.empEncId

  }, `${reqOptions.sl}/EIM/AssignQualification.aspx?IsShowButtons=1&digest=${digest.digest}`);

  const parser = new DOMParser();
  const doc = parser.parseFromString(editResponse.rawData, "text/html");

  const updatequalificationDetails = {
    qualificationType: {
      label: 'Qualification Type',
      value: doc.querySelector('#ctl00_body_cboQaType option[selected]')?.value || '',
      text: doc.querySelector('#ctl00_body_cboQaType option[selected]')?.textContent || ''
    },
    qualification: {
      label: 'Qualification',
      value: doc.querySelector('#ctl00_body_cboQa option[selected]')?.value || '',
      text: doc.querySelector('#ctl00_body_cboQa option[selected]')?.textContent || ''
    },
    qualificationEffectDates: {
      qualificationEffectStartDate: doc.querySelector('#ctl00_body_txtQalStDate')?.value || '',
      qualificationEffectEndDate: doc.querySelector('#ctl00_body_txtQalEndDate')?.value || '',
    },
    schoolInstitute: doc.querySelector('#ctl00_body_txtschinData')?.value || '',
    status: {
      value: doc.querySelector('#ctl00_body_cboStatus option[selected]')?.value || '',
      text: doc.querySelector('#ctl00_body_cboStatus option[selected]')?.textContent || ''
    },
    yearOfQualification: doc.querySelector('#ctl00_body_txtYear')?.value || '',
    totalCost: doc.querySelector('#ctl00_body_nuTotalCost')?.value || '',
    currency: {
      value: doc.querySelector('#ctl00_body_dpCurrTotalCost option[selected]')?.value || '',
      text: doc.querySelector('#ctl00_body_dpCurrTotalCost option[selected]')?.textContent || ''
    },
    totalCostEffectiveDate: doc.querySelector('#ctl00_body_txtStartdate')?.value || '',
    reimbursedAmount: doc.querySelector('#ctl00_body_nuReimbursed')?.value || '',
    reimbursedCurrency: {
      value: doc.querySelector('#ctl00_body_dpCurrReimbursed option[selected]')?.value || '',
      text: doc.querySelector('#ctl00_body_dpCurrReimbursed option[selected]')?.textContent || ''
    },
    highestQualification: doc.querySelector('#ctl00_body_chkHighest')?.checked ? "on" : "off",
    reimbursedEffectiveDate: doc.querySelector('#ctl00_body_txtEndDate')?.value || ''
  };

  window.uqlDates = {
    qualificationEffectStartDate: doc.querySelector('#ctl00_body_txtQalStDate')?.value || '',
    qualificationEffectEndDate: doc.querySelector('#ctl00_body_txtQalEndDate')?.value || '',
  }


  // const parser = new DOMParser();
  // const document = parser.parseFromString(editResponse.rawData, "text/html");
  // const qualificationSelect = document.querySelector('#ctl00_body_cboQa');

  // const qualification = Array.from(qualificationSelect.options).map(option => ({
  //   value: option.value,
  //   label: option.textContent.trim(),
  //   selected: option.selected || false
  // }));

  window.qualification = {
    viewState: editResponse.viewState,
    viewStateGenerator: editResponse.viewStateGen,
    eventValidation: editResponse.eventValidation,
    publicKey: window.view.publicKey,
    empEncId: window.view.empEncId
  };

  // const reimbursedcostData = {
  //   totalCost: document.querySelector('#ctl00_body_nuTotalCost')?.value || "",
  //   totalCostCurrency: (() => {
  //     const select = document.querySelector('#ctl00_body_dpCurrTotalCost');
  //     const selectedOption = select?.selectedOptions[0];
  //     return {
  //       value: selectedOption?.value || "",
  //       label: selectedOption?.textContent.trim() || ""
  //     };
  //   })(),
  //   totalCostEffectiveDate: document.querySelector('#ctl00_body_txtStartdate')?.value || "",
  //   reimbursedAmount: document.querySelector('#ctl00_body_nuReimbursed')?.value || "",
  //   reimbursedCurrency: (() => {
  //     const select = document.querySelector('#ctl00_body_dpCurrReimbursed');
  //     const selectedOption = select?.selectedOptions[0];
  //     return {
  //       value: selectedOption?.value || "",
  //       label: selectedOption?.textContent.trim() || ""
  //     };
  //   })(),
  //   reimbursedEffectiveDate: document.querySelector('#ctl00_body_txtEndDate')?.value || ""
  // };

  // const highestQualification = document.querySelector('#ctl00_body_chkHighest')?.checked ? "on" : "off";

  // const yearOfPassing = document.querySelector('#ctl00_body_txtYear')?.value || "";

  const allDetails = window.getqualificationsDetails
  return updatequalificationDetails;

});
