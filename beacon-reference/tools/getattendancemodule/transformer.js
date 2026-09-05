(async function (data, args, reqOptions) {
  if (args.entity === "systemParameters") {

    if (!BeaconBar.user.metaData.menus.includes("TNA/SystemParameters.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/SystemParameters.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/SystemParameters.aspx"
      details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/SystemParameters`);
    }
    // const details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/SystemParameters`);
    const response = await BeaconBar.executeFunction('module')({
      "__EVENTTARGET": "ctl00$body$RadGrid1$ctl00$ctl02$ctl02$FilterTextBox_PARA_NAME",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": details.viewState,
      "__VIEWSTATEGENERATOR": details.viewStateGen,
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": details.eventValidation,
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl02$ctl02$FilterTextBox_PARA_NAME": args.systemParameters.parameterName,
      "ctl00$body$RadGrid1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_RadGrid1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$RadGrid1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_RadGrid1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_RadGrid1_rfltMenu_ClientState": "",
      "ctl00_body_RadGrid1_ClientState": "",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy"
    }, `${reqOptions.sl}/${url}`);

    window.sp = response;

    const parser = new DOMParser();
    const doc = parser.parseFromString(response.rawData, 'text/html');

    const parameters = [...doc.querySelectorAll(".GridRow_Default, .GridAltRow_Default")].map(row => ({
      parameterName: row.cells[1]?.innerText.trim(),
      parameterType: row.cells[2]?.innerText.trim(),
      parameterValue: row.querySelector("span")?.innerText.trim() || "",
      nameId: row.querySelector("input[type='image']")?.name || "N/A"
    }));

    return parameters;
  }

  if (args.entity === "overtimeInformation") {
    if (!BeaconBar.user.metaData.menus.includes("TNA/OvertimeDefintion.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/OvertimeDefintion.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/OvertimeDefintion.aspx"
      details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/OvertimeDefintion`);
    }

    // const details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/OvertimeDefintion`);
    const edit = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel2|ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_OT Type Name",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "__EVENTTARGET": "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_OT Type Name",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": details.viewState,
      "__VIEWSTATEGENERATOR": details.viewStateGen,
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": details.eventValidation,
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_OT Type Name": args.overtimeInformation.otTypeName,
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_Multiplier": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
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
      "__ASYNCPOST": "true"
    }, `${reqOptions.sl}/${url}`);

    // const viewStateRegex = /\|hiddenField\|__VIEWSTATE\|([^|]*)/;
    // const viewStateGeneratorRegex = /\|hiddenField\|__VIEWSTATEGENERATOR\|([^|]*)/;
    // const eventValidationRegex = /\|hiddenField\|__EVENTVALIDATION\|([^|]*)/;

    // const viewStateMatch = edit.rawData.match(viewStateRegex);
    // const viewStateGeneratorMatch = edit.rawData.match(viewStateGeneratorRegex);
    // const eventValidationMatch = edit.rawData.match(eventValidationRegex);

    // const viewState = viewStateMatch ? viewStateMatch[1] : null;
    // const viewStateGenerator = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : null;
    // const eventValidation = eventValidationMatch ? eventValidationMatch[1] : null;

    // const response = await BeaconBar.executeFunction('module')({
    //   "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel2|ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$imgGRDEditButton",
    //   "ctl00_main_RadScriptManager_HiddenField": "",
    //   "ctl00_main_RadWindowManager1_ClientState": "",
    //   "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_OT Type Name": args.overtimeInformation.otTypeName,
    //   "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_Multiplier": "",
    //   "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    //   "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    //   "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    //   "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    //   "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$isControlEnabled": "",
    //   "ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled": "",
    //   "ctl00_body_grdsummary_rfltMenu_ClientState": "",
    //   "ctl00_body_grdsummary_ClientState": "",
    //   "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
    //   "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    //   "__EVENTTARGET": "",
    //   "__EVENTARGUMENT": "",
    //   "__LASTFOCUS": "",
    //   "__VIEWSTATE": viewState,
    //   "__VIEWSTATEGENERATOR": viewStateGenerator,
    //   "__VIEWSTATEENCRYPTED": "",
    //   "__EVENTVALIDATION": eventValidation,
    //   "__ASYNCPOST": "true",
    //   "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$imgGRDEditButton.x": "",
    //   "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$imgGRDEditButton.y": ""
    // }, `${reqOptions.sl}/TNA/OvertimeDefintion`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(edit.rawData, "text/html");

    const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
    const overtimeDetails = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        overtimeDetails.push({
          otTypeName: cells[0].textContent.trim(),
          multiplier: cells[1].textContent.trim(),
          baseType: cells[2].textContent.trim(),
          roundingRule: cells[3].textContent.trim()
        });
      }
    });

    return overtimeDetails;
  }
  if (args.entity === "gracePeriodInformation") {

    if (!BeaconBar.user.metaData.menus.includes("TNA/GracePeriodInformation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/GracePeriodInformation.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/GracePeriodInformation.aspx"
      details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/GracePeriodInformation`);
    }

    // const details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/GracePeriodInformation`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(details.rawData, 'text/html');
    const maxval = doc.querySelector("#ctl00_action_maxLateVal")?.value || "240.00";
    window.maxval = maxval;
    const edit = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel3|ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Code_Col",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Code_Col": args.gracePeriodInformation.codeId,
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Name_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Rounding_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Durataion_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Pre_Grace_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_GraceGrid_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$GraceGrid$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_GraceGrid_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00$body$GraceGrid$ctl00$ctl04$butEditGrid$isControlEnabled": "",
      "ctl00$body$GraceGrid$ctl00$ctl04$butDeleteGrid$isControlEnabled": "",
      "ctl00_body_GraceGrid_rfltMenu_ClientState": "",
      "ctl00_body_GraceGrid_ClientState": "",
      "ctl00$body$tpTest2$txtTime": "",
      "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
      "ctl00$action$maxLateVal": maxval,
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__VIEWSTATE": details.viewState,
      "__VIEWSTATEGENERATOR": details.viewStateGen,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTTARGET": "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Code_Col",
      "__EVENTARGUMENT": "",
      "__EVENTVALIDATION": details.eventValidation,
      "hiddenInputToUpdateATBuffer_CommonToolkitScripts": "1",
      "__LASTFOCUS": "",
      "__VIEWSTATEENCRYPTED": "",
      "__ASYNCPOST": "true"
    }, `${reqOptions.sl}/${url}`);

    const viewStateRegex = /\|hiddenField\|__VIEWSTATE\|([^|]*)/;
    const viewStateGeneratorRegex = /\|hiddenField\|__VIEWSTATEGENERATOR\|([^|]*)/;
    const eventValidationRegex = /\|hiddenField\|__EVENTVALIDATION\|([^|]*)/;

    const viewStateMatch = edit.rawData.match(viewStateRegex);
    const viewStateGeneratorMatch = edit.rawData.match(viewStateGeneratorRegex);
    const eventValidationMatch = edit.rawData.match(eventValidationRegex);

    const viewState = viewStateMatch ? viewStateMatch[1] : null;
    const viewStateGen = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : null;
    const eventValidation = eventValidationMatch ? eventValidationMatch[1] : null;

    const document = parser.parseFromString(edit.rawData, 'text/html');
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

    const edit1 = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel3|ctl00$body$GraceGrid$ctl00$ctl04$butEditGrid$imgGRDEditButton",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Code_Col": args.gracePeriodInformation.codeId,
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Name_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Rounding_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Durataion_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl02$ctl02$FilterTextBox_Pre_Grace_Col": "",
      "ctl00$body$GraceGrid$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_GraceGrid_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$GraceGrid$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_GraceGrid_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00$body$GraceGrid$ctl00$ctl04$butEditGrid$isControlEnabled": "",
      "ctl00$body$GraceGrid$ctl00$ctl04$butDeleteGrid$isControlEnabled": "",
      "ctl00_body_GraceGrid_rfltMenu_ClientState": "",
      "ctl00_body_GraceGrid_ClientState": "",
      "ctl00$body$tpTest2$txtTime": "",
      "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
      "ctl00$action$maxLateVal": maxval,
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": viewState,
      "__VIEWSTATEGENERATOR": viewStateGen,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": eventValidation,
      "__ASYNCPOST": "true",
      "ctl00$body$GraceGrid$ctl00$ctl04$butEditGrid$imgGRDEditButton.x": "11",
      "ctl00$body$GraceGrid$ctl00$ctl04$butEditGrid$imgGRDEditButton.y": "15"
    }, `${reqOptions.sl}/${url}`);

    const viewStateMatch1 = edit1.rawData.match(viewStateRegex);
    const viewStateGeneratorMatch1 = edit1.rawData.match(viewStateGeneratorRegex);
    const eventValidationMatch1 = edit1.rawData.match(eventValidationRegex);

    window.graceupdate = {
      viewState1: viewStateMatch1 ? viewStateMatch1[1] : null,
      viewStateGen1: viewStateGeneratorMatch1 ? viewStateGeneratorMatch1[1] : null,
      eventValidation1: eventValidationMatch1 ? eventValidationMatch1[1] : null
    };

    const document1 = parser.parseFromString(edit1.rawData, 'text/html');

    const roundingPatternOptions = Array.from(document1.querySelectorAll("#ctl00_body_cmdRoundings option")).map(option => ({
      value: option.value.trim(),
      text: option.textContent.trim()
    }));

    const previousGracePeriodOptions = Array.from(document1.querySelectorAll("#ctl00_body_cmbPreviousGrace option")).map(option => ({
      value: option.value.trim(),
      text: option.textContent.trim()
    }));

    return { graceData, roundingPatternOptions, previousGracePeriodOptions };
  }

  if (args.entity === "rosterInformation") {
    // const details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/RosterDefenition`);

    if (!BeaconBar.user.metaData.menus.includes("TNA/RosterDefenition.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/RosterDefenition.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/RosterDefenition.aspx"
      details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/RosterDefenition`);
    }

    const edit = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel2|ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column3",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "__EVENTTARGET": "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column3",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": details.viewState,
      "__VIEWSTATEGENERATOR": details.viewStateGen,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": details.eventValidation,
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$hdnRosterSupervisor": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column3": args.rosterInformation.rosterCode,
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column2": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column1": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column4": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl06$butEditGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl06$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl08$butEditGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl08$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl10$butEditGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl10$butDeleteGrid$isControlEnabled": "True",
      "ctl00_body_grdsummary_rfltMenu_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__ASYNCPOST": "true"
    }, `${reqOptions.sl}/${url}`);

    const viewStateRegex = /\|hiddenField\|__VIEWSTATE\|([^|]*)/;
    const viewStateGeneratorRegex = /\|hiddenField\|__VIEWSTATEGENERATOR\|([^|]*)/;
    const eventValidationRegex = /\|hiddenField\|__EVENTVALIDATION\|([^|]*)/;

    const viewStateMatch = edit.rawData.match(viewStateRegex);
    const viewStateGeneratorMatch = edit.rawData.match(viewStateGeneratorRegex);
    const eventValidationMatch = edit.rawData.match(eventValidationRegex);

    const viewState = viewStateMatch ? viewStateMatch[1] : null;
    const viewStateGenerator = viewStateGeneratorMatch ? viewStateGeneratorMatch[1] : null;
    const eventValidation = eventValidationMatch ? eventValidationMatch[1] : null;

    const response = await BeaconBar.executeFunction('module')({
      "ctl00$main$RadScriptManager": "ctl00$body$UpdatePanel2|ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$imgGRDEditButton",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$hdnRosterSupervisor": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column3": args.rosterInformation.rosterCode,
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column2": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column1": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_column4": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$isControlEnabled": "",
      "ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled": "",
      "ctl00_body_grdsummary_rfltMenu_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": viewState,
      "__VIEWSTATEGENERATOR": viewStateGenerator,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": eventValidation,
      "__ASYNCPOST": "true",
      "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$imgGRDEditButton.x": "5",
      "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$imgGRDEditButton.y": "7"
    }, `${reqOptions.sl}/${url}`);

    const viewStateMatch1 = response.rawData.match(viewStateRegex);
    const viewStateGeneratorMatch1 = response.rawData.match(viewStateGeneratorRegex);
    const eventValidationMatch1 = response.rawData.match(eventValidationRegex);

    window.ri = {
      viewState1: viewStateMatch1 ? viewStateMatch1[1] : null,
      viewStateGenerator1: viewStateGeneratorMatch1 ? viewStateGeneratorMatch1[1] : null,
      eventValidation1: eventValidationMatch1 ? eventValidationMatch1[1] : null
    };

    const parser = new DOMParser();
    const document = parser.parseFromString(response.rawData, 'text/html');

    const selectedRosterInformation = {};
    selectedRosterInformation.rosterCode = document.getElementById("ctl00_body_txtRosterDisplayCode")?.value || "";
    selectedRosterInformation.rosterName = document.getElementById("ctl00_body_txtRosterName")?.value || "";
    const rosterGroup = document.getElementById("ctl00_body_cboRosterGroup");
    selectedRosterInformation.rosterGroup = rosterGroup?.options[rosterGroup.selectedIndex]?.text || "";
    selectedRosterInformation.active = document.getElementById("ctl00_body_chkActive")?.checked || false;
    selectedRosterInformation.defaultRoster = document.getElementById("ctl00_body_chkDefaultRoster")?.checked || false;
    selectedRosterInformation.assignedEmployeeTypes = [];

    const table = document.getElementById("ctl00_body_rosterAvailableEmpTypesCheckBoxList");
    if (table) {
      const checkboxes = table.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        selectedRosterInformation.assignedEmployeeTypes.push({
          name: label ? label.textContent.trim() : '',
          value: checkbox.getAttribute('name') || '',
          status: checkbox.checked ? 'on' : 'off'
        });
      });
    }

    const rosterGroupElement = document.getElementById("ctl00_body_cboRosterGroup");
    const rosterGroups = [];
    if (rosterGroupElement) {
      Array.from(rosterGroupElement.options).forEach(option => {
        rosterGroups.push({
          value: option.value,
          text: option.text
        });
      });
    }

    return { selectedRosterInformation, rosterGroups };
  }

  if (args.entity === "shiftInformation") {
    // const details = await BeaconBar.executeFunction('getmodule')(`${reqOptions.sl}/TNA/ShiftInformation`);

    if (!BeaconBar.user.metaData.menus.includes("TNA/ShiftInformation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/ShiftInformation.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getmodule")(url);
    } else {
      url = "TNA/ShiftInformation.aspx"
      details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/ShiftInformation`);
    }
    const edit = await BeaconBar.executeFunction('module')({
      "__EVENTTARGET": "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SFT_DIS_CODE",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": details.viewState,
      "__VIEWSTATEGENERATOR": details.viewStateGen,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": details.eventValidation,
      "ctl00_main_RadWindowManager1_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SFT_DIS_CODE": args.shiftInformation.shiftName,
      "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SFT_ABBRV": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SEG_TIMEIN": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SEG_TIMEOUT": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SEG_ST_CUTHRS": "",
      "ctl00$body$grdsummary$ctl00$ctl02$ctl03$FilterTextBox_SEG_ENDOUT_CUTHRS": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl05$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl06$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl07$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl08$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl09$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl10$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl11$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl12$butDeleteGrid$isControlEnabled": "True",
      "ctl00$body$grdsummary$ctl00$ctl13$butDeleteGrid$isControlEnabled": "True",
      "ctl00_body_grdsummary_rfltMenu_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy"
    }, `${reqOptions.sl}/${url}`);

    const parser = new DOMParser();
    const document = parser.parseFromString(edit.rawData, 'text/html');
    const rows = document.querySelectorAll('tr[id^="ctl00_body_grdsummary_ctl00__"]');

    const shiftRecords = Array.from(rows).map(row => ({
      shiftName: row.querySelector('a[id*="sftName"]')?.textContent.trim() || "N/A",
      abbreviation: row.querySelector('span[id*="lblGridShiftAbbreviation"]')?.textContent.trim() || "N/A",
      inTime: row.querySelector('span[id*="lblGridShiftIntime"]')?.textContent.trim() || "N/A",
      outTime: row.querySelector('span[id*="lblGridShiftOuttime"]')?.textContent.trim() || "N/A",
      earliestArrival: row.querySelector('span[id*="lblGridShiftMidIn"]')?.textContent.trim() || "N/A",
      latestDeparture: row.querySelector('span[id*="lblGridShiftMidOut"]')?.textContent.trim() || "N/A"
    }));

    return shiftRecords;
  }

  if (args.entity === "rosterEmployee") {
    if (!BeaconBar.user.metaData.menus.includes("TNAVUE/app/RosterEmployee?mvc=1")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    if (args.rosterEmployee.type === "roster") {
      const url1 = `${location.origin}/${reqOptions.sl}/tnavue/service/api/RosterEmployee/GetRosterEmpDetailsToLoadGrid`;

      const payload = {
        PageIndex: 1,
        PageSize: 10,
        SearchKey: "",
        EmpNumber: "",
        GridExistingEmpNumbers: [],
        SearchMode: -1,
        RosterCode: args.rosterEmployee.rosterId,
        SearchString: ""
      };

      const response1 = await fetch(url1, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-requested-with": "XMLHttpRequest"
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const extractData = await response1.json();

      const employeeRosterData = extractData.map(item => ({
        rosterGroup: item.RosterGroupName,
        rosterName: item.RosterName,
        empNumber: item.EmployeeDisplayNumber,
        employeeName: item.EmployeeDisplayName
      }));

      return employeeRosterData;

    } else if (args.rosterEmployee.type === "employee") {
      const myHeaders = new Headers();
      myHeaders.append("accept", "*/*");
      myHeaders.append("accept-language", "en-US,en;q=0.9");
      myHeaders.append("cache-control", "no-cache");
      myHeaders.append("x-requested-with", "XMLHttpRequest");

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNAVUE/app/RosterEmployee?mvc=1');

      const digest = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);

      const details = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}&digest=${digest.digest}`, requestOptions);
      const text = await details.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      let fullScript = "";
      doc.querySelectorAll("script").forEach(script => {
        fullScript += script.textContent;
      });

      const searchTokenMatch = fullScript.match(/searchToken=([^"'&]+)/);
      const callBackMatch = fullScript.match(/callBack=([^"'&]+)/);
      const empNumberMatch = fullScript.match(/empNumber=([^"'&]+)/);

      const searchToken = searchTokenMatch ? decodeURIComponent(searchTokenMatch[1]) : "N/A";
      const callBack = callBackMatch ? decodeURIComponent(callBackMatch[1]) : "N/A";
      const empNumber = empNumberMatch ? decodeURIComponent(empNumberMatch[1]) : "N/A";

      const details1 = await fetch(
        `${location.origin}/${reqOptions.sl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=All&searchQueryState=ActiveOnly&isMultiple=1&breadCrumbEnable=0&isDivLoading=0&displayName=&searchToken=${searchToken}`,
        requestOptions
      );
      const text1 = await details1.text();

      const document2 = parser.parseFromString(text1, 'text/html');
      const html1 = document2.documentElement.innerHTML;

      const logEmpNumberMatch = html1.match(/"EmpNumber"\s*:\s*"([^"]+)"/);
      const keyValueMatch = html1.match(/"KeyValue"\s*:\s*"([^"]+)"/);

      const logEmpNumber = logEmpNumberMatch ? logEmpNumberMatch[1] : 'N/A';
      const keyValue = keyValueMatch ? keyValueMatch[1] : 'N/A';

      const url = `${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumberFromTypeahead/?` + new URLSearchParams({
        loggedEmpNumber: logEmpNumber,
        empNumber: args.rosterEmployee.empId,
        key: keyValue,
        _: Date.now()
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        credentials: 'include'
      });

      const jsonData = await response.json();
      const token = jsonData.Message;

      const url1 = `${location.origin}/${reqOptions.sl}/tnavue/service/api/RosterEmployee/GetRosterEmpDetailsToLoadGrid`;

      const payload = {
        PageIndex: 1,
        PageSize: 10,
        SearchKey: "",
        EmpNumber: token,
        RosterCode: "",
        SearchString: ""
      };

      const response1 = await fetch(url1, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-requested-with": "XMLHttpRequest"
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const extractData = await response1.json();

      const employeeRosterData = extractData.map(item => ({
        rosterGroup: item.RosterGroupName,
        rosterName: item.RosterName,
        empNumber: item.EmployeeDisplayNumber,
        employeeName: item.EmployeeDisplayName
      }));

      return employeeRosterData;
    }
  }

})