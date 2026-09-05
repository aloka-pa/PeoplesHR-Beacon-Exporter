(async function (data, args, reqOptions) {
  // const digest = await BeaconBar.executeFunction('getDigest')("IsShowButtons=1");
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const response = await fetch(`${location.origin}/${reqOptions.sl}/EIM/empCoveringDetails.aspx`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });

  const detailsText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(detailsText, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  // window.pqn = empNumber;

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey = doc.querySelector("#ctl00_footers_txtPublicKey")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);


  // const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(publicKey, args.id)

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
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$hdnDisplayMethod", "1");
  urlencoded.append("ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
  urlencoded.append("ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdCovringDtl_ClientState", "");
  urlencoded.append("ctl00$footers$hdnIsDateChanged", "1");
  urlencoded.append("ctl00$footers$txtPublicKey", publicKey);
  urlencoded.append("ctl00$footers$txtempNo", args.id);

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/EIM/empCoveringDetails.aspx`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const docPost = parser.parseFromString(textPost, "text/html");

  const viewState1 = docPost.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator1 = docPost.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = docPost.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey1 = docPost.querySelector("#ctl00_footers_txtPublicKey")?.value || "";

  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(publicKey1, args.id);

  const newResponse = await BeaconBar.executeFunction("module")(
    {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: viewState1,
      __VIEWSTATEGENERATOR: viewStateGenerator1,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: eventValidation1,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$hdnDisplayMethod": "1",
      "ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdCovringDtl_ClientState": "",
      "ctl00$body$butNew": "New",
      "ctl00$footers$hdnIsDateChanged": "1",
      "ctl00$footers$txtPublicKey": publicKey1,
      "ctl00$footers$txtempNo": empEnc
    },
    `${reqOptions.sl}/EIM/empCoveringDetails.aspx`
  );

  window.emp = { publicKey1, empEnc, newResponse }

  const document = parser.parseFromString(newResponse.rawData, "text/html");
  const selectElement = document.querySelector('#ctl00_body_drpSalaryGrade');
  const personalGradeOptions = Array.from(selectElement.options)
    .filter(option => option.value !== "-1")
    .map(option => ({
      key: option.value,
      value: option.textContent.trim()
    }));

  const groupLevelSelect = document.querySelector('#ctl00_body_drpClassification');

  const groupLevelOptions = Array.from(groupLevelSelect.options)
    .filter(option => option.value !== "")
    .map(option => ({
      key: option.value,
      value: option.textContent.trim()
    }));

  const empNum = docPost.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return { personalGradeOptions, groupLevelOptions }
  } else {
    return "no availbel in the employee and display employee id."
  }
});
