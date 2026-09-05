(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("QualificationType");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", details.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$hdnIsHead", "");
  urlencoded1.append("ctl00$body$hdnEditItemIndex", "");
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "QUALIFI_TYPE_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.qualificationSearch);
  urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "5");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
  // urlencoded1.append("ctl00$body$hdnDefCountry", "");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(`/${reqOptions.sl}/EIM/QualificationType.aspx`, requestOptions1);
  const html1 = await response1.text();
  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html1, "text/html");

  const row = doc.querySelector("#ctl00_body_grdsummary_ctl00__0");
  const key = row?.querySelector("a")?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", key);
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewDetails.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", viewDetails.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded.append("ctl00$body$ContentSearch$cboCriteria", "QUALIFI_TYPE_CODE");
  urlencoded.append("ctl00$body$ContentSearch$txtContent", args.qualificationSearch);
  urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/EIM/QualificationType.aspx`, requestOptions);
  const html = await response.text();
  const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html);
  window.qt = finalDetails;

  if (row) {
    const cells = row.querySelectorAll("td");
    const code = cells[0]?.textContent.trim();
    const qualificationType = cells[1]?.textContent.trim();
    return { code, qualificationType };
  } else {
    return null;
  }
})
