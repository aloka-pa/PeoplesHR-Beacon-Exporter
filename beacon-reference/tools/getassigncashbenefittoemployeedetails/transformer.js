(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCashBenifitEmployeeNew.aspx")) {
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

  const updateUrlData = await payload("EIM/AssignCashBenifitEmployeeNew.aspx");
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

  const viewState1 = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGen1 = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "");
  urlencoded1.append("scrollTop", "");
  urlencoded1.append("__EVENTTARGET", "GetSearchResult");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", viewState1);
  urlencoded1.append("__VIEWSTATEGENERATOR", viewStateGen1);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", eventValidation1);
  urlencoded1.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded1.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded1.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded1.append("ctl00$body$txtempnumber", empNumber);

  const responsePost1 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  });

  const textPost1 = await responsePost1.text();
  const docPost1 = parser.parseFromString(textPost1, "text/html");
  const empNum12 = docPost1.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";

  const viewState2 = docPost1.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGen2 = docPost1.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation2 = docPost1.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey = docPost1.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(publicKey, args.id);

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState2);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen2);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation2);
  urlencoded2.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded2.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded2.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded2.append("ctl00$body$butEdit", "Edit");
  urlencoded2.append("ctl00$body$txtPublicKey", publicKey);
  urlencoded2.append("ctl00$body$txtempnumber", empEnc)

  const finalResponse = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  });

  const finalText = await finalResponse.text();
  const docPost = parser.parseFromString(finalText, "text/html");

  window.assign = {
    viewState3: docPost.querySelector("#__VIEWSTATE")?.value || "",
    viewStateGen3: docPost.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
    eventValidation3: docPost.querySelector("#__EVENTVALIDATION")?.value || "",
    publicKey: docPost.querySelector("#ctl00_body_txtPublicKey")?.value || "",
    empEnc: empEnc,
  }

  const deallocatedBenefits = Array.from(docPost.querySelectorAll("#ctl00_body_grdavailable tr:not(:first-child)")).map(row => {
    const cells = row.querySelectorAll("td");
    const allocateHref = cells[2]?.querySelector("a")?.getAttribute("href") || "";
    const allocateIdMatch = allocateHref.match(/__doPostBack\('([^']+)'/);
    return {
      benefitName: cells[0]?.textContent.trim() || "",
      amount: cells[1]?.textContent.trim() || "",
      allocateId: allocateIdMatch ? allocateIdMatch[1] : null
    };
  });

  const assignedBenefits = Array.from(docPost.querySelectorAll("#ctl00_body_grdallocated tr:not(.header)")).map(row => {
    const cells = row.querySelectorAll("td");
    const editHref = cells[3]?.querySelector("a")?.getAttribute("href") || "";
    const editIdMatch = editHref.match(/__doPostBack\('([^']+)'/);
    return {
      benefitName: cells[0]?.textContent.trim() || "",
      effectiveDate: cells[1]?.textContent.trim() || "",
      amount: cells[2]?.textContent.trim() || "",
      editId: editIdMatch ? editIdMatch[1] : null
    };
  });
  if (empNum12 === args.id) {
    return { deallocatedBenefits, assignedBenefits };
  } else {
    return "no employee is exist to return the employee is not exist."
  }

});
