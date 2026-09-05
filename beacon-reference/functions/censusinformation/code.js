(async function (id) {
  //done
  const sl = await BeaconBar.getSharedData("sl");
  const digest = await BeaconBar.executeFunction('getDigest')("sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResult()");
  const myHeaders = new Headers({
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "x-requested-with": "XMLHttpRequest"
  });

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${sl}/eim/EmployeeSearch.aspx?sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResult()&digest=${digest.digest}`, requestOptions);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  const urlencoded = new URLSearchParams({
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": viewState,
    "__VIEWSTATEGENERATOR": viewStateGenerator,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": eventValidation,
    "EmployeeSearch$ctl05$RadioButtonGroup1": "ctl12",
    "EmployeeSearch$ctl05$ctl14": "0",
    "EmployeeSearch$ctl05$ctl16": id,
    "EmployeeSearch$ctl05$ctl37": "Search",
    "EmployeeSearch_ctl06_ClientState": "",
    "hdnReturnId": ""
  });

  const response1 = await fetch(`${location.origin}/${sl}/eim/EmployeeSearch.aspx?sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResult()&digest=${digest.digest}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const doc1 = new DOMParser().parseFromString(await response1.text(), "text/html");

  const viewState1 = doc1.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator1 = doc1.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = doc1.querySelector("#__EVENTVALIDATION")?.value || "";

  const hrefValue = [...doc1.querySelectorAll('a[href*="__doPostBack"]')]
    .find(a => a.textContent.includes("Select"))?.getAttribute("href") || "";
  const selectedEmployeeKey = hrefValue.match(/EmployeeSearch\$[^\']+/)?.[0] || "";

  const urlencoded2 = new URLSearchParams({
    "__EVENTTARGET": selectedEmployeeKey,
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": viewState1,
    "__VIEWSTATEGENERATOR": viewStateGenerator1,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": eventValidation1,
    "EmployeeSearch$ctl05$RadioButtonGroup1": "ctl12",
    "EmployeeSearch$ctl05$ctl14": "0",
    "EmployeeSearch$ctl05$ctl16": id,
    "EmployeeSearch$ctl05$ctl21": "",
    "EmployeeSearch_ctl06_ClientState": "",
    "hdnReturnId": ""
  });

  const response2 = await fetch(`${location.origin}/${sl}/eim/EmployeeSearch.aspx?sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResult()&digest=${digest.digest}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  });

  return response2.text();
});
