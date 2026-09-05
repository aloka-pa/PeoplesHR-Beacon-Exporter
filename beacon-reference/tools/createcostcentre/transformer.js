(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("Coscentre");

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
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "CENTRE_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
  urlencoded1.append("ctl00$body$butNew", "New");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const fetchEditResponse = await fetch(`${location.origin}/hr/EIM/Coscentre.aspx`, requestOptions1);
  const html = await fetchEditResponse.text();
  const parser = new DOMParser();
  const documentEdit = parser.parseFromString(html, 'text/html');

  const viewState = documentEdit.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = documentEdit.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = documentEdit.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$txtName", args.costCentreName);
  urlencoded2.append("ctl00$body$txtbriefDesc", args.description);
  urlencoded2.append("ctl00$body$butSave", "Save");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const saveResponse = await fetch(`${location.origin}/hr/EIM/Coscentre.aspx`, requestOptions2);
  await saveResponse.text();
  return "Create Successfully!";
})
