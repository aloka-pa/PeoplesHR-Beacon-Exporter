(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("JdCategory");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", details.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  urlencoded1.append("__SCROLLPOSITIONX", "0");
  urlencoded1.append("__SCROLLPOSITIONY", "0");
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "JDCAT_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.jobDescriptionCode);
  urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "7");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions1 = { method: "POST", headers: myHeaders, body: urlencoded1, redirect: "follow" };
  const response1 = await fetch(`${location.origin}/hr/EIM/JdCategory.aspx`, requestOptions1);
  const html1 = await response1.text();

  const parser1 = new DOMParser();
  const doc1 = parser1.parseFromString(html1, 'text/html');

  const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
  const href = anchor?.getAttribute('href') || "";
  const match = href.match(/__doPostBack\('([^']+)'/);
  const postBackCode = match ? match[1] : "";

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", postBackCode);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
  urlencoded2.append("__SCROLLPOSITIONX", "0");
  urlencoded2.append("__SCROLLPOSITIONY", "0");
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "JDCAT_CODE");
  urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.jobDescriptionCode);
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions2 = { method: "POST", headers: myHeaders, body: urlencoded2, redirect: "follow" };
  const response2 = await fetch(`${location.origin}/hr/EIM/JdCategory.aspx`, requestOptions2);
  const html2 = await response2.text();

  const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
  window.jdc = finalDetails;

  const parser2 = new DOMParser();
  const doc2 = parser2.parseFromString(html2, 'text/html');

  const getValue = (id) => doc2.getElementById(id)?.value?.trim() || "";

  const extractedData = {
    code: getValue('ctl00_body_txtCode'),
    jobDescriptionCategory: getValue('ctl00_body_txtName')
  };

  return extractedData;
})
