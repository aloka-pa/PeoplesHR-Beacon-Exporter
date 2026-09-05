(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Designation.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "ctl00$body$dpSalary");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__LASTFOCUS", "");
  urlencoded.append("__VIEWSTATE", window.gd.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", window.gd.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", window.gd.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded.append("ctl00$body$txtName", "");
  urlencoded.append("ctl00$body$dpSalary", args.salaryGradeValue);
  urlencoded.append("ctl00$body$dpNextUpgrade", "-1");
  urlencoded.append("ctl00$body$dpnextupgradedsg", "-1");
  urlencoded.append("ctl00$body$cbofunctionRole", "-1");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/EIM/Designation.aspx`, requestOptions);
  const html = await response.text();

  const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html);
  window.cd = finalDetails;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const extractOptions = (selector) =>
    Array.from(doc.querySelector(selector)?.options || [])
      .filter(opt => opt.value !== "-1" && opt.value.trim() && opt.text.trim())
      .map(opt => ({ value: opt.value, text: opt.text.trim() }));

  const corporationData = extractOptions('#ctl00_body_dpNextUpgrade');
  return corporationData;
})
