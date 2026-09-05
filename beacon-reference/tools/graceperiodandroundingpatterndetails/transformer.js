(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNA/GracePeriodInformation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/GracePeriodInformation.aspx');

  let details;
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
    details = await BeaconBar.executeFunction('getmodule')(url);
  } else {
    url = "TNA/GracePeriodInformation"
    details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/GracePeriodInformation`);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(details.rawData, 'text/html');

  const maxval = doc.querySelector("#ctl00_action_maxLateVal").value || "240.00"
  window.maxval = maxval;
  const response = await BeaconBar.executeFunction('module')({
    "ctl00$main$RadScriptManager": "ctl00$action$UpdatePanel2|ctl00$action$ButtonPanel$butNew$imgbtnSave",
    "ctl00_main_RadScriptManager_HiddenField": "",
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": details.viewState,
    "__VIEWSTATEGENERATOR": details.viewStateGen,
    "__SCROLLPOSITIONX": "0",
    "__SCROLLPOSITIONY": "0",
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": details.eventValidation,
    "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Code_Col": "",
    "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Name_Col": "",
    "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Rounding_Col": "",
    "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Durataion_Col": "",
    "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Pre_Grace_Col": "",
    "ctl00$body$GraceGrid$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_GraceGrid_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$GraceGrid$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
    "ctl00_body_GraceGrid_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00$body$GraceGrid$ctl00$ctl04$butEditGrid$isControlEnabled": "True",
    "ctl00$body$GraceGrid$ctl00$ctl04$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$GraceGrid$ctl00$ctl06$butEditGrid$isControlEnabled": "True",
    "ctl00$body$GraceGrid$ctl00$ctl06$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$GraceGrid$ctl00$ctl08$butEditGrid$isControlEnabled": "True",
    "ctl00$body$GraceGrid$ctl00$ctl08$butDeleteGrid$isControlEnabled": "True",
    "ctl00_body_grdsummary_rfltMenu_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$body$tpTest2$txtTime": "",
    "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
    "ctl00$action$maxLateVal": maxval,
    "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    "__ASYNCPOST": "true",
    "ctl00$action$ButtonPanel$butNew$imgbtnSave": "New"
  }, `${reqOptions.sl}/${url}`);

  const viewStateRegex = /\|hiddenField\|__VIEWSTATE\|([^|]*)/;
  const viewStateGeneratorRegex = /\|hiddenField\|__VIEWSTATEGENERATOR\|([^|]*)/;
  const eventValidationRegex = /\|hiddenField\|__EVENTVALIDATION\|([^|]*)/;

  const viewStateMatch = response.rawData.match(viewStateRegex);
  const viewStateGeneratorMatch = response.rawData.match(viewStateGeneratorRegex);
  const eventValidationMatch = response.rawData.match(eventValidationRegex);

  const viewdetails = {
    viewState: viewStateMatch ? viewStateMatch[1] : null,
    viewStateGen: viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : null,
    eventValidation: eventValidationMatch ? eventValidationMatch[1] : null
  };

  window.gp = viewdetails;

  const document = parser.parseFromString(response.rawData, 'text/html');

  const roundingPatternOptions = Array.from(document.querySelectorAll("#ctl00_body_cmdRoundings option")).map(option => ({
    value: option.value.trim(),
    text: option.textContent.trim()
  }));

  const previousGracePeriodOptions = Array.from(document.querySelectorAll("#ctl00_body_cmbPreviousGrace option")).map(option => ({
    value: option.value.trim(),
    text: option.textContent.trim()
  }));

  return {
    RoundingPatternOptions: roundingPatternOptions,
    PreviousGracePeriodOptions: previousGracePeriodOptions
  };
});
