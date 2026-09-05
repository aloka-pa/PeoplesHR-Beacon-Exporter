(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/SalaryGradeInfo.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const details = await BeaconBar.executeFunction("getApiList")("SalaryGradeInfo");

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
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "SAGRD.SAL_GRD_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
  urlencoded1.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "33");
  urlencoded1.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary1_ClientState", "");
  urlencoded1.append("ctl00$body$butNew", "New")
  urlencoded1.append("ctl00$body$hdnDecimalFormat", "2");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`, requestOptions1);
  const html1 = await response1.text();
  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  window.sg = viewDetails;
  const parser1 = new DOMParser();
  const doc1 = parser1.parseFromString(html1, 'text/html');

  const select = doc1.getElementById('ctl00_body_cboCurrType');
  const currencies = select ? Array.from(select.options)
    .filter(option => option.value !== "-1")
    .map(option => ({
      value: option.value,
      text: option.text.trim()
    })) : [];

  return currencies;
})
