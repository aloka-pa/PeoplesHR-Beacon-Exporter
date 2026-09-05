(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlencodedInit = new URLSearchParams();
  urlencodedInit.append("scrollLeft", "0");
  urlencodedInit.append("scrollTop", "0");
  urlencodedInit.append("__EVENTTARGET", "");
  urlencodedInit.append("__EVENTARGUMENT", "");
  urlencodedInit.append("__VIEWSTATE", window.design.viewState);
  urlencodedInit.append("__VIEWSTATEGENERATOR", window.design.viewStateGen);
  urlencodedInit.append("__VIEWSTATEENCRYPTED", "");
  urlencodedInit.append("__EVENTVALIDATION", window.design.eventValidation);
  urlencodedInit.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencodedInit.append("ctl00$body$butEdit", "Edit");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencodedInit,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/Designation.aspx`, requestOptions1);
  const html1 = await response1.text();

  const parser = new DOMParser();
  const doc1 = parser.parseFromString(html1, 'text/html');

  const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const urlencodedFinal = new URLSearchParams();
  urlencodedFinal.append("scrollLeft", "0");
  urlencodedFinal.append("scrollTop", "0");
  urlencodedFinal.append("__EVENTTARGET", "ctl00$body$dpSalary");
  urlencodedFinal.append("__EVENTARGUMENT", "");
  urlencodedFinal.append("__LASTFOCUS", "");
  urlencodedFinal.append("__VIEWSTATE", viewState);
  urlencodedFinal.append("__VIEWSTATEGENERATOR", viewStateGen);
  urlencodedFinal.append("__VIEWSTATEENCRYPTED", "");
  urlencodedFinal.append("__EVENTVALIDATION", eventValidation);
  urlencodedFinal.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencodedFinal.append("ctl00$hdnQuickmenu", "");
  urlencodedFinal.append("ctl00$body$txtName", args.designation);
  urlencodedFinal.append("ctl00$body$dpSalary", args.salaryGradeCode);
  urlencodedFinal.append("ctl00$body$dpNextUpgrade", "-1");
  urlencodedFinal.append("ctl00$body$dpnextupgradedsg", "-1");
  urlencodedFinal.append("ctl00$body$cbofunctionRole", "-1");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencodedFinal,
    redirect: "follow"
  };

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/Designation.aspx`, requestOptions2);
  const html2 = await response2.text();

  const doc2 = parser.parseFromString(html2, 'text/html');

  window.design = {
    viewState: doc1.querySelector('#__VIEWSTATE')?.value || '',
    eventValidation: doc1.querySelector('#__EVENTVALIDATION')?.value || '',
    viewStateGen: doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || ''
  }
  const selectElement = doc2.querySelector('#ctl00_body_dpNextUpgrade');
  const options = Array.from(selectElement.options);
  const corporateTitles = options.filter(option => option.value !== "-1" && option.text.trim() !== "")
    .map(option => ({
      value: option.value,
      name: option.text.trim()
    }));
  if (corporateTitles.length !== 0) {
    return corporateTitles;
  } else {
    return "no under the options for salary grade.Please specify the Corporate Title.";;
  }
});
