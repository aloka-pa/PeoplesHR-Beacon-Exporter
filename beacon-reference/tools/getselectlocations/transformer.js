(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Location.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const details = await BeaconBar.executeFunction("getApiList")("SubLocation");
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
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "SUB_LOC_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "7");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdSummary_ClientState", "");
  urlencoded1.append("ctl00$body$CmdNew", "New");
  urlencoded1.append("ctl00$body$hdnDefCountry", "");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(`/${reqOptions.sl}/eim/SubLocation.aspx`, requestOptions1);
  const html1 = await response1.text();
  const extractedDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  window.sls = extractedDetails;

  const parser = new DOMParser();
  const document1 = parser.parseFromString(html1, 'text/html');

  const select = document1.getElementById("ctl00_body_ddlLocation");
  const options = Array.from(select.options);

  const locationData = options.map(option => ({
    id: option.value,
    name: option.textContent.trim()
  }));

  return locationData;
})
