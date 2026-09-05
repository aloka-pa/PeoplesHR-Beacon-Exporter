(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("RatingMethods");

  const commonHeaders = new Headers({
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded"
  });

  const searchParams = new URLSearchParams();
  searchParams.append("scrollLeft", "0");
  searchParams.append("scrollTop", "0");
  searchParams.append("__EVENTTARGET", "");
  searchParams.append("__EVENTARGUMENT", "");
  searchParams.append("__VIEWSTATE", details.viewState);
  searchParams.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  searchParams.append("__VIEWSTATEENCRYPTED", "");
  searchParams.append("__EVENTVALIDATION", details.eventValidation);
  searchParams.append("ctl00$hdnDateFormat", "dd/mm/yy");
  searchParams.append("ctl00$body$hdnIsHead", "");
  searchParams.append("ctl00$body$hdnEditItemIndex", "");
  searchParams.append("ctl00$body$ContentSearch$cboCriteria", "RATING_CODE");
  searchParams.append("ctl00$body$ContentSearch$txtContent", "");
  searchParams.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  searchParams.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  searchParams.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "7");
  searchParams.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  searchParams.append("ctl00_body_grdsummary_ClientState", "");
  searchParams.append("ctl00$body$butNew", "New");

  const searchResponse = await fetch("/hr/EIM/RatingMethods.aspx", {
    method: "POST",
    headers: commonHeaders,
    body: searchParams,
    redirect: "follow"
  });

  const searchHtml = await searchResponse.text();
  const finalDetails = await BeaconBar.executeFunction("getDomExtract")(searchHtml);
  window.rm = finalDetails;

  const submitParams1 = new URLSearchParams();
  submitParams1.append("__EVENTTARGET", "ctl00$body$nuninimun");
  submitParams1.append("__EVENTARGUMENT", "");
  submitParams1.append("__VIEWSTATE", window.rm.viewState);
  submitParams1.append("__VIEWSTATEGENERATOR", window.rm.viewStateGen);
  submitParams1.append("__VIEWSTATEENCRYPTED", "");
  submitParams1.append("__EVENTVALIDATION", window.rm.eventValidation);
  submitParams1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  submitParams1.append("ctl00$body$txtName", args.ratingMethod);
  submitParams1.append("ctl00$body$txtgrade", args.grade);
  submitParams1.append("ctl00$body$nuninimun", args.minimumMarks);
  submitParams1.append("ctl00$body$numax", "");
  submitParams1.append("ctl00$body$nuAvg", "");

  const submitResponse1 = await fetch("/hr/EIM/RatingMethods.aspx", {
    method: "POST",
    headers: commonHeaders,
    body: submitParams1,
    redirect: "follow"
  });

  const submitHtml1 = await submitResponse1.text();
  const finalDetails1 = await BeaconBar.executeFunction("getDomExtract")(submitHtml1);
  window.sy = finalDetails1;

  const submitParams2 = new URLSearchParams();
  submitParams2.append("__EVENTTARGET", "ctl00$body$numax");
  submitParams2.append("__EVENTARGUMENT", "");
  submitParams2.append("__VIEWSTATE", window.sy.viewState);
  submitParams2.append("__VIEWSTATEGENERATOR", window.sy.viewStateGen);
  submitParams2.append("__VIEWSTATEENCRYPTED", "");
  submitParams2.append("__EVENTVALIDATION", window.sy.eventValidation);
  submitParams2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  submitParams2.append("ctl00$body$txtName", args.ratingMethod);
  submitParams2.append("ctl00$body$txtgrade", args.grade);
  submitParams2.append("ctl00$body$nuninimun", args.minimumMarks);
  submitParams2.append("ctl00$body$numax", args.maximumMarks);
  submitParams2.append("ctl00$body$nuAvg", "");

  const submitResponse2 = await fetch("/hr/EIM/RatingMethods.aspx", {
    method: "POST",
    headers: commonHeaders,
    body: submitParams2,
    redirect: "follow"
  });

  const submitHtml2 = await submitResponse2.text();
  const finalDetails2 = await BeaconBar.executeFunction("getDomExtract")(submitHtml2);
  window.sy = finalDetails2;

  const average = (args.minimumMarks + args.maximumMarks) / 2;

  const submitParams3 = new URLSearchParams();
  submitParams3.append("__EVENTTARGET", "ctl00$body$btnsavesub");
  submitParams3.append("__EVENTARGUMENT", "");
  submitParams3.append("__VIEWSTATE", window.sy.viewState);
  submitParams3.append("__VIEWSTATEGENERATOR", window.sy.viewStateGen);
  submitParams3.append("__VIEWSTATEENCRYPTED", "");
  submitParams3.append("__EVENTVALIDATION", window.sy.eventValidation);
  submitParams3.append("ctl00$hdnDateFormat", "dd/mm/yy");
  submitParams3.append("ctl00$body$txtName", args.ratingMethod);
  submitParams3.append("ctl00$body$txtgrade", args.grade);
  submitParams3.append("ctl00$body$nuninimun", args.minimumMarks);
  submitParams3.append("ctl00$body$numax", args.maximumMarks);
  submitParams3.append("ctl00$body$nuAvg", average);

  const submitResponse3 = await fetch("/hr/EIM/RatingMethods.aspx", {
    method: "POST",
    headers: commonHeaders,
    body: submitParams3,
    redirect: "follow"
  });

  const submitHtml3 = await submitResponse3.text();
  const finalDetails3 = await BeaconBar.executeFunction("getDomExtract")(submitHtml3);
  window.sy = finalDetails3;

  const submitParams4 = new URLSearchParams();
  submitParams4.append("scrollLeft", "0");
  submitParams4.append("scrollTop", "0");
  submitParams4.append("__EVENTTARGET", "");
  submitParams4.append("__EVENTARGUMENT", "");
  submitParams4.append("__VIEWSTATE", window.sy.viewState);
  submitParams4.append("__LASTFOCUS", "");
  submitParams4.append("__VIEWSTATEGENERATOR", window.sy.viewStateGen);
  submitParams4.append("__VIEWSTATEENCRYPTED", "");
  submitParams4.append("__EVENTVALIDATION", window.sy.eventValidation);
  submitParams4.append("ctl00$hdnDateFormat", "dd/mm/yy");
  submitParams4.append("ctl00$body$txtName", args.ratingMethod);
  submitParams4.append("ctl00$body$txtgrade", "");
  submitParams4.append("ctl00$body$nuninimun", "");
  submitParams4.append("ctl00$body$numax", "");
  submitParams4.append("ctl00$body$nuAvg", "");
  submitParams4.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  submitParams4.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  submitParams4.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  submitParams4.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  submitParams4.append("ctl00_body_grdgrade_ClientState", "");
  submitParams4.append("ctl00$body$butSave", "Save");

  const submitResponse4 = await fetch("/hr/EIM/RatingMethods.aspx", {
    method: "POST",
    headers: commonHeaders,
    body: submitParams4,
    redirect: "follow"
  });

  const submitHtml4 = await submitResponse4.text();
  return "create rating method!!";
});
