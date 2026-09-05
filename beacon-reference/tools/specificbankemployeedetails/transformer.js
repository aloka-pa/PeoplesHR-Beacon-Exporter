(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignBankInformation.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const empEncId = await BeaconBar.executeFunction("employeeEncryptId")(window.view.publicKey, args.id);

  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        // param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url,
        // param : "IsShowButtons=1"
      }
    }
  }

  const updateUrlData = await payload("EIM/AssignBankInformation.aspx");

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: window.view.viewState,
    __VIEWSTATEGENERATOR: window.view.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.view.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$cboBank": "",
    "ctl00$body$cboAccType": "-1",
    "ctl00$body$txtAccountNo": "",
    "ctl00$body$cboCurrency": "000081",
    "ctl00$body$txtAccountEmpName": "",
    "ctl00$body$cboAmountType": "0",
    "ctl00$body$nuBnkAmount": "",
    "ctl00$body$nuOrder": "",
    "ctl00$body$chkBankActive": "on",
    "ctl00$body$txtAccStartDate": "",
    "ctl00$body$txtAccEndDate": "",
    "ctl00$body$txtBankComment": "",
    "ctl00$body$txtPublicKey": window.view.publicKey,
    "ctl00$body$txtAccount": "",
    "ctl00$body$txtempnumber": empEncId,
    "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
    "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdEmpBank_ClientState": "",
    "ctl00$body$hdnCurrentAmount": "",
    "ctl00$body$hdnAmountType": "",
    "ctl00$body$txtEmpNo": args.id
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

  window.bdv = editResponse

  const parser = new DOMParser();
  const document = parser.parseFromString(editResponse.rawData, "text/html");

  const select = document.querySelector('#ctl00_body_cboAccType');
  const options = Array.from(select.options);
  const accountOptionTypes = options.map(option => ({
    name: option.text.trim(),
    value: option.value
  }));

  const currencySelect = document.querySelector('#ctl00_body_cboCurrency');
  const currencyOptions = Array.from(currencySelect.options);
  const currencyOptionDetails = currencyOptions.map(option => ({
    name: option.text.trim(),
    value: option.value
  }));

  const getSelectedInfo = (selector) => {
    const el = document.querySelector(selector);
    return {
      name: el?.options[el.selectedIndex]?.text?.trim() || '',
      value: el?.value || ''
    };
  };

  const getInputValue = (selector) => {
    return document.querySelector(selector)?.value?.trim() || '';
  };

  const getCheckboxValue = (selector) => {
    return document.querySelector(selector)?.checked || false;
  };

  const bankInformation = {
    "Bank Name": getSelectedInfo('#ctl00_body_cboBank'),
    "Branch Name": getSelectedInfo('#ctl00_body_cboBankBranch'),
    "Account Type": getSelectedInfo('#ctl00_body_cboAccType'),
    "Account Number": getInputValue('#ctl00_body_txtAccountNo'),
    "Currency": getSelectedInfo('#ctl00_body_cboCurrency'),
    "Name Given to the Bank": getInputValue('#ctl00_body_txtAccountEmpName'),
    "Amount Type": getSelectedInfo('#ctl00_body_cboAmountType'),
    "Amount / Percentage": getInputValue('#ctl00_body_nuBnkAmount'),
    "Order": getInputValue('#ctl00_body_nuOrder'),
    "Bank Active": getCheckboxValue('#ctl00_body_chkBankActive') ? "Yes" : "No",
    "Start Date": getInputValue('#ctl00_body_txtAccStartDate'),
    "End Date": getInputValue('#ctl00_body_txtAccEndDate'),
    "Comments": getInputValue('#ctl00_body_txtBankComment')
  };

  return {
    bankInformation,
    accountOptionTypes,
    currencyOptionDetails
  };

});
