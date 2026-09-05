(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/RatingMethods.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("Accept-Language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/RatingMethods.aspx');
  let url;

  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
  } else {
    url = `${window.origin}/${reqOptions.sl}/EIM/RatingMethods.aspx`
  }

  const initialFormData = new FormData();
  initialFormData.append("scrollLeft", "0");
  initialFormData.append("scrollTop", "0");
  initialFormData.append("__EVENTTARGET", "");
  initialFormData.append("__EVENTARGUMENT", "");
  initialFormData.append("__VIEWSTATE", window.rm.viewState);
  initialFormData.append("__VIEWSTATEGENERATOR", window.rm.viewStateGen);
  initialFormData.append("__VIEWSTATEENCRYPTED", "");
  initialFormData.append("__EVENTVALIDATION", window.rm.eventValidation);
  initialFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  initialFormData.append("ctl00$body$butEdit", "Edit");

  const fetchEditResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: initialFormData,
    redirect: "follow"
  });

  const html = await fetchEditResponse.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html'); // Use 'doc' instead of 'document'

  const viewState = doc.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';
  const min = parseFloat(args.minimumMarks);
  const max = parseFloat(args.maximumMarks);
  const average = ((min + max) / 2).toFixed(2);

  const edit = new FormData();
  edit.append("scrollLeft", "0");
  edit.append("scrollTop", "0");
  edit.append("__EVENTTARGET", "ctl00$body$btnsavesub");
  edit.append("__EVENTARGUMENT", "");
  edit.append("__LASTFOCUS", "");
  edit.append("__VIEWSTATE", viewState);
  edit.append("__VIEWSTATEGENERATOR", viewStateGen);
  edit.append("__VIEWSTATEENCRYPTED", "");
  edit.append("__EVENTVALIDATION", eventValidation);
  edit.append("ctl00$hdnDateFormat", "dd/mm/yy");
  edit.append("ctl00$hdnQuickmenu", 1);
  edit.append("ctl00$body$txtName", args.ratingMethod || "");
  edit.append("ctl00$body$txtgrade", args.Grade || "");
  edit.append("ctl00$body$nuninimun", args.minimumMarks || "");
  edit.append("ctl00$body$numax", args.maximumMarks || "");
  edit.append("ctl00$body$nuAvg", average || "");
  edit.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox", 1);
  edit.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  edit.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox", 4);
  edit.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  edit.append("ctl00_body_grdgrade_ClientState", "");


  const editResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: edit,
    redirect: "follow"
  });

  const editDate = await editResponse.text();

  const doc1 = parser.parseFromString(editDate, 'text/html'); // Use 'doc' instead of 'document'

  const saveviewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
  const saveeventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
  const saveviewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const finalResponse = new FormData();
  finalResponse.append("scrollLeft", "0");
  finalResponse.append("scrollTop", "0");
  finalResponse.append("__EVENTTARGET", "");
  finalResponse.append("__EVENTARGUMENT", "");
  finalResponse.append("__LASTFOCUS", "");
  finalResponse.append("__VIEWSTATE", saveviewState);
  finalResponse.append("__VIEWSTATEGENERATOR", saveviewStateGen);
  finalResponse.append("__VIEWSTATEENCRYPTED", "");
  finalResponse.append("__EVENTVALIDATION", saveeventValidation);
  finalResponse.append("ctl00$hdnDateFormat", "dd/mm/yy");
  finalResponse.append("ctl00$hdnQuickmenu", 1);
  finalResponse.append("ctl00$body$txtName", args.ratingMethod || "");
  finalResponse.append("ctl00$body$txtgrade", "");
  finalResponse.append("ctl00$body$nuninimun", "");
  finalResponse.append("ctl00$body$numax", "");
  finalResponse.append("ctl00$body$nuAvg", "");
  finalResponse.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox", 1);
  finalResponse.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  finalResponse.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox", 4);
  finalResponse.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  finalResponse.append("ctl00_body_grdgrade_ClientState", "");
  finalResponse.append("ctl00$body$butSave", "Save");

  const final = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: finalResponse,
    redirect: "follow"
  });

  await final.text();

  if (final.status === 200) {
    return "Successfully updated!";
  } else {
    return "try again api is fail."
  }

});
