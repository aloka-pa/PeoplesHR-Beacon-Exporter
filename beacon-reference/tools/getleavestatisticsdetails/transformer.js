(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(menu => menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("__cfafvalue", window.csrf);
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      "EmpNumber": window.logKey,
      "LeaveYear": args.year
    })
  };
  const response = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveStats/GetLeaveStatistics/`, requestOptions);

  const leaveStatistics = await response.json();
  return leaveStatistics
})