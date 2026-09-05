(async function (data, args, reqOptions) {
  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(window.language.publicKey, args.employeeNumber);
  const changeLanguage = await BeaconBar.executeFunction("module")(
    {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "ctl00$body$cboLanuage",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: window.language.viewState,
      __VIEWSTATEGENERATOR: window.language.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.language.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.employeeNumber,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$cboLanuage": args.languageCode,
      "ctl00$body$chkReading": args.readingEnabled,
      "ctl00$body$cboLanGradeReading": args.readingRating,
      "ctl00$body$chkWriting": args.writingEnabled,
      "ctl00$body$cboLanGradeWriting": args.writingRating,
      "ctl00$body$chkSpeaking": args.speakingEnabled,
      "ctl00$body$cboLanGradeSpeaking": args.speakingRating,
      "ctl00$body$txtPublicKey": window.language.publicKey,
      "ctl00$body$txtEmpNumber": empEnc,
      "ctl00$body$grdLanuages$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdLanuages_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdLanuages$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
      "ctl00_body_grdLanuages_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdLanuages_ClientState": "",
    },
    `${reqOptions.sl}/EIM/AssignLanguage.aspx`
  );

  window.language = changeLanguage;

  const parser = new DOMParser();
  const document = parser.parseFromString(changeLanguage.rawData, "text/html");

  const selectElement = document.querySelector('#ctl00_body_cboLanGradeReading');
  const options = selectElement.querySelectorAll('option');

  const grades = Array.from(options).map(option => ({
    name: option.textContent.trim(),
    value: option.value
  }));
  return grades;

})