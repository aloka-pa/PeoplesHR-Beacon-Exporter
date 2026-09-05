(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/JdCategory.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdCategory.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
  } else {
    url = `${window.origin}/${reqOptions.sl}/EIM/JdCategory.aspx`
  }

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.jdc.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.jdc.viewStateGen);
  urlencoded1.append("__SCROLLPOSITIONX", "0");
  urlencoded1.append("__SCROLLPOSITIONY", "0");
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.jdc.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$butEdit", "Edit");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(url, requestOptions1);
  const html1 = await response1.text();

  const parser1 = new DOMParser();
  const doc1 = parser1.parseFromString(html1, 'text/html');

  const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
  urlencoded2.append("__SCROLLPOSITIONX", "0");
  urlencoded2.append("__SCROLLPOSITIONY", "0");
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$txtName", args.jobDescriptionCategoryName);
  urlencoded2.append("ctl00$body$butSave", "Save");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(url, requestOptions2);
  const html2 = await response2.text();

  if (response2.status === 200) {
    return "Update successfully!!";
  } else {
    return "try again api is fail."
  }
})
