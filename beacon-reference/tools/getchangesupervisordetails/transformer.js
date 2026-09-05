(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignSubordinateBulk.aspx")) {
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

  const updateUrlData = await payload("EIM/AssignSubordinateBulk.aspx");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const baseUrl = `${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`;

  const getResponse = await fetch(baseUrl, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });

  const parser = new DOMParser();
  const initialText = await getResponse.text();
  const initialDoc = parser.parseFromString(initialText, "text/html");

  let viewState = initialDoc.querySelector("#__VIEWSTATE")?.value || "";
  let viewStateGenerator = initialDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  let eventValidation = initialDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  let publickey = initialDoc.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  let empNumber = initialDoc.querySelector('input[id="ctl00_body_txtempnumber"]')?.value || "";
  let fullname = initialDoc.querySelector("#ctl00_body_txtFullName")?.value || "";
  let designation = initialDoc.querySelector("#ctl00_body_txtdesignation")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const requestParams = {
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "GetSearchResult",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGenerator,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$txtActualEmpNo": empNumber,
    "ctl00$body$txtEmpNo": empNumber,
    "ctl00$body$txtPublicKey": publickey,
    "ctl00$body$txtFullName": fullname,
    "ctl00$body$txtdesignation": designation,
    "ctl00$body$txtempnumber": empNumber,
    "ctl00$body$empSelectionIndividual$hdnEmpNumber": empNumber,
    "ctl00$body$empSelectionIndividual$hdnActiveInactiveToolbar": "",
    "ctl00$body$HFCurrTabIndex": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdDirectSubordinates_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "5",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdInDirectSubordinates_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_GrdempSup_ClientState": ""
  };

  const response = await BeaconBar.executeFunction('module')(requestParams, `${reqOptions.sl}/${updateUrlData.pageUrl}`);
  let doc = parser.parseFromString(response.rawData, "text/html");

  const empNum = doc.querySelector("#ctl00_body_empSelectionIndividual_txtEmpDisplayNumber").value || "";

  let empNumber1 = doc.querySelector('input[id="ctl00_body_txtempnumber"]')?.value || "";
  let fullname1 = doc.querySelector("#ctl00_body_txtFullName")?.value || "";
  let designation1 = doc.querySelector("#ctl00_body_txtdesignation")?.value || "";
  let viewState1 = doc.querySelector("#__VIEWSTATE")?.value || "";
  let viewStateGenerator1 = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  let eventValidation1 = doc.querySelector("#__EVENTVALIDATION")?.value || "";
  let publickey1 = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  window.employeeSelect = {
    empNumber1: doc.querySelector('input[id="ctl00_body_txtempnumber"]')?.value || "",
    fullname1: doc.querySelector("#ctl00_body_txtFullName")?.value || "",
    designation1: doc.querySelector("#ctl00_body_txtdesignation")?.value || ""
  }

  const extractDirectSubordinates = (doc) => {
    const rows = doc.querySelectorAll("#ctl00_body_grdDirectSubordinates_ctl00 tbody tr");
    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    const publickey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";
    return Array.from(rows).map((row, index) => {
      const cells = row.querySelectorAll("td");
      return {
        index,
        employeeNo: cells[0]?.textContent.trim() || "",
        fullName: cells[1]?.textContent.trim() || "",
        currentSupervisor: cells[2]?.textContent.trim() || "",
        historyLink: cells[3]?.querySelector("a")?.href || "",
        viewState,
        viewStateGenerator,
        eventValidation,
        publickey
      };
    });
  };

  let allDirectSubordinates = [];
  allDirectSubordinates.push(...extractDirectSubordinates(doc));

  let pagetargetValue = doc.querySelector('.PagerLeft_Default a[href*="__doPostBack"]')
    ?.getAttribute("href")
    ?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

  let prevNumber = parseInt(pagetargetValue?.match(/ctl(\d{2})$/)?.[1] || "0", 10);

  while (pagetargetValue) {
    const nextResponse = await BeaconBar.executeFunction('module')({
      ...requestParams,
      __EVENTTARGET: pagetargetValue,
      __VIEWSTATE: viewState1,
      __VIEWSTATEGENERATOR: viewStateGenerator1,
      __EVENTVALIDATION: eventValidation1,
      "ctl00$body$txtPublicKey": publickey1,
      "ctl00$body$txtActualEmpNo": empNumber1,
      "ctl00$body$txtEmpNo": empNumber1,
      "ctl00$body$txtFullName": fullname1,
      "ctl00$body$txtdesignation": designation1,
      "ctl00$body$txtempnumber": empNumber1,
      "ctl00$body$empSelectionIndividual$hdnEmpNumber": empNumber1
    }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

    doc = parser.parseFromString(nextResponse.rawData, "text/html");
    allDirectSubordinates.push(...extractDirectSubordinates(doc));

    // Update values
    viewState1 = doc.querySelector("#__VIEWSTATE")?.value || "";
    viewStateGenerator1 = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    eventValidation1 = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    publickey1 = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";
    empNumber1 = doc.querySelector('input[id="ctl00_body_txtempnumber"]')?.value || "";
    fullname1 = doc.querySelector("#ctl00_body_txtFullName")?.value || "";
    designation1 = doc.querySelector("#ctl00_body_txtdesignation")?.value || "";

    window.employeeSelect = {
      empNumber1: doc.querySelector('input[id="ctl00_body_txtempnumber"]')?.value || "",
      fullname1: doc.querySelector("#ctl00_body_txtFullName")?.value || "",
      designation1: doc.querySelector("#ctl00_body_txtdesignation")?.value || ""
    }

    const nextTarget = doc.querySelector('.PagerLeft_Default a[href*="__doPostBack"]')
      ?.getAttribute("href")
      ?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

    const nextNumber = parseInt(nextTarget?.match(/ctl(\d{2})$/)?.[1] || "0", 10);

    if (nextNumber > prevNumber) {
      prevNumber = nextNumber;
      pagetargetValue = nextTarget;
    } else {
      break;
    }
  }

  const extractIndirectSubordinates = (doc) => {
    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    const rows = doc.querySelectorAll("#ctl00_body_grdInDirectSubordinates_ctl00 tbody tr");
    const publickey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";
    return Array.from(rows).map((row, index) => {
      const cells = row.querySelectorAll("td");
      return {
        index,
        employeeNo: cells[0]?.textContent.trim() || "",
        fullName: cells[1]?.textContent.trim() || "",
        historyLink: cells[2]?.querySelector("a")?.href || "",
        viewState,
        viewStateGenerator,
        eventValidation,
        publickey
      };
    });
  };

  const directIndirectSupervisors = (doc) => {
    const rows = doc.querySelectorAll("#ctl00_body_GrdempSup_ctl00 tbody tr");
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll("td");
      return {
        employeeNo: cells[0]?.textContent.trim() || "",
        fullName: cells[1]?.textContent.trim() || "",
        type: cells[2]?.textContent.trim() || ""
      };
    });
  };

  window.direct = allDirectSubordinates;
  window.indirect = extractIndirectSubordinates(doc);

  if (empNum === args.id) {
    return {
      extractDirectSubordinate: allDirectSubordinates.map(x => ({
        currentSupervisor: x.currentSupervisor,
        employeeNo: x.employeeNo,
        fullName: x.fullName,
        historyLink: x.historyLink,
        index: x.index
      })),
      extractIndirectSubordinate: extractIndirectSubordinates(doc).map(x => ({
        employeeNo: x.employeeNo,
        fullName: x.fullName,
        historyLink: x.historyLink,
        index: x.index
      })),
      directIndirectSupervisors: directIndirectSupervisors(doc)
    };
  } else {
    return "no availbel in the employee and display employee id."
  }

});
