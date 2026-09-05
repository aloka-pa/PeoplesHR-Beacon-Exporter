(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignQualification.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  // const menus = BeaconBar?.user?.metaData?.menus;
  // const targetUrl = "EIM/AssignQualification.aspx?IsShowButtons=1";
  // const result = Array.isArray(menus) && menus.includes(targetUrl) ? targetUrl : null;
  // const queryString = result.split('?')[1] || "";

  const url = await BeaconBar.executeFunction("updateUrlParams")("EIM/AssignQualification.aspx?IsShowButtons=1")
  const digest = await BeaconBar.executeFunction('getDigest')(url.updateParams);

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const response = await fetch(`${location.origin}/${reqOptions.sl}/${url.updateUrl}&digest=${digest.digest}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });

  const detailsText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(detailsText, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  window.pqn = empNumber;

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "");
  urlencoded.append("scrollTop", "");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  urlencoded.append("__SCROLLPOSITIONX", "0");
  urlencoded.append("__SCROLLPOSITIONY", "0");
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00_body_grdUserDefine_ClientState", "");
  urlencoded.append("ctl00$body$grdQualification$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00$body$grdQualification$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
  urlencoded.append("ctl00_body_grdQualification_ClientState", "");
  urlencoded.append("ctl00$body$grdTND$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00$body$grdTND$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
  urlencoded.append("ctl00_body_grdTND_ClientState", "");
  urlencoded.append("ctl00$body$lblIsHavingTND", "True");
  urlencoded.append("ctl00$body$txtempnumber", empNumber);

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${url.updateUrl}&digest=${digest.digest}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const detailsText2 = await responsePost.text();
  const doc2 = parser.parseFromString(detailsText2, "text/html");

  const viewState2 = doc2.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator2 = doc2.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation2 = doc2.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey = doc2.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(publicKey, args.id);

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState2,
    __VIEWSTATEGENERATOR: viewStateGenerator2,
    __SCROLLPOSITIONX: "0",
    __SCROLLPOSITIONY: "0",
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation2,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00_body_grdUserDefine_ClientState": "",
    "ctl00$body$grdQualification$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdQualification_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdQualification$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "5",
    "ctl00_body_grdQualification_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdQualification_ClientState": "",
    "ctl00$body$grdTND$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdTND_ctl00_ctl03_ctl01_GoToPageSizeTextBox_ClientState": "",
    "ctl00$body$grdTND$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
    "ctl00_body_grdTND_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdTND_ClientState": "",
    "ctl00$body$butEdit": "Edit",
    "ctl00$body$lblIsHavingTND": "True",
    "ctl00$body$txtPublicKey": publicKey,
    "ctl00$body$txtempnumber": empEncId
  }, `${reqOptions.sl}/${url.updateUrl}&digest=${digest.digest}`);

  window.view = {
    viewState: editResponse.viewState,
    viewStateGenerator: editResponse.viewStateGen,
    eventValidation: editResponse.eventValidation,
    publicKey: publicKey,
    empEncId: empEncId
  };

  const docPost = parser.parseFromString(editResponse.rawData, "text/html");

  const qualificationTypeSelect = docPost.querySelector('#ctl00_body_cboQaType');
  const qualificationTypes = Array.from(qualificationTypeSelect.options).map(option => ({
    value: option.value,
    label: option.textContent.trim(),
    selected: option.selected || false
  }));

  const statusSelect = docPost.querySelector('#ctl00_body_cboStatus');
  const statusOptions = Array.from(statusSelect.options).map(option => ({
    label: option.textContent.trim(),
    value: option.value,
    selected: option.selected || false
  }));

  const durationSelect = docPost.querySelector('#ctl00_body_dpDurationType');
  const durationOptions = Array.from(durationSelect.options).map(option => ({
    label: option.textContent.trim(),
    value: option.value,
    selected: option.selected || false
  }));

  const currencySelect = docPost.querySelector('#ctl00_body_dpCurrTotalCost');

  const currenciesTotalCost = Array.from(currencySelect.options).map(option => ({
    value: option.value,
    label: option.textContent.trim(),
    selected: option.selected || false
  }));

  const reimbursedCurrencySelect = docPost.querySelector('#ctl00_body_dpCurrReimbursed');

  const reimbursementCurrencies = Array.from(reimbursedCurrencySelect.options).map(option => ({
    value: option.value,
    label: option.textContent.trim(),
    selected: option.selected || false
  }));


  const saveQualifications = Array.from(docPost.querySelectorAll("#ctl00_body_grdQualification_ctl00 tbody tr")).map(row => {
    const columns = row.querySelectorAll("td");
    const editAnchor = columns[7]?.querySelector("a[href*='__doPostBack']");
    const postbackMatch = editAnchor?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/);
    const postbackId = postbackMatch ? postbackMatch[1] : "";

    return {
      "Qualification Type": columns[0]?.textContent.trim() || "",
      "Qualification": columns[1]?.textContent.trim() || "",
      "School/Institute": columns[2]?.textContent.trim() || "",
      "Year of Qualification": columns[3]?.textContent.trim() || "",
      "Status": columns[4]?.textContent.trim() || "",
      "Qualification Effective Start Date": columns[5]?.textContent.trim() || "",
      "Qualification Effective End Date": columns[6]?.textContent.trim() || "",
      "Edit Postback ID": postbackId
    };
  });
  window.getqualificationsDetails = { saveQualifications, qualificationTypes, statusOptions, durationOptions, currenciesTotalCost, reimbursementCurrencies }
  return { saveQualifications, qualificationTypes, statusOptions, durationOptions, currenciesTotalCost, reimbursementCurrencies, trainingDetails: [] };
});
