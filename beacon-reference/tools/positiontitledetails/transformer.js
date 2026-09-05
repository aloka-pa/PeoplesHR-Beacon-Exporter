(async function (data, args, reqOptions) {
  const addResponse = await BeaconBar.executeFunction("module")(
    {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "ctl00$body$drpSalaryGrade",
      __EVENTARGUMENT: "",
      __VIEWSTATE: window.emp.newResponse.viewState,
      __VIEWSTATEGENERATOR: window.emp.newResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.emp.newResponse.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$drpSalaryGrade": args.personalGradeValue,
      "ctl00$body$drpClassification": "",
      "ctl00$body$hdnDisplayMethod": "1",
      "ctl00$body$txtactfrom": "",
      "ctl00$body$txtactto": "",
      "ctl00$body$fileAttatchment": "",
      "ctl00$body$payable": "rbpayable",
      "ctl00$body$txtCmmt": "",
      "ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdCovringDtl_ClientState": "",
      "ctl00$footers$hdnIsDateChanged": "1",
      "ctl00$footers$txtPublicKey": window.emp.publicKey1,
      "ctl00$footers$txtempNo": window.emp.empEnc
    },
    `${reqOptions.sl}/EIM/empCoveringDetails.aspx`
  );

  window.emp1 = addResponse
  
  
  const parser = new DOMParser();
  const document = parser.parseFromString(addResponse.rawData, "text/html");

  const positionTitleSelect = document.querySelector('#ctl00_body_drpCorporateTitle');

  const positionTitleOptions = Array.from(positionTitleSelect.options)
    .filter(option => option.value !== "-1" && option.value !== "")
    .map(option => ({
      key: option.value,
      value: option.textContent.trim()
    }));
    
  return positionTitleOptions
})