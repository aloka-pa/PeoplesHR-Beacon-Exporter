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
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const updateKey = args.editId.replace("EditButton", "UpdateButton");
  const key = args.editId.replace("EditButton", "txtEmpText");


  const urlencoded2 = new URLSearchParams();
  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", args.editId);
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__VIEWSTATE", window.jbs.viewState);
  urlencoded2.append("__VIEWSTATEGENERATOR", window.jbs.viewStateGenerator);
  urlencoded2.append("__VIEWSTATEENCRYPTED", "");
  urlencoded2.append("__EVENTVALIDATION", window.jbs.eventValidation);
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
  urlencoded2.append("ctl00$body$hdnJobCode", window.jbs.jobcode3);

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, requestOptions2);
  const text2 = await response2.text();
  const parser = new DOMParser();
  const doc2 = parser.parseFromString(text2, "text/html");

  const viewState1 = doc2.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator1 = doc2.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = doc2.querySelector("#__EVENTVALIDATION")?.value || "";

  const jobCode = doc2.querySelector("#ctl00_body_hdnJobCode")?.value || "";

  const urlencoded3 = new URLSearchParams();
  urlencoded3.append("scrollLeft", "0");
  urlencoded3.append("scrollTop", "0");
  urlencoded3.append("__EVENTTARGET", updateKey);
  urlencoded3.append("__EVENTARGUMENT", "");
  urlencoded3.append("__VIEWSTATE", viewState1);
  urlencoded3.append("__VIEWSTATEGENERATOR", viewStateGenerator1);
  urlencoded3.append("__VIEWSTATEENCRYPTED", "");
  urlencoded3.append("__EVENTVALIDATION", eventValidation1);
  urlencoded3.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded3.append("ctl00$hdnQuickmenu", "");
  urlencoded3.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded3.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded3.append("ctl00$body$grdEmpJobData$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded3.append("ctl00_body_grdEmpJobData_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded3.append("ctl00$body$grdEmpJobData$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "9");
  urlencoded3.append("ctl00_body_grdEmpJobData_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded3.append(key, args.updateComment);
  urlencoded3.append("ctl00_body_grdEmpJobData_ClientState", "");
  urlencoded3.append("ctl00$body$hdnJobCode", jobCode);

  const requestOptions3 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded3,
    redirect: "follow"
  };

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, requestOptions3);
  const text3 = await response3.text();
  const doc3 = parser.parseFromString(text3, "text/html");

  const rows = doc3.querySelectorAll("#ctl00_body_grdEmpJobData_ctl00 tbody tr");
  const updateDetails = Array.from(rows).map(row => {
    const name = row.querySelector("td:nth-child(1)")?.textContent.trim() || "";
    const comment = row.querySelector("span[id^='ctl00_body_grdEmpJobData_']")?.textContent.trim() || "";

    return { name, comment };
  });

  return updateDetails;
});
