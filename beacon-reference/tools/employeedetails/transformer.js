(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(menu => menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const tokens = await BeaconBar.executeFunction('application')();
  window.logs = tokens;
  const raw = JSON.stringify({
    empNumber: tokens.empNumber2,
    criteriaValues: [{ Id: "202", Value: args.empId, FromDate: "", ToDate: "", IsAndSelected: false, IsOrSelected: false }],
    key: tokens.keyValue,
    modeId: "2",
    supEmpNumber: null,
    tblPageNo: 1,
    tblSearchText: "",
    sortColumn: "2",
    sortOrder: "asc"
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"

    },
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetSearchList/`, requestOptions);
  const details = await response.json();

  const employeeDetails = details.Object.data.map(item => ({
    empId: item.Col1,
    name: item.Col2,
    dateOfBirth: item.Col3
  }));
  return employeeDetails;
});
