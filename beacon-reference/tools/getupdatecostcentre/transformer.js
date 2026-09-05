(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/Coscentre.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Coscentre.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
  } else {
    url = `${location.origin}/${reqOptions.sl}/EIM/Coscentre.aspx`
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.cd.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.cd.viewStateGen);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.cd.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$hdnQuickmenu", "");
  urlencoded1.append("ctl00$body$butEdit", "Edit");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const fetchEditResponse = await fetch(url, requestOptions1);
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
  urlencoded2.append("ctl00$hdnQuickmenu", "");
  urlencoded2.append("ctl00$body$txtName", args.costCentreName);
  urlencoded2.append("ctl00$body$txtbriefDesc", args.description);
  urlencoded2.append("ctl00$body$txtRefCode", args.costReferenceNumber);
  urlencoded2.append("ctl00$body$butSave", "Save");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const saveResponse = await fetch(url, requestOptions2);
  const details = await saveResponse.text();
  const document2 = parser.parseFromString(details, 'text/html');

  const getValue = (selector) => document2.querySelector(selector)?.value?.trim() || "";

  const updateData = {
    code: getValue("#ctl00_body_txtCode"),
    costCentreName: getValue("#ctl00_body_txtName"),
    briefDescription: getValue("#ctl00_body_txtbriefDesc")
  };

  if (saveResponse.status === 200) {
    return updateData;
  } else {
    return "no update the cost center details"
  }
});
