(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Reportsto.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const indexList = args.empList.split(',').map(s => s.trim());
  const employeeResponse = await BeaconBar.executeFunction('module')({
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": window.beaurl.payload.viewState,
    "__VIEWSTATEGENERATOR": window.beaurl.payload.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": window.beaurl.payload.eventValidation,
    "RadWindowManager2_ClientState": "",
    "EmployeeSearch$ctl05$RadioButtonGroup1": "ctl07",
    "EmployeeSearch$ctl05$ctl14": "0",
    "EmployeeSearch$ctl05$ctl16": "",
    "EmployeeSearch$ctl05$ctl21": "",
    "EmployeeSearch$ctl05$ctl40": "Submit",
    "EmployeeSearch$ctl06$ctl00$ctl08$colMultiEmpCheckSelectCheckBox": "on",
    "EmployeeSearch$ctl06$ctl00$ctl10$colMultiEmpCheckSelectCheckBox": "on",
    "EmployeeSearch$ctl06$ctl00$ctl12$colMultiEmpCheckSelectCheckBox": "on",
    "EmployeeSearch_ctl06_ClientState": JSON.stringify({
      selectedIndexes: indexList,
      reorderedColumns: [],
      expandedItems: [],
      expandedGroupItems: [],
      expandedFilterItems: [],
      deletedItems: [],
      popUpLocations: {},
      draggedItemsIndexes: []
    }),
    "hdnReturnId": ""
  }, window.beaurl.url);

  const text = employeeResponse.rawData;
  return "successfully employee selected";
});
