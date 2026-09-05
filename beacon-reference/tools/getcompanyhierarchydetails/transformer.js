(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("CompanyHierarchy");
  window.ch = details;

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.ch.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.ch.viewStateGen);
  urlencoded1.append("__SCROLLPOSITIONX", "0");
  urlencoded1.append("__SCROLLPOSITIONY", "0");
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.ch.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded1.append("ctl00$body$ContentSearchCompanyHie$cboCriteria", "T.HIE_CODE");
  urlencoded1.append("ctl00$body$ContentSearchCompanyHie$ddlHie", "-1");
  urlencoded1.append("ctl00$body$ContentSearchCompanyHie$txtContent", args.hierarchyCode);
  urlencoded1.append("ctl00$body$ContentSearchCompanyHie$butSearch", "Search");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "26");
  urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
  urlencoded1.append("ctl00$body$hdnOrgchartURL", "../OrgChartV9/companychart.aspx?popup=1&digest=WGreiH2lCZhF2jzcVDYkmg");

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/hr/EIM/CompanyHierarchy.aspx`, requestOptions1);
  const html1 = await response1.text();
  const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
  const parser = new DOMParser();
  const document = parser.parseFromString(html1, 'text/html');
  const anchor = document.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
  const postBackId = anchor?.getAttribute('href')?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", postBackId);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
  urlencoded2.append("__SCROLLPOSITIONX", "0");
  urlencoded2.append("__SCROLLPOSITIONY", "0");
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded2.append("ctl00$body$ContentSearchCompanyHie$cboCriteria", "T.HIE_CODE");
  urlencoded2.append("ctl00$body$ContentSearchCompanyHie$ddlHie", "-1");
  urlencoded2.append("ctl00$body$ContentSearchCompanyHie$txtContent", args.hierarchyCode);
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdsummary_ClientState", "");
  urlencoded2.append("ctl00$body$hdnOrgchartURL", "../OrgChartV9/companychart.aspx?popup=1&digest=WGreiH2lCZhF2jzcVDYkmg");

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(`${location.origin}/hr/EIM/CompanyHierarchy.aspx`, requestOptions2);
  const html2 = await response2.text();
  const doc2 = parser.parseFromString(html2, 'text/html');

  const getValue = (selector) => doc2.querySelector(selector)?.value?.trim() || "";
  const getText = (selector) => doc2.querySelector(selector)?.innerText?.trim() || "";
  const getSelectText = (selector) => {
    const el = doc2.querySelector(selector);
    return el ? el.options[el.selectedIndex]?.text.trim() || "" : "";
  };
  const getImgSrc = (selector) => doc2.querySelector(selector)?.getAttribute("src") || "";

  const checkbox = document.querySelector('#ctl00_body_chkHieCodeActive');
  const isActive = checkbox?.checked ? true : false;

  const hierarchyData = {
    code: getValue("#ctl00_body_txtCode"),
    hierarchyLevel: getSelectText("#ctl00_body_CboHierarchyLevel"),
    hierarchyName: getValue("#ctl00_body_txtDes"),
    abbreviation: getValue("#ctl00_body_txtAbbreviation"),
    telephone: getValue("#ctl00_body_txttp"),
    fax: getValue("#ctl00_body_txtFax"),
    email: getValue("#ctl00_body_txtemail"),
    url: getValue("#ctl00_body_txturl"),
    address: getValue("#ctl00_body_txtaddress"),
    headName: getValue("#ctl00_body_txtHeadName"),
    titleOfHead: getValue("#ctl00_body_txtHTitle"),
    administrator: getValue("#ctl00_body_txtAdminName"),
    country: getSelectText("#ctl00_body_ddlCountry"),
    location: getSelectText("#ctl00_body_dplocation"),
    logoUrl: getImgSrc("#ctl00_body_imgTempEMPImage"),
    headerImageUrl: getImgSrc("#ctl00_body_imgTempEMPImageHeader"),
    footerImageUrl: getImgSrc("#ctl00_body_imgTempEMPImageFooter"),
    isActive:isActive,
    additionalRoles: Array.from(doc2.querySelectorAll("#ctl00_body_grdHead input")).map(input => ({
      role: input.closest('tr')?.children[0]?.innerText.trim() || "",
      employeeName: input.value.trim()
    })),
    classifications: Array.from(doc2.querySelectorAll("#ctl00_body_drpClassification option"))
      .filter(option => option.selected)
      .map(option => option.text.trim())
  };


  return hierarchyData;
})
