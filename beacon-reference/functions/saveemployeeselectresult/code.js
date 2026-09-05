(async function (args) {
  //done

  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json; charset=UTF-8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const empl = BeaconBar.getSharedData("utils");
  const request = await BeaconBar.executeFunction("getkeysforLeave")();
  BeaconBar.setSharedData("request", request);

  const allEmployeeDetails = BeaconBar.getSharedData("selectEmployees");

  let selectedEmployeesData = [];

  if (args.includes("allEmployees")) {
    selectedEmployeesData = allEmployeeDetails.map(emp => ({
      SE_UNIQUE_KEY: request,
      SE_EMP_NUMBER: emp.empCode,
      SE_EMP_NAME: emp.empName,
      SE_DATE_JOINED: emp.dob
    }));
  } else {
    selectedEmployeesData = allEmployeeDetails
      .filter(emp => args.includes(emp.empCode) || args.includes(emp.empName))
      .map(emp => ({
        SE_UNIQUE_KEY: request,
        SE_EMP_NUMBER: emp.empCode,
        SE_EMP_NAME: emp.empName,
        SE_DATE_JOINED: emp.dob
      }));
  }
  const payload = {
    loggedEmpNumber: empl.EmpNumber,
    key: empl.KeyValue,
    uniqueKey: request,
    data: selectedEmployeesData,
    isAdvancedSearch: "1"
  };

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(payload),
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  const response = await fetch(`${reqOptions}CommonComponents/Search/SaveSearchResults/`, requestOptions);
  const data = await response.json();

  await BeaconBar.executeFunction("getSearchCreteria")(empl.KeyValue);

  return data;
});
