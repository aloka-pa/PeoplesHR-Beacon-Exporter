(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Designation.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const details = await BeaconBar.executeFunction("getApiList")("Designation");

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", details.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded.append("ctl00$body$ContentSearch$cboCriteria", "D.DSG_CODE");
  urlencoded.append("ctl00$body$ContentSearch$txtContent", "");
  urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "35");
  urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdsummary_ClientState", "");
  urlencoded.append("ctl00$body$butNew", "New");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/EIM/Designation.aspx`, requestOptions);
  const html = await response.text();
  const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html);
  window.gd = finalDetails;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const extractOptions = (selector) =>
    Array.from(doc.querySelector(selector)?.options || [])
      .filter(opt => opt.value !== "-1" && opt.value.trim() && opt.text.trim())
      .map(opt => ({ value: opt.value, text: opt.text.trim() }));

  const salaryGrades = extractOptions('#ctl00_body_dpSalary');
  return salaryGrades;
})
