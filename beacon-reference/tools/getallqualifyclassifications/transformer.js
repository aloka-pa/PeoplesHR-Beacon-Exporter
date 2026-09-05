(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("QualificationClassific");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", details.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.classificatioCode || "");
  urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "6");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow",
  };

  const response1 = await fetch("/hr/EIM/QualificationClassific.aspx", requestOptions1);
  const html1 = await response1.text();

  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  const parser1 = new DOMParser();
  const doc1 = parser1.parseFromString(html1, "text/html");


  const row = doc1.querySelector("#ctl00_body_grdsummary_ctl00__0");
  const key = row?.querySelector("a")?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

  if (!key) {
    throw new Error("Unable to find the key for postback.");
  }

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", key);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
  urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.classificatioCode || "");
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow",
  };

  const response2 = await fetch(`${location.origin}/hr/EIM/QualificationClassific.aspx`, requestOptions2);
  const html2 = await response2.text();
  const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);

  window.rm = finalDetails;

 function extractSkillRatingData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const ratingCodeElement = doc.querySelector("#ctl00_body_txtCode");
    const ratingMethodElement = doc.querySelector("#ctl00_body_txtName");
      const rank = doc.querySelector("#ctl00_body_txtRate");

    const ratingCode = ratingCodeElement ? ratingCodeElement.value.trim() : "";
    const ratingMethod = ratingMethodElement ? ratingMethodElement.value.trim() : "";
      const ranking = rank ? rank.value.trim() : "";


   

    return {
      code: ratingCode,
      Classification: ratingMethod,
      Rank: ranking
    };
  }


  const extractedData = extractSkillRatingData(html2);

  return extractedData;
});
