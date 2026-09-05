(async function (data, args, reqOptions) {
  let params;
  if(window.empNumber12){
    params = `mvc=1&bs=4&empNumber=${args.ENCRYPT_EMP_NUMBER}&appId=${args.BET_APP_ID}&betCode=${args.BET_CODE}&mode=-1&isFIrstLoad=0&isAllHistory=1&SEmployee=${window.empNumber12 || ''}&SFrmDate=${args.fromDate}&SToDate=${args.toDate}&SBetCode=undefined&BetAppYear=${args.BET_APPY_DATE}`;
  }else{
    params = `mvc=1&bs=4&empNumber=${args.ENCRYPT_EMP_NUMBER}&appId=${args.BET_APP_ID}&betCode=${args.BET_CODE}&mode=-1&isFIrstLoad=0&BetAppYear=${args.BET_APPY_DATE}`;
  }

  const digestkey = await BeaconBar.executeFunction('getDigest')(params);

  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8,te;q=0.7");
  myHeaders.append("content-type", "application/json; charset=UTF-8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const summary = await fetch(`${window.origin}/hr/BenefitV9/Application/ApplicationSummary/?${params}&digest=${digestkey.digest}`, requestOptions);
  const text = await summary.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const scriptTag = Array.from(doc.querySelectorAll("script")).find(s => s.textContent.includes("window.BenefitApplicationObj"));
  const regex = /window\.BenefitApplicationObj\s*=\s*'([^']+)'/;
  const match = scriptTag?.textContent.match(regex);
  const jsonData = JSON.parse(match[1]);

  const extracted = {
    betAppYear: jsonData.BetAppYear,
    appId: jsonData.AppId,
    betCode: jsonData.CurrentBenefitTypeCode || jsonData.BmApplication?.BetCode,
    cancelWfMainId: jsonData.CancelWfMainId,
    empNumber: jsonData.Employee?.EmpNumber,
    isWorkflow: jsonData.IsWorkflow,
    keyValue: jsonData.KeyValue,
    visibilityState: jsonData.VisibilityState,
    wfMainId: jsonData.WfMainId
  };

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(extracted),
    redirect: "follow"
  };

  const details = await fetch(`${window.origin}/hr/BenefitV9/api/ApplicationApi/GetApplicationStructure/`, requestOptions1);
  const data1 = await details.json();

  return data1;
})
