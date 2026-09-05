(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCreditCard.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(window.ccd.publicKey, args.id);

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: window.ccd.viewState,
    __VIEWSTATEGENERATOR: window.ccd.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.ccd.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$cboBank": "",
    "ctl00$body$txtCCNo": "",
    "ctl00$body$rbCCType": "1",
    "ctl00$body$txtIssueDate": "",
    "ctl00$body$txtExpDate": "",
    "ctl00$body$grdCC$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdCC_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdCC$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
    "ctl00_body_grdCC_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdCC_ClientState": "",
    "ctl00$body$txtPublicKey": window.ccd.publicKey,
    "ctl00$body$txtCCard": "",
    "ctl00$body$txtempnumber": empEncId
  }, `${reqOptions.sl}/EIM/AssignCreditCard.aspx`);

  window.ccdv = editResponse;

  const parser = new DOMParser();
  const document = parser.parseFromString(editResponse.rawData, "text/html");

  const creditCardTypes = Array.from(
    document.querySelectorAll('#ctl00_body_rbCCType input[type="radio"]')
  ).map(radio => {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    return {
      name: label?.textContent.trim() || "",
      value: radio.value
    };
  });

  const creditCardDetails = {};

  const bankSelect = document.querySelector("#ctl00_body_cboBank");
  const selectedBankOption = bankSelect?.selectedOptions[0];
  creditCardDetails["Bank Name"] = {
    name: selectedBankOption?.textContent.trim() || "",
    value: selectedBankOption?.value || ""
  };

  const ccNumber = document.querySelector("#ctl00_body_txtCCNo")?.value || "";
  creditCardDetails["Credit Card Number"] = ccNumber.trim();

  const selectedCardType = document.querySelector('input[name="ctl00$body$rbCCType"]:checked');
  const selectedCardTypeLabel = document.querySelector(`label[for="${selectedCardType?.id}"]`);
  creditCardDetails["Credit Card Type"] = {
    name: selectedCardTypeLabel?.textContent.trim() || "",
    value: selectedCardType?.value || ""
  };

  const issueDate = document.querySelector("#ctl00_body_txtIssueDate")?.value || "";
  creditCardDetails["Issued Date"] = issueDate.trim();

  const expiryDate = document.querySelector("#ctl00_body_txtExpDate")?.value || "";
  creditCardDetails["Expiry Date"] = expiryDate.trim();

  return {
    creditCardDetails,
    creditCardTypes
  };
});
