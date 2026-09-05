(async function (args , args2 = {}) {

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const reqOptions = await BeaconBar.executeFunction("reqOptions")()
  const response = await fetch(`${reqOptions}GlobalPay/ESS/PaySlipView.aspx?Period=${args.Period}&Frequency=${args2.pfCode || 1}&Year=${args.Year}&EmpNo=${args.EmpNo}&RefreshButton=false&digest=${args.digest}`, requestOptions)
  const data = await response.text();

  return data;
})