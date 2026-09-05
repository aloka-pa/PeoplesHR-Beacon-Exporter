(async function (data, args, reqOptions) {
  if (args.entity === "systemParameters") {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/SystemParameters.aspx');
    let url;
    // let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      // details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/SystemParameters.aspx"
      // details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/dashboard`);
    }
    const editResponse = await BeaconBar.executeFunction('module')({
      "ctl00_main_RadScriptManager_HiddenField": "",
      "__EVENTTARGET": args.systemParameters.editNameId,
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": window.sp.viewState,
      "__VIEWSTATEGENERATOR": window.sp.viewStateGen,
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": window.sp.eventValidation,
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl02$ctl02$FilterTextBox_PARA_NAME": args.systemParameters.parameterName,
      "ctl00$body$RadGrid1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_RadGrid1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
      "ctl00_body_RadGrid1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_RadGrid1_ctl00_ctl05_radNumIntVal_ClientState": "",
      "ctl00_body_RadGrid1_rfltMenu_ClientState": "",
      "ctl00_body_RadGrid1_ClientState": "",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy"
    }, `${reqOptions.sl}/${url}`);

    const saveResponse = await BeaconBar.executeFunction('module')({
      "ctl00_main_RadScriptManager_HiddenField": "",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": editResponse.viewState,
      "__VIEWSTATEGENERATOR": editResponse.viewStateGen,
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": editResponse.eventValidation,
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl02$ctl02$FilterTextBox_PARA_NAME": args.systemParameters.parameterName,
      "ctl00$body$RadGrid1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_RadGrid1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
      "ctl00_body_RadGrid1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl05$radNumIntVal": args.systemParameters.updateParameterValue,
      "ctl00_body_RadGrid1_ctl00_ctl05_radNumIntVal_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl05$btnUpdate.x": "2",
      "ctl00$body$RadGrid1$ctl00$ctl05$btnUpdate.y": "7",
      "ctl00_body_RadGrid1_rfltMenu_ClientState": "",
      "ctl00_body_RadGrid1_ClientState": "",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy"
    }, `${reqOptions.sl}/${url}`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, 'text/html');

    const upadteparameters = [...doc.querySelectorAll(".GridRow_Default, .GridAltRow_Default")].map(row => ({
      parameterName: row.cells[1]?.innerText.trim(),
      parameterType: row.cells[2]?.innerText.trim(),
      parameterValue: row.querySelector("span")?.innerText.trim() || "",
      nameId: row.querySelector("input[type='image']")?.name || "N/A"
    }));

    return upadteparameters;
  }
  if (args.entity === "rosterInformation") {

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/RosterDefenition.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      // details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/RosterDefenition.aspx"
      // details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/dashboard`);
    }

    let viewState = window.ri?.viewState1 || "";
    let viewStateGen = window.ri?.viewStateGenerator1 || "";
    let eventValidation = window.ri?.eventValidation1 || "";

    if (args.rosterInformation.humanUpdateActive === "active") {
      let payload = {
        "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel2|ctl00$body$chkActive",
        "ctl00_main_RadScriptManager_HiddenField": "",
        "ctl00_main_RadWindowManager1_ClientState": "",
        "ctl00$body$hdnRosterSupervisor": "",
        "ctl00$body$txtRosterDisplayCode": args.rosterInformation.ctl00_body_txtRosterDisplayCode,
        "ctl00$body$txtRosterName": args.rosterInformation.ctl00_body_txtRosterName,
        "ctl00$body$cboRosterGroup": args.rosterInformation.ctl00_body_cboRosterGroup,
        "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
        "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
        "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
        "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
        "ctl00$hdnCulturDateFormat": "M/d/yyyy",
        "__EVENTTARGET": "ctl00$body$chkActive",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": viewState,
        "__VIEWSTATEGENERATOR": viewStateGen,
        "__SCROLLPOSITIONX": "0",
        "__SCROLLPOSITIONY": "0",
        "__VIEWSTATEENCRYPTED": "",
        "__EVENTVALIDATION": eventValidation,
        "__ASYNCPOST": "true"
      };

      if (args.rosterInformation.ctl00_body_chkActive === "on") {
        payload["ctl00$body$chkActive"] = "on";
      }

      args.rosterInformation.assignedEmployeeTypes.forEach(x => {
        if (x.status === "on") {
          payload[x.value] = "on";
        }
      });

      const saveResponse = await BeaconBar.executeFunction('module')(payload, `${reqOptions.sl}/${url}`);

      const viewStateRegex = /__VIEWSTATE\|([^|]+)/;
      const viewStateGeneratorRegex = /__VIEWSTATEGENERATOR\|([^|]+)/;
      const eventValidationRegex = /__EVENTVALIDATION\|([^|]+)/;

      const viewStateMatch = saveResponse.rawData.match(viewStateRegex);
      const viewStateGeneratorMatch = saveResponse.rawData.match(viewStateGeneratorRegex);
      const eventValidationMatch = saveResponse.rawData.match(eventValidationRegex);

      viewState = viewStateMatch ? viewStateMatch[1] : "";
      viewStateGen = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : "";
      eventValidation = eventValidationMatch ? eventValidationMatch[1] : "";
    };

    const payload1 = {
      "ctl00$main$RadScriptManager": "ctl00$action$UpdatePanel3|ctl00$action$ButtonPanel$butSave$imgbtnSave",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$hdnRosterSupervisor": "",
      "ctl00$body$txtRosterDisplayCode": args.rosterInformation.ctl00_body_txtRosterDisplayCode,
      "ctl00$body$txtRosterName": args.rosterInformation.ctl00_body_txtRosterName,
      "ctl00$body$cboRosterGroup": args.rosterInformation.ctl00_body_cboRosterGroup,
      "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "dd/MM/yyyy",
      // "ctl00$hdnDisableModuleQuickMenuIcon" : "",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": viewState,
      "__VIEWSTATEGENERATOR": viewStateGen,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTVALIDATION": eventValidation,
      "__VIEWSTATEENCRYPTED": "",
      "__ASYNCPOST": "true",
      "ctl00$action$ButtonPanel$butSave$imgbtnSave": "Save"
    };

    if (args.rosterInformation.ctl00_body_chkActive === "on") {
      payload1["ctl00$body$chkActive"] = "on";
    }

    // if (args.rosterInformation.ctl00_body_chkDefaultRoster === "on") {
    //   payload1["ctl00$body$chkDefaultRoster"] = "on";
    // }

    // for (let i = 0; i < 23; i++) {
    //   const checkboxKey = `ctl00$body$rosterAvailableEmpTypesCheckBoxList$${i}`;
    //   if (args.rosterInformation[checkboxKey] === "on") {
    //     payload1[checkboxKey] = "on";
    //   }
    // }

    args.rosterInformation.assignedEmployeeTypes.forEach(x => {
      if (x.status === "on") {
        payload1[x.value] = "on";
      }
    });

    const finalResponse = await BeaconBar.executeFunction('module')(payload1, `${reqOptions.sl}/${url}`);
    const parser = new DOMParser();
    const document = parser.parseFromString(finalResponse.rawData, 'text/html');
    const updateRosterInformation = {
      rosterCode: document.getElementById("ctl00_body_txtRosterDisplayCode")?.value || "",
      rosterName: document.getElementById("ctl00_body_txtRosterName")?.value || "",
      rosterGroup: document.querySelector("#ctl00_body_cboRosterGroup option:checked")?.text || "",
      active: document.getElementById("ctl00_body_chkActive")?.checked || false,
      defaultRoster: document.getElementById("ctl00_body_chkDefaultRoster")?.checked || false,
      assignedEmployeeTypes: []
    };

    document.querySelectorAll("input[type='checkbox'][id^='ctl00_body_rosterAvailableEmpTypesCheckBoxList']").forEach((checkbox) => {
      const label = document.querySelector(`label[for="${checkbox.id}"]`);
      updateRosterInformation.assignedEmployeeTypes.push({
        type: label?.innerText || "",
        checked: checkbox.checked
      });
    });

    return updateRosterInformation;
  }

  if (args.entity === "roundingInformation") {

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/RoundingInformation.aspx');
    let url;
    // let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      // details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/RoundingInformation.aspx"
      // details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/RoundingInformation`);
    }

    const viewStateRegex = /\|hiddenField\|__VIEWSTATE\|([^|]*)/;
    const eventValidationRegex = /\|hiddenField\|__EVENTVALIDATION\|([^|]*)/;
    const viewStateGeneratorRegex = /\|hiddenField\|__VIEWSTATEGENERATOR\|([^|]*)/;

    // Step 1: Trigger General radio button
    const generalResponse = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$upPnlDetailView|ctl00$body$rbtnGeneral",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00$body$txtRoundingPatternName": args.roundingInformation.roundingPatternName, // This should be updated
      "ctl00$body$Rounding_pattern": args.roundingInformation.roundingPatternType,
      "ctl00$body$txtNumFrom$txtTime": "",
      "ctl00$body$txtNumTo$txtTime": "",
      "ctl00$body$txtNumValue$txtTime": "",
      "ctl00$body$tpTest$txtTime": "",
      "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__EVENTTARGET": "ctl00$body$rbtnGeneral",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": window.ri?.viewState1 || "",
      "__VIEWSTATEGENERATOR": window.ri?.viewStateGenerator1 || "",
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTVALIDATION": window.ri?.eventValidation1 || "",
      "__VIEWSTATEENCRYPTED": "",
      "__ASYNCPOST": "true",
    }, `${reqOptions.sl}/${url}`);

    const viewState = generalResponse.rawData.match(viewStateRegex)?.[1] || null;
    const eventValidation = generalResponse.rawData.match(eventValidationRegex)?.[1] || null;
    const viewStateGenerator = generalResponse.rawData.match(viewStateGeneratorRegex)?.[1] || null;

    // Step 2: Select method and enter time
    const editResponse = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$upPnlDetailView|ctl00$body$cboMethod",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00$body$txtRoundingPatternName": args.roundingInformation.roundingPatternName, // Make sure this is included
      "ctl00$body$Rounding_pattern": args.roundingInformation.roundingPatternType,
      "ctl00$body$cboMethod": args.roundingInformation.methodOption,
      "ctl00$body$txtNumVal": args.roundingInformation.timeDurationValue,
      "ctl00$body$tpTest$txtTime": "",
      "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__EVENTTARGET": "ctl00$body$cboMethod",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": viewState,
      "__VIEWSTATEGENERATOR": viewStateGenerator,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": eventValidation,
      "__ASYNCPOST": "true"
    }, `${reqOptions.sl}/${url}`);

    const viewState1 = editResponse.rawData.match(viewStateRegex)?.[1] || null;
    const viewStateGenerator1 = editResponse.rawData.match(viewStateGeneratorRegex)?.[1] || null;
    const eventValidation1 = editResponse.rawData.match(eventValidationRegex)?.[1] || null;

    // Step 3: Final save - MAKE SURE TO INCLUDE THE UPDATED NAME HERE
    const saveResponse = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$action$upPnlBtn|ctl00$action$ButtonPanel$butSave$imgbtnSave",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00$body$txtRoundingPatternName": args.roundingInformation.roundingPatternName, // This must be included
      "ctl00$body$Rounding_pattern": args.roundingInformation.roundingPatternType,
      "ctl00$body$cboMethod": args.roundingInformation.methodOption,
      "ctl00$body$txtNumVal": args.roundingInformation.timeDurationValue,
      "ctl00$body$tpTest$txtTime": "",
      "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": viewState1,
      "__VIEWSTATEGENERATOR": viewStateGenerator1,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": eventValidation1,
      "__ASYNCPOST": "true",
      "ctl00$action$ButtonPanel$butSave$imgbtnSave": "Save"
    }, `${reqOptions.sl}/${url}`);

    // Parse final state
    const parser = new DOMParser();
    const document = parser.parseFromString(saveResponse.rawData, 'text/html');

    const roundingPatternName = document.querySelector("input[id$='txtRoundingPatternName']")?.value?.trim() || "N/A";
    const isGeneralEnabled = document.querySelector("input[id$='rbtnGeneral']")?.checked || false;
    const isRangeEnabled = document.querySelector("input[id$='rbtnRange']")?.checked || false;
    const roundingPatternType = isGeneralEnabled ? "General" : isRangeEnabled ? "Range" : "N/A";

    let methodValue = "N/A";
    let timeDuration = "N/A";
    if (isGeneralEnabled) {
      methodValue = document.querySelector("select[id$='cboMethod']")?.value?.trim() || "N/A";
      timeDuration = document.querySelector("input[id$='txtNumVal']")?.value?.trim() || "N/A";
    }

    let rangeData = [];
    if (isRangeEnabled) {
      const rows = document.querySelectorAll("table[id$='grdRange_ctl00'] > tbody > tr");
      rangeData = Array.from(rows).map(row => {
        const cells = row.querySelectorAll("td");
        return {
          from: cells[0]?.textContent?.trim() || "N/A",
          to: cells[1]?.textContent?.trim() || "N/A",
          value: cells[2]?.textContent?.trim() || "N/A"
        };
      });
    }

    const sameValueChecked = document.querySelector("input[id$='cbSameValue']")?.checked || false;

    return {
      roundingPatternName,
      roundingPatternType,
      methodValue,
      timeDuration,
      sameValueChecked,
      rangeData
    };
  }


})