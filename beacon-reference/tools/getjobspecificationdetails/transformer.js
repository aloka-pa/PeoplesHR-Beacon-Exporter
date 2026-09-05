(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignJobProfile.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url,
        param: ""
      }
    }
  }

  const updateUrlData = await payload("EIM/AssignJobProfile.aspx");
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
  const parser = new DOMParser();
  const doc = parser.parseFromString(detailsText, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  window.pqn = empNumber;

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
  const jobCode = doc.querySelector("#ctl00_body_hdnJobCode")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded1 = new URLSearchParams({
    scrollLeft: "",
    scrollTop: "",
    __EVENTTARGET: "GetSearchResult",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGenerator,
    // __SCROLLPOSITIONX: "0",
    // __SCROLLPOSITIONY: "0",
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": empNumber,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$grdEmpJobData$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdEmpJobData_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdEmpJobData$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
    "ctl00_body_grdEmpJobData_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdEmpJobData_ClientState": "",
    "ctl00$body$hdnJobCode": jobCode
  });

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const docPost1 = parser.parseFromString(textPost, "text/html");
  const viewState1 = docPost1.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator1 = docPost1.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = docPost1.querySelector("#__EVENTVALIDATION")?.value || "";
  const jobCode2 = doc.querySelector("#ctl00_body_hdnJobCode")?.value || "";

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState1);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGenerator1);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation1);
  urlencoded2.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded2.append("ctl00$hdnQuickmenu", "");
  urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded2.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded2.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded2.append("ctl00$body$grdEmpJobData$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded2.append("ctl00_body_grdEmpJobData_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded2.append("ctl00$body$grdEmpJobData$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "9");
  urlencoded2.append("ctl00_body_grdEmpJobData_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded2.append("ctl00_body_grdEmpJobData_ClientState", "");
  urlencoded2.append("ctl00$body$butEdit", "Edit");
  urlencoded2.append("ctl00$body$hdnJobCode", jobCode2);

  const responseEdit = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  });

  const textEdit = await responseEdit.text();
  const docEdit = parser.parseFromString(textEdit, "text/html");

  window.jbs = {
    viewState: docEdit.querySelector("#__VIEWSTATE")?.value || "",
    viewStateGenerator: docEdit.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
    eventValidation: docEdit.querySelector("#__EVENTVALIDATION")?.value || "",
    jobcode3: docEdit.querySelector("#ctl00_body_hdnJobCode")?.value || ""
  };

  const rows = docEdit.querySelectorAll("#ctl00_body_grdEmpJobData_ctl00 tbody tr");

  const jobspecificationDetails = Array.from(rows).map(row => {
    const name = row.querySelector("td:nth-child(1)")?.textContent.trim() || "";
    const comment = row.querySelector("span[id^='ctl00_body_grdEmpJobData_']")?.textContent.trim() || "";
    const editId = row.querySelector("a[id*='EditButton']")?.id.replace(/_/g, "$") || "";

    return { name, comment, editId };
  });
  const empNum = docPost1.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return jobspecificationDetails;
  } else {
    return "no availbel in the employee and display employee id."
  }
});
