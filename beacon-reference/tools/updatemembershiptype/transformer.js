(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipType.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipType.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
  } else {
    url = `${window.origin}/${reqOptions.sl}/EIM/MemberShipType.aspx`
  }

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.mt.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.mt.viewStateGen);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.mt.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$butEdit", "Edit");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response = await fetch(url, requestOptions1);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const viewState = doc.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

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
  urlencoded2.append("ctl00$body$txtName", args.membershipType);
  urlencoded2.append("ctl00$body$butSave", "Save");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response1 = await fetch(url, requestOptions2);
  const html2 = await response1.text();

  if (response1.status === 200) {
    return "update is successfully";
  } else {
    return "try again api is fail."
  }

})
