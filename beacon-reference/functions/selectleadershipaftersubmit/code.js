(async function () {
  
  const utils = await BeaconBar.getSharedData("utils");
  const argscycle = await BeaconBar.getSharedData("argscycle");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("cache-control", "max-age=0");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("__EVENTTARGET", "GetSearchResult"); 
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__LASTFOCUS", "");
  urlencoded.append("__VIEWSTATE", utils.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", utils.viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", utils.eventValidation);

  
  urlencoded.append("ctl00$body$ucCycleHeader$ddlReviewCycle", argscycle.reviewCycle);
  urlencoded.append("ctl00$body$hdnTalentCycleID", "0");
  urlencoded.append("ctl00$body$hdnIspms1", "");

  
  // urlencoded.append("ctl00$action$btnCandidatePool", "Candidate Pool");

  
  const now = new Date();
  const formattedDate = [
    String(now.getDate()).padStart(2, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    now.getFullYear()
  ].join("/");
  urlencoded.append("ctl00$txtCultureDate",  "dd/mm/yy"); // instead of

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  const response = await fetch(
    `${reqOptions}Talent/SelectLeadershipCandiddates.aspx`,
    requestOptions
  );

  const data = await response.text();
  return data;
});
