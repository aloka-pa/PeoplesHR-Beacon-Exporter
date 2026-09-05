(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/QualificationType.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/QualificationType.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
  } else {
    url = `${window.origin}/${reqOptions.sl}/EIM/QualificationType.aspx`
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const initialFormData = new FormData();
  initialFormData.append("scrollLeft", "0");
  initialFormData.append("scrollTop", "0");
  initialFormData.append("__EVENTTARGET", "");
  initialFormData.append("__EVENTARGUMENT", "");
  initialFormData.append("__VIEWSTATE", window.qt.viewState);
  initialFormData.append("__VIEWSTATEGENERATOR", window.qt.viewStateGen);
  initialFormData.append("__VIEWSTATEENCRYPTED", "");
  initialFormData.append("__EVENTVALIDATION", window.qt.eventValidation);
  initialFormData.append("ctl00$hdnDateFormat", "m/d/yy");
  initialFormData.append("ctl00$hdnQuickmenu", "");
  // initialFormData.append("ctl00$body$hdnIsHead", "");
  // initialFormData.append("ctl00$body$hdnEditItemIndex", "");
  // initialFormData.append("ctl00_body_RadWindowManager1_ClientState", "");
  // initialFormData.append("ctl00$body$txtHeadName", "");
  // initialFormData.append("ctl00$body$txtAdminName", "");
  initialFormData.append("ctl00$body$butEdit", "Edit");

  const fetchEditResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: initialFormData,
    redirect: "follow"
  });

  const html = await fetchEditResponse.text();
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  const viewState = document.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = document.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = document.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const finalFormData = new FormData();
  finalFormData.append("scrollLeft", "0");
  finalFormData.append("scrollTop", "0");
  finalFormData.append("__EVENTTARGET", "");
  finalFormData.append("__EVENTARGUMENT", "");
  // finalFormData.append("__LASTFOCUS", "");
  finalFormData.append("__VIEWSTATE", viewState);
  finalFormData.append("__VIEWSTATEGENERATOR", viewStateGen);
  finalFormData.append("__VIEWSTATEENCRYPTED", "");
  finalFormData.append("__EVENTVALIDATION", eventValidation);
  finalFormData.append("ctl00$hdnDateFormat", "m/d/yy");
  finalFormData.append("ctl00$hdnQuickmenu", "");
  finalFormData.append("ctl00$body$txtName", args.qualification);
  finalFormData.append("ctl00$body$butSave", "Save");




  const saveResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: finalFormData,
    redirect: "follow"
  });

  await saveResponse.text();

  if (saveResponse.status === 200) {
    return "Successfully updated!";
  } else {
    return "try again api is fail."
  }

});
