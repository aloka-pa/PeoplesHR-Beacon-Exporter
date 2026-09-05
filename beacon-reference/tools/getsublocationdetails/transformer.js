(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("SubLocation");

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
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$hdnIsHead", "");
  urlencoded1.append("ctl00$body$hdnEditItemIndex", "");
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "SUB_LOC_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.sublocationCode);
  urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "5");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdSummary_ClientState", "");
  urlencoded1.append("ctl00$body$hdnDefCountry", "");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch("/hr/EIM/SubLocation.aspx", requestOptions1);
  const html1 = await response1.text();
  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  const parser = new DOMParser();
  const document1 = parser.parseFromString(html1, 'text/html');
  const anchor = document1.querySelector('tr[id^="ctl00_body_grdSummary_ctl00__"] a[href^="javascript:__doPostBack"]');
  const href = anchor?.getAttribute('href') || "";
  const match = href.match(/__doPostBack\('([^']+)'/);
  const postBackKey = match ? match[1] : "";

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", postBackKey);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$hdnIsHead", "");
  urlencoded2.append("ctl00$body$hdnEditItemIndex", "");
  urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "SUB_LOC_CODE");
  urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.sublocationCode);
  urlencoded2.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded2.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdSummary_ClientState", "");
  urlencoded2.append("ctl00$body$hdnDefCountry", "");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch("/hr/EIM/SubLocation.aspx", requestOptions2);
  const html2 = await response2.text();
  const costDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
  window.sl = costDetails;

  const document2 = parser.parseFromString(html2, 'text/html');
  const code = document2.getElementById("ctl00_body_txtCode")?.value || "";
  const description = document2.getElementById("ctl00_body_txtName")?.value || "";
  const locationSelect = document2.getElementById("ctl00_body_ddlLocation");
  const selectedLocation = locationSelect?.options[locationSelect.selectedIndex];
  const location = {
    id: selectedLocation?.value || "",
    name: selectedLocation?.textContent?.trim() || ""
  };
  const headOfSubLocation = document2.getElementById("ctl00_body_txtHeadName")?.value || "";
  debugger;
  const select = document2.getElementById("ctl00_body_ddlLocation");
  const options = Array.from(select.options);

  const locationData = options.map(option => ({
    id: option.value,
    name: option.textContent.trim()
  }));

  const sublocationData = {
    Code: code,
    Description: description,
    Location: location,
    HeadOfSubLocation: headOfSubLocation,
    allLocation: locationData
  };


  return sublocationData;
})
