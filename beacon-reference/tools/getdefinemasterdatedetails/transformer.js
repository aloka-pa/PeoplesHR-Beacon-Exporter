(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("Benefit/DefineMasterData.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

 const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Benefit/DefineMasterData.aspx');
  const response = await BeaconBar.executeFunction('module')({
    "RadScriptManager_HiddenField": "",
    "__EVENTTARGET": "ctl00$body$cboMasterDataType",
    "__EVENTARGUMENT": `{"Command":"Select","Index":${args.masterDataTypeIndex}}`,
    "__VIEWSTATE": window.details.viewState,
    "__VIEWSTATEGENERATOR": window.details.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": window.details.eventValidation,
    "RadWindowManager1_ClientState": "",
    "ctl00$body$cboMasterDataType_Input": args.masterDataType,
    "body_cboMasterDataType_ClientState": JSON.stringify({ "logEntries": [], "value": `${args.masterDataTypeValue}`, "text": `${args.masterDataType}`, "enabled": true }),
    "body_grdSummary_ClientState": ""
  }, `${reqOptions.sl}/${updateurl.updateUrl}`);

  window.md = response;

  const parser = new DOMParser();
  const document = parser.parseFromString(response.rawData, "text/html");

  const rows = document.querySelectorAll("#body_grdSummary tbody tr");
  const masterData = [];
  const uniqueEntries = new Set();

  rows.forEach(row => {
    const id = row.querySelector("span[id*='lblDtlCode']")?.textContent.trim() || "";
    const description = row.querySelector("span[id*='lblDtlName']")?.textContent.trim() || "";
    const amount = (args.masterDataType === "Fuel Reimbursement" || args.masterDataType === "Parking Entitlment")
      ? row.querySelector("span[id*='lblNumValue']")?.textContent.trim() || ""
      : row.querySelector("span[id*='lblTextValue']")?.textContent.trim() || "";
    // const amount = row.querySelector("span[id*='lblNumValue']")?.textContent.trim() || ""
    const editButton = row.querySelector("a[id*='EditButton']");
    const editKey = editButton?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || "";
    const masterDataType = args.masterDataType || "Medical Claims";
    const uniqueKey = `${id}_${description}_${amount}_${editKey}`;

    if (id && !uniqueEntries.has(uniqueKey)) {
      uniqueEntries.add(uniqueKey);
      masterData.push({
        id,
        description,
        amount,
        editKey,
        masterDataType
      });
    }
  });
  return masterData;
});
