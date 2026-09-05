(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/WorkExperience.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


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

  const updateUrlData = await payload("EIM/WorkExperience.aspx");

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
  const publicKey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  // urlencoded.append("__SCROLLPOSITIONX", "0");
  // urlencoded.append("__SCROLLPOSITIONY", "0");
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00$hdnQuickmenu", "");
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$txtPublicKey", publicKey);
  urlencoded.append("ctl00$body$txtempNo", empNumber);
  urlencoded.append("ctl00$body$txtperemail", "");
  urlencoded.append("ctl00$body$hdncompname", "PeoplesHR");
  urlencoded.append("ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded.append("ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdGrade1_ClientState", "");
  urlencoded.append("ctl00$body$hdnDateFormate", "m/d/yyyy");

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const first = await BeaconBar.executeFunction('getDomExtract')(textPost);

  const doc3 = parser.parseFromString(textPost, "text/html");

  const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(first.publicKey, args.id);

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: first.viewState,
    __VIEWSTATEGENERATOR: first.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: first.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$txtPublicKey": first.publicKey,
    "ctl00$body$txtempNo": empEncId,
    "ctl00$body$txtperemail": "",
    "ctl00$body$hdncompname": "PeoplesHR",
    "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdGrade1$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdGrade1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdGrade1_ClientState": "",
    "ctl00$body$butEdit": "Edit",
    "ctl00$body$hdnDateFormate": "m/d/yyyy"
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

  window.view = { editResponse, empEncId };

  const docPost = parser.parseFromString(editResponse.rawData, "text/html");

  const category = docPost.querySelector(".GroupHeader_Default p")?.textContent.trim().replace("Category :", "").trim() || "";
  const rows = docPost.querySelectorAll(".GridRow_Default");
  const workExperience = Array.from(rows).map(row => {
    const cells = row.querySelectorAll("td");
    const columns = row.querySelectorAll("td");
    const editAnchor = columns[7]?.querySelector("a[href*='__doPostBack']");
    const postbackMatch = editAnchor?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/);
    const postbackId = postbackMatch ? postbackMatch[1] : "";
    return {
      fromDate: cells[1]?.textContent.trim() || "",
      toDate: cells[2]?.textContent.trim() || "",
      companyName: cells[3]?.textContent.trim() || "",
      functionalTitle: cells[4]?.textContent.trim() || "",
      noOfYears: cells[5]?.textContent.trim() || "",
      noOfMonths: cells[6]?.textContent.trim() || "",
      editId: postbackId,
      category: category
    };
  });

  const empNum = doc3.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return workExperience;
  } else {
    return "no existing the employee user given employee id or name."
  }
});
