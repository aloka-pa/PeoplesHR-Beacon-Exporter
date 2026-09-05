(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("AbsenceV9/LeaveHistory/LeaveHistory?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const empKey = await BeaconBar.executeFunction("employeeLeaveApplication")();
  const myHeaders = new Headers();
  myHeaders.append("__cfafvalue", window.csrf);
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/json");
      myHeaders.append("x-requested-with", "XMLHttpRequest");


  const url = `${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveStats/GetLeaveStatistics/`;
  const request = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      EmpNumber: empKey,
      LeaveYear: args.year
    })
  };

  const response = await fetch(url, request);
  const datas = await response.json();
  return datas;
})
