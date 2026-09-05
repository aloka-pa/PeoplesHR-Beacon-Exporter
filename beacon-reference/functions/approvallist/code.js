(async function (args) {
  //
  const myHeaders = new Headers();
  const employeenumber = await BeaconBar.executeFunction("onclickEmployee")(args)
  const csrftoken = await BeaconBar.executeFunction("csrftoken")();

  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest");
  myHeaders.append("__cfafvalue", csrftoken.token);

  BeaconBar.setSharedData("token", csrftoken.token)

  const raw = JSON.stringify({
    "EmpNumber": csrftoken.match.EmpNumber
  });
  BeaconBar.setSharedData("EmpNumber", csrftoken.match.EmpNumber)
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}AbsenceV9/api/ShortLeaveApplication/GetAppovalPersonList/`, requestOptions)
  const data = await response.text();
  const dataparse = JSON.parse(data)
  return { approveremployeeNumberdata: dataparse, reasons: csrftoken.match.ReasonList };
})