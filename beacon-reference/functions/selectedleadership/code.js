(async function (args , state) {
  const myHeaders = new Headers({
    "Accept": "*/*",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
  });

  const formData = new URLSearchParams({
  "RadScriptManager1_HiddenField": ";;Telerik.Web.UI, Version=2008.1.415.35, Culture=neutral, PublicKeyToken=121fae78165ba3d4:en-US:493502ac-fd18-4d2a-b4d2-e3cf218d0d84:fe8d4455:c7991a52:cc662d70:f52b3883:7e0e28a2",
    "ctl00$body$ScriptManager1": "ctl00$body$UpdatePanel2|ctl00$body$ucCycleHeader$ddlReviewCycle",
    "__EVENTTARGET": "ctl00$body$ucCycleHeader$ddlReviewCycle",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": state.viewState ,
    "__VIEWSTATEGENERATOR": state.viewStateGenerator ,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": state.eventValidation ,
    "ctl00$body$ucCycleHeader$ddlReviewCycle": args.reviewCycle ,
    "ctl00$body$hdnTalentCycleID": "0",
    "ctl00$body$hdnIspms1": "",
    "ctl00$txtCultureDate": "m/d/yy",
    "__ASYNCPOST": "true"
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData.toString(),
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}Talent/SelectLeadershipCandiddates.aspx`, requestOptions);
  const data = await response.text();

  return data;
});
