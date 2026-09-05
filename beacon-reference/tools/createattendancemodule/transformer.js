(async function (data, args, reqOptions) {
  if (args.entity === "overtimeInformation") {
    const response = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$action$UpdatePanel3|ctl00$action$ButtonPanel$butSave$imgbtnSave",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$txtOvertimeName": args.overtimeInformation.otTypeName,
      "ctl00$body$ddlOTRoundingPattern": args.overtimeInformation.defaultRoundingPattern,
      "ctl00$body$ddlBaseType": args.overtimeInformation.baseType,
      "ctl00$body$txtCustomMultiplier$txtUpDownValue": args.overtimeInformation.customMultiplier,
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__VIEWSTATE": window.ot.viewState,
      "__VIEWSTATEGENERATOR": window.ot.viewStateGen,
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": window.ot.eventValidation,
      "hiddenInputToUpdateATBuffer_CommonToolkitScripts": "1",
      "__ASYNCPOST": "true",
      "ctl00$action$ButtonPanel$butSave$imgbtnSave": "Save"
    }, `${reqOptions.sl}/TNA/OvertimeDefintion`);

    const parser = new DOMParser();
    const document = parser.parseFromString(response.rawData, 'text/html');

    const overtimeName = document.querySelector("#ctl00_body_txtOvertimeName")?.value || "";
    const roundingPattern = document.querySelector("#ctl00_body_ddlOTRoundingPattern")?.selectedOptions[0]?.text || "";
    const baseType = document.querySelector("#ctl00_body_ddlBaseType")?.selectedOptions[0]?.text || "";
    const customMultiplier = document.querySelector("#ctl00_body_txtCustomMultiplier_txtUpDownValue")?.value || "";

    const createDetailse = {
      "Overtime Name": overtimeName,
      "Default Rounding Pattern": roundingPattern,
      "Base Type": baseType,
      "Custom Multiplier": customMultiplier
    };
    return createDetailse;
  }
  if (args.entity === "gracePeriodInformation") {
    const response = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$action$UpdatePanel2|ctl00$action$ButtonPanel$butSave$imgbtnSave",
      "ctl00$body$GraceName_txt": args.gracePeriodInformation.gracePeriodName,
      "ctl00$body$cmdRoundings": args.gracePeriodInformation.roundingPattern,
      "ctl00$body$cmbPreviousGrace": args.gracePeriodInformation.previousGracePeriod,
      "ctl00$body$nbDuraton": args.gracePeriodInformation.duration,
      "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$action$maxLateVal": window.maxval,
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__VIEWSTATE": window.gp.viewState,
      "__VIEWSTATEGENERATOR": window.gp.viewStateGen,
      " __SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": window.gp.eventValidation,
      "hiddenInputToUpdateATBuffer_CommonToolkitScripts": "1",
      "__ASYNCPOST": "true",
      "ctl00$action$ButtonPanel$butSave$imgbtnSave": "Save"
    }, `${reqOptions.sl}/TNA/GracePeriodInformation`);

    const parser = new DOMParser();
    const document = parser.parseFromString(response.rawData, 'text/html');
    const rows = document.querySelectorAll('#ctl00_body_GraceGrid table tbody tr');
    const graceData = Array.from(rows).map(row => {
      const columns = row.querySelectorAll('td');
      return {
        graceCode: columns[0]?.textContent.trim() || "",
        graceName: columns[1]?.textContent.trim() || "",
        roundingPattern: columns[2]?.textContent.trim() || "",
        duration: columns[3]?.textContent.trim() || "",
        previousGracePeriod: columns[4]?.textContent.trim() || ""
      };
    });
    return graceData;
  }
})