(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignPassport.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(window.pad.publicKey, args.id);

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

  const updateUrlData = await payload("EIM/AssignPassport.aspx");

  const editResponse = await BeaconBar.executeFunction("module")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: window.pad.viewState,
    __VIEWSTATEGENERATOR: window.pad.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.pad.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$DropDownListIdentity": "-1",
    "ctl00$body$txtpassNo": "",
    "ctl00$body$txtpasstype": "",
    "ctl00$body$cboPassCountry": "-1",
    "ctl00$body$nuNoOfEnt": "",
    "ctl00$body$txtpassIssuePl": "",
    "ctl00$body$txtpassIssuedate": "",
    "ctl00$body$txtpassExpDate": "",
    "ctl00$body$txtPaComments": "",
    "ctl00$body$grdPassport$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdPassport_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdPassport$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
    "ctl00_body_grdPassport_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdPassport_ClientState": "",
    "ctl00$body$txtPublicKey": window.pad.publicKey,
    "ctl00$body$txtpassport": "",
    "ctl00$body$txtempnumber": empEncId
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

  window.padv = editResponse;

  const parser = new DOMParser();
  const document = parser.parseFromString(editResponse.rawData, "text/html");

  const getValue = (selector) =>
    document.querySelector(selector)?.value.trim() || "";

  const getSelectedData = (selector) => {
    const select = document.querySelector(selector);
    const selectedOption = select?.options[select.selectedIndex];
    return {
      name: selectedOption?.textContent.trim() || "",
      value: selectedOption?.value || ""
    };
  };

  const passportAndOtherArticles = {
    "Article Category": getSelectedData("#ctl00_body_DropDownListIdentity"),
    "Document No": getValue("#ctl00_body_txtpassNo"),
    "Article Subcategory": getValue("#ctl00_body_txtpasstype"),
    "Country of Origin": getSelectedData("#ctl00_body_cboPassCountry"),
    "No of Entries": getValue("#ctl00_body_nuNoOfEnt"),
    "Place of Issue": getValue("#ctl00_body_txtpassIssuePl"),
    "Date of Issue": getValue("#ctl00_body_txtpassIssuedate"),
    "Date of Expiry": getValue("#ctl00_body_txtpassExpDate"),
    "Comments": getValue("#ctl00_body_txtPaComments")
  };
  return passportAndOtherArticles;
});
