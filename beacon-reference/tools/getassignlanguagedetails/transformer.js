(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignLanguage.aspx")) {
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

  const updateUrlData = await payload("EIM/AssignLanguage.aspx");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const getUrl = `${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`;
  const response = await fetch(getUrl, {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  });
  const detailsText = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(detailsText, "text/html");

  const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";
  const empNumber = doc.querySelector("#ctl00_body_txtEmpNumber")?.value || "";

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
  urlencoded.append("ctl00$hdnQuickmenu", "");
  urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$txtPublicKey", publicKey);
  urlencoded.append("ctl00$body$txtEmpNumber", empNumber);
  urlencoded.append("ctl00$body$grdLanuages$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdLanuages_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdLanuages$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded.append("ctl00_body_grdLanuages_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");

  const responsePost = await fetch(getUrl, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const doc123 = parser.parseFromString(textPost, "text/html");
  const first = await BeaconBar.executeFunction("getDomExtract")(textPost);
  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(first.publicKey, args.id);

  const urlencoded1 = new URLSearchParams();
  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__VIEWSTATE", first.viewState);
  urlencoded1.append("__VIEWSTATEGENERATOR", first.viewStateGenerator);
  urlencoded1.append("__VIEWSTATEENCRYPTED", "");
  urlencoded1.append("__EVENTVALIDATION", first.eventValidation);
  urlencoded1.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded1.append("ctl00$hdnQuickmenu", "");
  urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
  urlencoded1.append("ctl00$body$EmpSearch$hdnEmpNumber", args.id);
  urlencoded1.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded1.append("ctl00$body$txtPublicKey", first.publicKey);
  urlencoded1.append("ctl00$body$txtEmpNumber", empEnc);
  urlencoded1.append("ctl00$body$grdLanuages$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded1.append("ctl00_body_grdLanuages_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded1.append("ctl00$body$grdLanuages$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "2");
  urlencoded1.append("ctl00_body_grdLanuages_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded1.append("ctl00_body_grdLanuages_ClientState", "");
  urlencoded1.append("ctl00$body$butEdit", "Edit");

  const responsePost1 = await fetch(getUrl, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  });

  const textPost1 = await responsePost1.text();
  window.language = await BeaconBar.executeFunction("getDomExtract")(textPost1);
  const document = parser.parseFromString(textPost1, "text/html");

  const rows = document.querySelectorAll("tr[id^='ctl00_body_grdLanuages_ctl00__']");
  const assignLanguageDedails = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const language = cells[0]?.textContent.trim() || "";
    const reading = cells[1]?.textContent.trim() || "";
    const writing = cells[2]?.textContent.trim() || "";
    const speaking = cells[3]?.textContent.trim() || "";
    const editLinkHref = cells[4]?.querySelector("a")?.getAttribute("href") || "";

    const match = editLinkHref.match(/__doPostBack\('([^']+)'/);
    const editKey = match ? match[1] : "";

    assignLanguageDedails.push({
      language,
      reading,
      writing,
      speaking,
      editKey
    });
  });

  const languages = Array.from(document.querySelectorAll("#ctl00_body_cboLanuage option")).map(option => ({
    name: option.textContent.trim(),
    value: option.value
  }));
  const empNum = doc123.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return { assignLanguageDedails, languages }
  } else {
    return "no availbel in the employee exist and display employee id."
  }

});
