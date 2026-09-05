(async function (data, args, reqOptions) {
  const editResponse = await BeaconBar.executeFunction('module')({
    "RadScriptManager_HiddenField": "",
    "__EVENTTARGET": args.editKey,
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": window.md.viewState,
    "__VIEWSTATEGENERATOR": window.md.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": window.md.eventValidation,
    "RadWindowManager1_ClientState": "",
    "ctl00$body$cboMasterDataType_Input": args.masterDataType,
    "body_cboMasterDataType_ClientState": "",
    "body_grdSummary_ClientState": ""
  }, `${reqOptions.sl}/Benefit/DefineMasterData`);

  const parser = new DOMParser();
  const doc = parser.parseFromString(editResponse.rawData, "text/html");

  const updateButton = doc.querySelector("a[id*='UpdateButton']");
  const updateKey = updateButton?.getAttribute("href").match(/__doPostBack\('([^']+)'/)[1] || "";

  const savePayload = {
    "RadScriptManager_HiddenField": "",
    "__EVENTTARGET": updateKey,
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": editResponse.viewState,
    "__VIEWSTATEGENERATOR": editResponse.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": editResponse.eventValidation,
    "RadWindowManager1_ClientState": "",
    "ctl00$body$cboMasterDataType_Input": args.masterDataType,
    "body_cboMasterDataType_ClientState": ""
    // "body_grdSummary_ClientState": ""
  };

  const updateIndexMatch = updateKey.match(/ctl00\$body\$grdSummary\$ctl00\$ctl(\d{2})\$UpdateButton/);
  const updateIndex = updateIndexMatch ? updateIndexMatch[1] : null;

  if (args.masterDataType === "Medical Claims" || args.masterDataType === "Fuel Reimbursement") {
    savePayload[`ctl00$body$grdSummary$ctl00$ctl${updateIndex}$txtDtlCode`] = args.id;
    savePayload[`body_grdSummary_ctl00_ctl${updateIndex}_txtDtlCode_ClientState`] = "";
    savePayload[`ctl00$body$grdSummary$ctl00$ctl${updateIndex}$txtDtlName`] = args.description;
    savePayload[`body_grdSummary_ctl00_ctl${updateIndex}_txtDtlName_ClientState`] = "";
    savePayload[`ctl00$body$grdSummary$ctl00$ctl${updateIndex}$txtNumValue`] = args.amount;
    savePayload[`body_grdSummary_ctl00_ctl${updateIndex}_txtNumValue_ClientState`] = "";
    savePayload["body_grdSummary_ClientState"] = ""
  } else {
    savePayload[`ctl00$body$grdSummary$ctl00$ctl${updateIndex}$txtDtlCode`] = args.id;
    savePayload[`body_grdSummary_ctl00_ctl${updateIndex}_txtDtlCode_ClientState`] = "";
    savePayload[`ctl00$body$grdSummary$ctl00$ctl${updateIndex}$txtDtlName`] = args.description;
    savePayload[`body_grdSummary_ctl00_ctl${updateIndex}_txtDtlName_ClientState`] = "";
    savePayload[`ctl00$body$grdSummary$ctl00$ctl${updateIndex}$txtTextValue`] = args.amount;
    savePayload[`body_grdSummary_ctl00_ctl${updateIndex}_txtTextValue_ClientState`] = "";
    savePayload["body_grdSummary_ClientState"] = ""
  }

  const saveResponse = await BeaconBar.executeFunction('module')(savePayload, `${reqOptions.sl}/Benefit/DefineMasterData`);

  const document = parser.parseFromString(saveResponse.rawData, "text/html");
  const rows = document.querySelectorAll("#body_grdSummary tbody tr");
  const masterData = [];

  rows.forEach(row => {
    const id = row.querySelector("span[id*='lblDtlCode']")?.textContent.trim() || "";
    const description = row.querySelector("span[id*='lblDtlName']")?.textContent.trim() || "";
    const amount = args.masterDataType === "Fuel Reimbursement"
      ? row.querySelector("span[id*='lblNumValue']")?.textContent.trim() || ""
      : row.querySelector("span[id*='lblTextValue']")?.textContent.trim() || "";
    const editButton = row.querySelector("a[id*='EditButton']");
    const editKey = editButton?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || "";
    const masterDataType = args.masterDataType || "Medical Claims";

    masterData.push({
      id,
      description,
      amount,
      editKey,
      masterDataType
    });
  });

  return masterData;
});
