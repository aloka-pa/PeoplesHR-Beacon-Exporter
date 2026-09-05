(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/Membership.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const details = await BeaconBar.executeFunction("getApiList")("Membership");

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
  urlencoded1.append("__SCROLLPOSITIONX", "0");
  urlencoded1.append("__SCROLLPOSITIONY", "0");
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "MEMBSHIP_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "5");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
  urlencoded1.append("ctl00$body$butNew", "New");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/Membership.aspx`, requestOptions1);
  const html1 = await response1.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html1, 'text/html');

  window.cm = {
    viewState: doc.querySelector('#__VIEWSTATE')?.value || '',
    eventValidation: doc.querySelector('#__EVENTVALIDATION')?.value || '',
    viewStateGen: doc.querySelector('#__VIEWSTATEGENERATOR')?.value || ''
  }

  const options = doc.querySelectorAll("#ctl00_body_dpcountry option");
  const membershipTypes = [];

  options.forEach(option => {
    const value = option.value;
    const name = option.textContent.trim();
    if (value !== "-1") {
      membershipTypes.push({ value, name });
    }
  });
  return membershipTypes
})