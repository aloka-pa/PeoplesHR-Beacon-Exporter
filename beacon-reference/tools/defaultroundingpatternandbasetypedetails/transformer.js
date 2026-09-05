(async function (data, args, reqOptions) {
  // const details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/OvertimeDefintion`);

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/OvertimeDefintion.aspx');

  let details;
  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
    details = await BeaconBar.executeFunction('getmodule')(url);
  } else {
    url = "TNA/OvertimeDefintion"
    details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/OvertimeDefintion`);
  }

  const response = await BeaconBar.executeFunction('module')({
    "ctl00$main$RadScriptManager": "ctl00$action$UpdatePanel3|ctl00$action$ButtonPanel$butNew$imgbtnSave",
    "ctl00_main_RadScriptManager_HiddenField": "",
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": details.viewState,
    "__VIEWSTATEGENERATOR": details.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": details.eventValidation,
    "ctl00_main_RadWindowManager1_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_OT Type Name": "",
    "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_Multiplier": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
    "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl06$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl06$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl08$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl08$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl10$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl10$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl12$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl12$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl14$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl14$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl16$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl16$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl18$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl18$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl20$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl20$butDeleteGrid$isControlEnabled": "True",
    "ctl00_body_grdsummary_rfltMenu_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",
    "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
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
    viewStateGenerator: viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : null,
    eventValidation: eventValidationMatch ? eventValidationMatch[1] : null
  };

  window.ot = viewdetails;

  const parser = new DOMParser();
  const document = parser.parseFromString(response.rawData, 'text/html');

  const roundingPatternOptions = Array.from(document.querySelectorAll("#ctl00_body_ddlOTRoundingPattern option")).map(option => ({
    text: option.textContent.trim(),
    value: option.value
  }));

  const baseTypeOptions = Array.from(document.querySelectorAll("#ctl00_body_ddlBaseType option")).map(option => ({
    text: option.textContent.trim(),
    value: option.value
  }));

  return {
    "Default Rounding Pattern Options": roundingPatternOptions,
    "Base Type Options": baseTypeOptions
  };
});
