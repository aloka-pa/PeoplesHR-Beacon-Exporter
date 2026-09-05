(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("SalaryGradeInfo");

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
  urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "SAGRD.SAL_GRD_CODE");
  urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.gradeCode);
  urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "33");
  urlencoded1.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary1_ClientState", "");
  urlencoded1.append("ctl00$body$hdnDecimalFormat", "2");

  const requestOptions1 = { method: "POST", headers: myHeaders, body: urlencoded1, redirect: "follow" };
  const response1 = await fetch(`${location.origin}/hr/EIM/SalaryGradeInfo.aspx`, requestOptions1);
  const html1 = await response1.text();
  const parser1 = new DOMParser();
  const doc1 = parser1.parseFromString(html1, 'text/html');

  const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary1_ctl00__"] a[href^="javascript:__doPostBack"]');
  const href = anchor?.getAttribute('href') || "";
  const match = href.match(/__doPostBack\('([^']+)'/);
  const postBackCode = match ? match[1] : "";

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", postBackCode);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "SAGRD.SAL_GRD_CODE");
  urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.gradeCode);
  urlencoded2.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdsummary1_ClientState", "");
  urlencoded2.append("ctl00$body$hdnDecimalFormat", "2");

  const requestOptions2 = { method: "POST", headers: myHeaders, body: urlencoded2, redirect: "follow" };
  const response2 = await fetch(`${location.origin}/hr/EIM/SalaryGradeInfo.aspx`, requestOptions2);
  const html2 = await response2.text();

  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
  window.sg = viewDetails;
  const parser2 = new DOMParser();
  const doc2 = parser2.parseFromString(html2, 'text/html');

  const salaryGradeData = {
    code: doc2.getElementById('ctl00_body_txtsalcode')?.value.trim() || "",
    salaryGradeName: doc2.getElementById('ctl00_body_txtsalname')?.value.trim() || "",
    currency: {
      value: doc2.getElementById('ctl00_body_cboCurrType')?.value || "",
      text: doc2.getElementById('ctl00_body_cboCurrType')?.options[doc2.getElementById('ctl00_body_cboCurrType')?.selectedIndex]?.text.trim() || ""
    },
    salaryType: (() => {
      const rangeRadio = doc2.getElementById('ctl00_body_optsalary_0');
      const slotRadio = doc2.getElementById('ctl00_body_optsalary_1');
      if (rangeRadio?.checked) return "Range";
      if (slotRadio?.checked) return "Slot";
      return "";
    })(),
    minPoint: doc2.getElementById('ctl00_body_txtMin')?.value.trim() || "",
    midPoint: doc2.getElementById('ctl00_body_txtMid')?.value.trim() || "",
    maxPoint: doc2.getElementById('ctl00_body_txtMax')?.value.trim() || ""
  };

  const select = doc2.getElementById('ctl00_body_cboCurrType');
  const currencies = select ? Array.from(select.options)
    .filter(option => option.value !== "-1")
    .map(option => ({
      value: option.value,
      text: option.text.trim()
    })) : [];


  return { salaryGradeData, currencies };
})
