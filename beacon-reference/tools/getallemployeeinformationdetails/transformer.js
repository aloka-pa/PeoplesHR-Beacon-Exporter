(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("eimv9/employee/employee?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/AssignBankInformation.aspx');
  let pageUrl;
  if (updateurl.updateUrl) {
    pageUrl = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    pageUrl = `${location.origin}/${reqOptions.sl}/EIM/AssignBankInformation.aspx`;
  }

  const getResponse = await fetch(pageUrl, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });

  const detailsText = await getResponse.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(detailsText, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  window.pqn = empNumber;

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams({
    scrollLeft: "",
    scrollTop: "",
    __EVENTTARGET: "GetSearchResult",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGenerator,
    __SCROLLPOSITIONX: "0",
    __SCROLLPOSITIONY: "0",
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$body$EmpSearch$hdnEmpNumber": empNumber,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$txtAccount": "",
    "ctl00$body$txtempnumber": empNumber,
    "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
    "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdEmpBank_ClientState": "",
    "ctl00$body$hdnCurrentAmount": "",
    "ctl00$body$hdnAmountType": "",
    "ctl00$body$txtEmpNo": empNumber
  });

  await fetch(pageUrl, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  // const updateurl1 = await BeaconBar.executeFunction("updateUrlParams")('eimv9/employee/employee?mvc=1');
  // let url;
  // let param;
  // if (updateurl1.updateUrl) {
  //   param = updateurl.updateParams
  //   url = updateurl1.updateUrl;
  // } else {
  //   url = `eimv9/employee/employee?mvc=1`;
  //   param = "mvc=1";
  // }

  const digest2 = await BeaconBar.executeFunction('getDigest')("mvc=1");

  const myHeaders2 = new Headers();
  myHeaders2.append("accept", "*/*");
  myHeaders2.append("accept-language", "en-US,en;q=0.9");
  myHeaders2.append("cache-control", "no-cache");
  myHeaders2.append("x-requested-with", "XMLHttpRequest");


  const employeeUrl = `${location.origin}/${reqOptions.sl}/eimv9/employee/employee?mvc=1&digest=${digest2.digest}&_=${Date.now()}`;

  const employeeResponse = await fetch(employeeUrl, {
    method: "GET",
    headers: myHeaders2,
    redirect: "follow"
  });

  const text = await employeeResponse.text();
  const doc2 = parser.parseFromString(text, "text/html");
  const scriptTags = doc2.querySelectorAll("script");

  let modelObject = null;

  scriptTags.forEach(script => {
    if (script.textContent.includes("var model = {")) {
      const scriptContent = script.textContent;
      const modelStart = scriptContent.indexOf("var model = {") + 12;
      const modelEnd = scriptContent.indexOf("};", modelStart) + 1;
      const modelString = scriptContent.substring(modelStart, modelEnd);
      try {
        modelObject = JSON.parse(modelString);
      } catch (err) {
      }
    }
  });

  const otherDetailsUrl = `${location.origin}/${reqOptions.sl}/EIMV9/OtherDetails/OtherDetailsDataWFEIMAdminSide`;

  const payload = {
    empNumber: modelObject?.Emp_number || "",
    workflow_id: null
  };

  const otherDetailsResponse = await fetch(otherDetailsUrl, {
    method: "POST",
    headers: {
      "Accept": "*/*",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const result = await otherDetailsResponse.json();
  const otherDetails = result.AttributesList;
  const details = {
    personalDetails: modelObject?.EmployeeDetails?.EmployeePersonalInfo,
    employmentDetails: modelObject?.EmployeeDetails?.EmployeeEmployementInfo,
    employeeWorkstation: modelObject?.EmpWorkstation,
    employeeContactDetails: modelObject?.EmployeeDetails?.EmployeeContactInfo,
    otherDetails: otherDetails
  };
  BeaconBar.setSharedData("EmployeeDetails", details);
  return details;
});
