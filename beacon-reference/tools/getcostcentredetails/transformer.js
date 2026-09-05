(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("Coscentre");
  window.cc = details;

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.cc.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.cc.viewStateGen);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.cc.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "CENTRE_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.searchCode);
  urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/hr/EIM/Coscentre.aspx`, requestOptions1);
  const html1 = await response1.text();
  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  const parser = new DOMParser();
  const document1 = parser.parseFromString(html1, 'text/html');
  const anchor = document1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
  const postBackId = anchor?.getAttribute('href')?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", postBackId);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "CENTRE_CODE");
  urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.searchCode);
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(`${location.origin}/hr/EIM/Coscentre.aspx`, requestOptions2);
  const html2 = await response2.text();

  const costDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
  window.cd = costDetails;
  const document2 = parser.parseFromString(html2, 'text/html');

  const getValue = (selector) => document2.querySelector(selector)?.value?.trim() || "";

  const extractedData = {
    code: getValue("#ctl00_body_txtCode"),
    costCentreName: getValue("#ctl00_body_txtName"),
    briefDescription: getValue("#ctl00_body_txtbriefDesc")
  };

  return extractedData;
})
