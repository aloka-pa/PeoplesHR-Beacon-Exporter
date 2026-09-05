(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/MemberOfProf.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        // param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url
      }
    }
  }

  const updateUrlData = await payload("EIM/MemberOfProf.aspx");

  let details;
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });
  const detailsText = await response.text();
  window.eapq = detailsText;
  const docInit = new DOMParser().parseFromString(detailsText, "text/html");
  const empNumber = docInit.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  window.pqn = empNumber;

  const parser = new DOMParser();
  const doc = parser.parseFromString(window.eapq, "text/html");
  details = doc;

  const viewState = details.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = details.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = details.querySelector("#__EVENTVALIDATION")?.value || "";

  const publicKey = details.querySelector("#ctl00_body_txtPublicKey")?.value || "";


  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00$hdnQuickmenu", "");
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", window.pqn);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$CustomHiddenField", "");
  urlencoded.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdgrade_ClientState", "");
  urlencoded.append("ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded.append("ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdBarginingSummary_ClientState", "");
  urlencoded.append("ctl00$body$txtempnumber", window.pqn);
  urlencoded.append("ctl00$body$hdnSelectedTab", "0");
  urlencoded.append("ctl00$body$hdnHavePendingMemshipWFData", "0");
  urlencoded.append("ctl00$body$hdnHavePendingBargainWFData", "0");
  urlencoded.append("ctl00$body$txtPublicKey", publicKey);
  urlencoded.append("ctl00$body$hdnEventType", "");
  urlencoded.append("ctl00$body$HiddenField1", "");

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const docPost2 = parser.parseFromString(textPost, "text/html");

  const viewState2 = docPost2.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator2 = docPost2.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation2 = docPost2.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey1 = details.querySelector("#ctl00_body_txtPublicKey")?.value || "";


  const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(publicKey1, args.id);

  // const urlencoded1 = new URLSearchParams();
  // urlencoded1.append("scrollLeft", "0");
  // urlencoded1.append("scrollTop", "0");
  // urlencoded1.append("__EVENTTARGET", "TabClick");
  // urlencoded1.append("__EVENTARGUMENT", "1");
  // urlencoded1.append("__VIEWSTATE", viewState1);
  // urlencoded1.append("__VIEWSTATEGENERATOR", viewStateGenerator1);
  // urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  // urlencoded1.append("__EVENTVALIDATION", eventValidation1);
  // urlencoded1.append("ctl00$hdnDateFormat", "m/d/yy");
  // urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
  // urlencoded1.append("ctl00$body$EmpSearch$hdnEmpNumber", window.pqn);
  // urlencoded1.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  // urlencoded1.append("ctl00$body$CustomHiddenField", "");
  // urlencoded1.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  // urlencoded1.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  // urlencoded1.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  // urlencoded1.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  // urlencoded1.append("ctl00_body_grdgrade_ClientState", "");
  // urlencoded1.append("ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  // urlencoded1.append("ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  // urlencoded1.append("ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  // urlencoded1.append("ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  // urlencoded1.append("ctl00_body_grdBarginingSummary_ClientState", "");
  // urlencoded1.append("ctl00$body$txtempnumber", window.pqn);
  // urlencoded1.append("ctl00$body$hdnSelectedTab", "0");
  // urlencoded1.append("ctl00$body$hdnHavePendingMemshipWFData", "0");
  // urlencoded1.append("ctl00$body$hdnHavePendingBargainWFData", "0");
  // urlencoded1.append("ctl00$body$hdnEventType", "");
  // urlencoded1.append("ctl00$body$HiddenField1", "");


  // const responsePost2 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/MemberOfProf.aspx`, {
  //   method: "POST",
  //   headers: myHeaders,
  //   body: urlencoded1,
  //   redirect: "follow"
  // });

  // const textPost2 = await responsePost2.text();
  // const docPost2 = parser.parseFromString(textPost2, "text/html");

  // const viewState2 = docPost2.querySelector("#__VIEWSTATE")?.value || "";
  // const viewStateGenerator2 = docPost2.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  // const eventValidation2 = docPost2.querySelector("#__EVENTVALIDATION")?.value || "";

  // const rows2 = docPost2.querySelectorAll(".GridRow_Default");
  // const bargainingUnits = Array.from(rows2).map(row => {
  //   const cells = row.querySelectorAll("td");
  //   return {
  //     bargainingUnit: cells[0]?.textContent.trim() || "",
  //     startDate: cells[1]?.textContent.trim() || "",
  //     endDate: cells[2]?.textContent.trim() || ""
  //   };
  // });

  const response3 = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState2,
    "__VIEWSTATEGENERATOR": viewStateGenerator2,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": eventValidation2,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$CustomHiddenField": "",
    "ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdgrade_ClientState": "",
    "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdBarginingSummary_ClientState": "",
    "ctl00$body$butEdit": "Edit",
    "ctl00$body$txtempnumber": empEncId,
    // "ctl00$body$txtempnumber":emp.Emp_number,
    "ctl00$body$hdnSelectedTab": "0",
    "ctl00$body$hdnHavePendingMemshipWFData": "0",
    "ctl00$body$hdnHavePendingBargainWFData": "0",
    "ctl00$body$txtPublicKey": publicKey,
    "ctl00$body$hdnEventType": "",
    "ctl00$body$HiddenField1": ""
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

  const docPost3 = parser.parseFromString(response3.rawData, "text/html");

  window.view = response3;

  // window.pk = {
  //   publicKey : response.
  //   empEncId
  // }

  const select = docPost3.querySelector("#ctl00_body_dpcountry");

  const membershipTypes = Array.from(select.options)
    .filter(option => option.value !== "-1")
    .map(option => ({
      value: option.value,
      label: option.textContent.trim()
    }));

  const titleSelect = docPost3.querySelector("#ctl00_body_dpmemtitles");

  const membershipTitles = Array.from(titleSelect.options)
    .filter(option => option.value !== "-1") // skip default/placeholder option
    .map(option => ({
      value: option.value,
      label: option.textContent.trim()
    }));

  const bargainingTable = docPost3.querySelector("#ctl00_body_grdBarginingSummary");
  const rows2 = bargainingTable?.querySelectorAll(".GridRow_Default") || [];

  const bargainingUnits = Array.from(rows2).map(row => {
    const cells = row.querySelectorAll("td");

    const editLink = row.querySelector("a[href*='__doPostBack'][href*='ctl00$body$grdBarginingSummary$']");
    let editId = "";
    if (editLink) {
      const href = editLink.getAttribute("href");
      const match = href.match(/__doPostBack\('([^']+)'/);
      if (match) {
        editId = match[1];
      }
    }

    return {
      bargainingUnit: cells[0]?.textContent.trim() || "",
      startDate: cells[1]?.textContent.trim() || "",
      endDate: cells[2]?.textContent.trim() || "",
      editId: editId
    };
  });


  const membershipTable = docPost3.querySelector("#ctl00_body_grdgrade");
  const rows3 = membershipTable?.querySelectorAll(".GridRow_Default") || [];

  const membershipDetails = Array.from(rows3).map(row => {
    const cells = row.querySelectorAll("td");

    const editLink = row.querySelector("a[href*='__doPostBack'][href*='ctl00$body$grdgrade$']");
    let editId = "";
    if (editLink) {
      const href = editLink.getAttribute("href");
      const match = href.match(/__doPostBack\('([^']+)'/);
      if (match) {
        editId = match[1];
      }
    }

    return {
      membership: cells[0]?.textContent.trim() || "",
      commencementDate: cells[1]?.textContent.trim() || "",
      renewalDate: cells[2]?.textContent.trim() || "",
      subscriptionOwnership: cells[3]?.textContent.trim() || "",
      company: cells[4]?.textContent.trim() || "",
      editId: editId
    };
  });

  const empNum = docPost2.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return {
      employeeId: args.id,
      membershipTitles,
      membershipTypes,
      membershipDetails,
      bargainingUnits
    };
  } else {
    return "no availbel in the employee and display employee id."
  }

});
