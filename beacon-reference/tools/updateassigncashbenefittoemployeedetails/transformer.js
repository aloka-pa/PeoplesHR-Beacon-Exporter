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



  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", args.editId);
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", window.assign.viewState3);
  urlencoded1.append("__VIEWSTATEGENERATOR", window.assign.viewStateGen3);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", window.assign.eventValidation3);
  urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded1.append("ctl00$hdnQuickmenu", "");
  urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded1.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded1.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded1.append("ctl00$body$txtPublicKey", window.assign.publicKey);
  urlencoded1.append("ctl00$body$txtempnumber", window.assign.empEnc)

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  });

  const details = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(details, "text/html");

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGen = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

  const input = args.editId;
  const match = input.match(/\$ctl(\d{2})\$/);
  const ctlKey = match ? `ctl${match[1]}` : null;

  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", args.editId);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", eventValidation);
  urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded2.append("ctl00$hdnQuickmenu", "1");
  urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded2.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded2.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded2.append(`ctl00$body$grdallocated$${ctlKey}$dtpEntitleDate$txtDate`, args.updateDate || "");
  urlencoded2.append(`ctl00$body$grdallocated$${ctlKey}$dtpEntitleDate$hdnDateFormat`, "dd/mm/yy");
  urlencoded2.append(`ctl00$body$grdallocated$${ctlKey}$nuamount`, args.updateAmount || "");
  urlencoded2.append("ctl00$body$txtPublicKey", window.assign.publicKey);
  urlencoded2.append("ctl00$body$txtempnumber", window.assign.empEnc)

  const resposne1 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  });

  const details1 = await resposne1.text();
  const doc1 = parser.parseFromString(details1, "text/html");

  const viewState1 = doc1.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGen1 = doc1.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = doc1.querySelector("#__EVENTVALIDATION")?.value || "";

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: new URLSearchParams({
      "scrollLeft": "0",
      "scrollTop": "0",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__VIEWSTATE": viewState1,
      "__VIEWSTATEGENERATOR": viewStateGen1,
      "__VIEWSTATEENCRYPTED": "",
      "__EVENTVALIDATION": eventValidation1,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$hdnQuickmenu": "1",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$butSave": "Save",
      "ctl00$body$txtPublicKey": window.assign.publicKey,
      "ctl00$body$txtempnumber": window.assign.empEnc
    }),
    redirect: "follow"
  });

  const details2 = await response2.text();
  const doc3 = parser.parseFromString(details2, "text/html");

  const deallocatedBenefits = Array.from(doc3.querySelectorAll("#ctl00_body_grdavailable tr:not(:first-child)")).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      benefitName: cells[0]?.textContent.trim() || "",
      amount: cells[1]?.textContent.trim() || ""
    };
  });

  const assignedBenefits = Array.from(doc3.querySelectorAll("#ctl00_body_grdallocated tr:not(.header)")).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      benefitName: cells[0]?.textContent.trim() || "",
      effectiveDate: cells[1]?.textContent.trim() || "",
      amount: cells[2]?.textContent.trim() || ""
    };
  });

  return { deallocatedBenefits, assignedBenefits };
})
