(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/empCoveringDetails.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  // const digest = await BeaconBar.executeFunction('getDigest')("IsShowButtons=1");
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

  const updateUrlData = await payload("EIM/empCoveringDetails.aspx");
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
  // window.pqn = empNumber;

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";

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
  urlencoded.append("ctl00$footers$txtempNo", empNumber);

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const docPost = parser.parseFromString(textPost, "text/html");

  const rows = docPost.querySelectorAll("#ctl00_body_grdCovringDtl_ctl00 tbody tr");
  const allowanceDetails = Array.from(rows).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      allowances: cells[0]?.textContent.trim() || "",
      subGroupLevel: cells[1]?.textContent.trim() || "",
      effectiveFromDate: cells[2]?.textContent.trim() || "",
      effectiveToDate: cells[3]?.textContent.trim() || "",
      personalGrade: cells[4]?.textContent.trim() || "",
      remarks: cells[5]?.querySelector("textarea")?.textContent.trim() || "",
      attachments: cells[6]?.innerHTML.trim() || ""
    };
  });

  const empNum = docPost.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return allowanceDetails;
  } else {
    return "no availbel in the employee and display employee id."
  }
});
