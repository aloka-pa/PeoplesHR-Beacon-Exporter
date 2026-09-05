(async function (data, args, reqOptions) {
  const save = await BeaconBar.executeFunction('module')({
    "ctl00$main$RadScriptManager": "ctl00$action$UpdatePanel2|ctl00$action$ButtonPanel$butSave$imgbtnSave",
    "ctl00_main_RadScriptManager_HiddenField": "",
    "ctl00$body$GraceName_txt": args.garcePeriodName,
    "ctl00$body$cmdRoundings": args.roundingPattern,
    "ctl00$body$cmbPreviousGrace": args.previousGracePeriod,
    "ctl00$body$nbDuraton": args.duration,
    "ctl00$body$tpTest2$txtTime": "",
    "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
    "ctl00$action$maxLateVal": window.maxval,
    "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": window.graceupdate.viewState1,
    "__VIEWSTATEGENERATOR": window.graceupdate.viewStateGen1,
    "__SCROLLPOSITIONX": "0",
    "__SCROLLPOSITIONY": "0",
    "__EVENTVALIDATION": window.graceupdate.eventValidation1,
    "__VIEWSTATEENCRYPTED": "",
    "hiddenInputToUpdateATBuffer_CommonToolkitScripts": "1",
    "__ASYNCPOST": "true",
    "ctl00$action$ButtonPanel$butSave$imgbtnSave": "Save"
  }, `${reqOptions.sl}/TNA/GracePeriodInformation`);

  const parser = new DOMParser();
  const document = parser.parseFromString(save.rawData, 'text/html');

  const gracePeriodName = document.querySelector('#ctl00_body_GraceName_txt')?.value;
  const roundingPatternSelect = document.querySelector('#ctl00_body_cmdRoundings');
  const roundingPattern = roundingPatternSelect?.options[roundingPatternSelect.selectedIndex]?.text;
  const previousGraceSelect = document.querySelector('#ctl00_body_cmbPreviousGrace');
  const previousGracePeriod = previousGraceSelect?.options[previousGraceSelect.selectedIndex]?.text;
  const duration = document.querySelector('#ctl00_body_nbDuraton')?.value;

  return {
    "Grace Period Name": gracePeriodName,
    "Rounding Pattern": roundingPattern,
    "Previous Grace Period": previousGracePeriod,
    "Duration": duration
  };

})