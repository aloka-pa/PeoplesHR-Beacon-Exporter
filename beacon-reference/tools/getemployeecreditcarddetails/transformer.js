(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCreditCard.aspx")) {
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

  const updateUrlData = await payload("EIM/AssignCreditCard.aspx");

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

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "");
  urlencoded.append("scrollTop", "");
  urlencoded.append("__EVENTTARGET", "GetSearchResult");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", viewStateGenerator);
  urlencoded.append("__SCROLLPOSITIONX", "0");
  urlencoded.append("__SCROLLPOSITIONY", "0");
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
  urlencoded.append("ctl00$body$EmpSearch$hdnEmpNumber", empNumber);
  urlencoded.append("ctl00$body$EmpSearch$hdnActiveInactiveToolbar", "");
  urlencoded.append("ctl00$body$grdCC$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  urlencoded.append("ctl00_body_grdCC_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  urlencoded.append("ctl00$body$grdCC$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
  urlencoded.append("ctl00_body_grdCC_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  urlencoded.append("ctl00_body_grdCC_ClientState", "");
  urlencoded.append("ctl00$body$txtCCard", "");
  urlencoded.append("ctl00$body$txtempnumber", empNumber);

  const responsePost = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}`, {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  });

  const textPost = await responsePost.text();
  const docPost = parser.parseFromString(textPost, "text/html");

  const viewState1 = docPost.querySelector("#__VIEWSTATE")?.value || "";
  const viewStateGenerator1 = docPost.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const eventValidation1 = docPost.querySelector("#__EVENTVALIDATION")?.value || "";
  const publicKey = docPost.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(publicKey, args.id);

  const edit = await BeaconBar.executeFunction("module")(
    {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: viewState1,
      __VIEWSTATEGENERATOR: viewStateGenerator1,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: eventValidation1,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$grdCC$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdCC_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdCC$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
      "ctl00_body_grdCC_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdCC_ClientState": "",
      "ctl00$body$cmdEdit": "Edit",
      "ctl00$body$txtPublicKey": publicKey,
      "ctl00$body$txtCCard": "",
      "ctl00$body$txtempnumber": empEnc
    },
    `${reqOptions.sl}/${updateUrlData.pageUrl}`
  );
  window.ccd = edit
  const docPost1 = parser.parseFromString(edit.rawData, "text/html");

  const creditCardDetails = Array.from(
    docPost1.querySelectorAll(".GridRow_Default, .GridAltRow_Default")
  ).map(row => {
    const cells = row.querySelectorAll("td");
    const rawHref = cells[3]?.querySelector("a")?.getAttribute("href") || "";
    const textarea = document.createElement("textarea");
    textarea.innerHTML = rawHref;
    const decodedHref = textarea.value;
    const match = decodedHref.match(/__doPostBack\('([^']+)'/);
    const editId = match ? match[1] : "";

    return {
      bankName: cells[0]?.textContent.trim() || "",
      cardNumber: cells[1]?.textContent.trim() || "",
      cardType: cells[2]?.textContent.trim() || "",
      editId: editId
    };
  });
  return creditCardDetails;
});
