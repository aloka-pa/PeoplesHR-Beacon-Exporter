(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/CompanyHierarchyDefine.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers(reqOptions?.headers || {
    "Content-Type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest"
  });

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", args.id);
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.company.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.company.viewStateGen);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.company.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "100");
  urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdSummary_ClientState", "");

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/CompanyHierarchyDefine.aspx`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  });
  const html1 = await response1.text();
  const details1 = await BeaconBar.executeFunction('getDomExtract')(html1);

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", details1.viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", details1.viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", details1.eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded2.append("ctl00$body$butEdit", "Edit");

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/CompanyHierarchyDefine.aspx`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  });
  const html2 = await response2.text();
  const details2 = await BeaconBar.executeFunction('getDomExtract')(html2);

  const urlencoded3 = new URLSearchParams();
  urlencoded3.append("scrollLeft", "0");
  urlencoded3.append("scrollTop", "0");
  urlencoded3.append("__EVENTTARGET", "");
  urlencoded3.append("__EVENTARGUMENT", "");
  urlencoded3.append("__VIEWSTATE", details2.viewState);
  urlencoded3.append("__VIEWSTATEGENERATOR", details2.viewStateGen);
  urlencoded3.append("__VIEWSTATEENCRYPTED", "");
  urlencoded3.append("__EVENTVALIDATION", details2.eventValidation);
  urlencoded3.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded3.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded3.append("ctl00$body$txtName", args.updateName);
  urlencoded3.append("ctl00$body$butSave", "Save");

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/CompanyHierarchyDefine.aspx`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded3,
    redirect: "follow"
  });
  const html3 = await response3.text();

  return "Update successfully!";
})
