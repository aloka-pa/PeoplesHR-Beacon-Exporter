(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/ContractExtend.aspx?IsShowButtons=1")) {
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
        param: "IsShowButtons=1"
      }
    }
  }

  const updateUrlData = await payload("EIM/ContractExtend.aspx?IsShowButtons=1");

  const digest = await BeaconBar.executeFunction('getDigest')(updateUrlData.param);
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });

  const detailsText = await response.text();
  const parser = new DOMParser();
  let doc = parser.parseFromString(detailsText, "text/html");

  const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
  let viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  let viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  let eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
  let publickey = doc.querySelector('#ctl00_body_txtPublicKey')?.value || "";

  BeaconBar.setSharedData('employeeid', args.id);
  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "");
  urlencoded.append("scrollTop", "");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$hdnQuickmenu", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "9");
  urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdsummary_ClientState", "");
  urlencoded.append("ctl00$body$txtempNo", empNumber);
  urlencoded.append("ctl00$body$txtPublicKey", publickey);

  let responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  let textPost = await responsePost.text();
  let docPost = parser.parseFromString(textPost, "text/html");

  const currentContractDetails = {
    currentContractCommencementDate: docPost.querySelector('#ctl00_body_txtstartDate')?.value || '',
    currentContractTerminationDate: docPost.querySelector('#ctl00_body_txtendDate')?.value || '',
    contractExtensionCommencementDate: docPost.querySelector('#ctl00_body_txtCpStartDate')?.value || '',
    contractExtensionTerminationDate: docPost.querySelector('#ctl00_body_txtCpEndDate')?.value || ''
  };

  let allContractExtractDetails = [];

  let contractExtensions = Array.from(docPost.querySelectorAll("#ctl00_body_grdsummary_ctl00 tbody tr")).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      commencementDate: cells[0]?.textContent.trim() || "",
      terminationDate: cells[1]?.textContent.trim() || ""
    };
  });

  allContractExtractDetails.push(...contractExtensions);

  let anchor = Array.from(docPost.querySelectorAll("a")).find(a => {
    const href = a.getAttribute("href") || "";
    return href.includes("__doPostBack") && href.includes("ctl00$body$grdsummary$ctl00$ctl03$ctl01");
  });

  let paginationId = anchor?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || '';
  let prevNumber = paginationId.match(/\d{2}$/)?.[0] || '';

  viewState = docPost.querySelector("#__VIEWSTATE")?.value || "";
  viewStateGenerator = docPost.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  eventValidation = docPost.querySelector("#__EVENTVALIDATION")?.value || "";
  publickey = docPost.querySelector('#ctl00_body_txtPublicKey')?.value || "";

  window.contract = {
    viewState,
    viewStateGenerator,
    eventValidation,
    publickey
  }

  while (paginationId) {
    const urlencoded = new URLSearchParams();
    urlencoded.append("scrollLeft", "");
    urlencoded.append("scrollTop", "");
    urlencoded.append("__EVENTTARGET", paginationId);
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__VIEWSTATE", viewState);
    urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", eventValidation);
    urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
    urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
    urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
    urlencoded.append("ctl00$hdnQuickmenu", "");
    urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
    urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "9");
    urlencoded.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded.append("ctl00$body$txtempNo", empNumber);
    urlencoded.append("ctl00$body$txtPublicKey", publickey);

    responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`, {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    });

    textPost = await responsePost.text();
    docPost = parser.parseFromString(textPost, "text/html");

    contractExtensions = Array.from(docPost.querySelectorAll("#ctl00_body_grdsummary_ctl00 tbody tr")).map(row => {
      const cells = row.querySelectorAll("td");
      return {
        commencementDate: cells[0]?.textContent.trim() || "",
        terminationDate: cells[1]?.textContent.trim() || ""
      };
    });

    allContractExtractDetails.push(...contractExtensions);

    anchor = Array.from(docPost.querySelectorAll("a")).find(a => {
      const href = a.getAttribute("href") || "";
      return href.includes("__doPostBack") && href.includes("ctl00$body$grdsummary$ctl00$ctl03$ctl01");
    });

    paginationId = anchor?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || '';
    const nextNumber = paginationId.match(/\d{2}$/)?.[0] || '';

    viewState = docPost.querySelector("#__VIEWSTATE")?.value || "";
    viewStateGenerator = docPost.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    eventValidation = docPost.querySelector("#__EVENTVALIDATION")?.value || "";
    publickey = docPost.querySelector('#ctl00_body_txtPublicKey')?.value || "";

    window.contract = {
      viewState,
      viewStateGenerator,
      eventValidation,
      publickey
    };

    if (nextNumber > prevNumber) {
      prevNumber = nextNumber;
    } else {
      break;
    }
  }
  return { contractExtensions: allContractExtractDetails, currentContractDetails };
});