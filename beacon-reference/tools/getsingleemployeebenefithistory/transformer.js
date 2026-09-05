(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumberFromTypeahead/?loggedEmpNumber=${window.empLog.empNumber2}&empNumber=${args.id}&key=${window.empLog.keyValue}&_=${Date.now()}`, requestOptions);
  const details = await response1.json();

  const digestkey = await BeaconBar.executeFunction('getDigest')(`key=${details.Message}&mode=0`);

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow"
  };

  let response2, details1
  try {
    response2 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/AdminHistoryApi/GetSearchEmployee/?key=${details.Message}&mode=0&digest=${digestkey.digest}`, requestOptions1);
    details1 = await response2.json();
    
  } catch {
    return "Access denied, you do not have access to view this information"
  }


  window.empNumber12 = details1.EmpNumber;

  const params = JSON.stringify({ "EmpNumber": details1.EmpNumber, "FromDate": args.fromDate, "ToDate": args.toDate })

  const myHeaders1 = new Headers();
  myHeaders1.append("accept", "*/*");
  myHeaders1.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8,te;q=0.7");
  myHeaders1.append("content-type", "application/json; charset=UTF-8");
  myHeaders1.append("x-requested-with", "XMLHttpRequest");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders1,
    body: params,
    redirect: "follow"
  };

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/AdminHistoryApi/GetHistoryByEmployee`, requestOptions2);
  const details2 = await response3.json();

  return details2.HistoryDataTableVm.DataTableRowVms;
})