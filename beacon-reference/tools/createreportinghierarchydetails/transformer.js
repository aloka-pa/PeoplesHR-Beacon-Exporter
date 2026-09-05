(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Reportsto.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const viewSt = window.rh.viewState;
  const viewstGen = window.rh.viewStateGen;
  const event = window.rh.eventValidation;
  const publicKey = window.rh.publicKey;

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

  const updateUrlData = await payload("EIM/Reportsto.aspx?IsShowButtons=1");

  const digest = await BeaconBar.executeFunction("getDigest")("IsShowButtons=1");
  const isDirect = args.type === "Direct Subordinates";
  const eventTarget = isDirect ? "GetSearchResultMultipleDirect" : "GetSearchResultMultipleIndirect";

  const employeeResponse = await BeaconBar.executeFunction('module')({
    "scrollLeft": "0",
    "scrollTop": "0",
    "__EVENTTARGET": eventTarget,
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": viewSt,
    "__VIEWSTATEGENERATOR": viewstGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": event,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$txtPublicKey": publicKey,
    "ctl00$body$txtempnumber": window.empnum,
    "ctl00$body$hdnEmployeeNo": args.id,
    "ctl00$body$HFCurrTabIndex": isDirect ? "" : "1",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    ...Object.fromEntries(window.checkboxNames.map(name => [name, "on"])),
    "ctl00_body_grdDirectSubordinates_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdInDirectSubordinates_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_GrdempSup_ClientState": ""
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);

  const empEnc = await BeaconBar.executeFunction("employeeEncryptId")(employeeResponse.publicKey, args.id);

  const parser = new DOMParser();
  const doccument = parser.parseFromString(employeeResponse.rawData, 'text/html');

  const directSelector = 'input[type="checkbox"][name^="ctl00$body$grdDirectSubordinates"]';
  const indirectSelector = 'input[type="checkbox"][name^="ctl00$body$grdInDirectSubordinates"]';

  const directCheckboxes = Array.from(doccument.querySelectorAll(directSelector));
  const indirectCheckboxes = Array.from(doccument.querySelectorAll(indirectSelector));

  const checkboxNames = [
    ...directCheckboxes.map(cb => cb.getAttribute('name')),
    ...indirectCheckboxes.map(cb => cb.getAttribute('name'))
  ];

  const saveResponse = await BeaconBar.executeFunction('module')({
    "scrollLeft": "0",
    "scrollTop": "0",
    "__EVENTTARGET": eventTarget,
    "__EVENTARGUMENT": "",
    "__VIEWSTATE": employeeResponse.viewState,
    "__VIEWSTATEGENERATOR": employeeResponse.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": employeeResponse.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$txtPublicKey": publicKey,
    "ctl00$body$txtempnumber": empEnc,
    "ctl00$body$hdnEmployeeNo": args.id,
    "ctl00$body$HFCurrTabIndex": isDirect ? "" : "1",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": isDirect ? "6" : "2",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    ...Object.fromEntries(checkboxNames.map(name => [name, "on"])),
    "ctl00_body_grdDirectSubordinates_ClientState": "",
    [isDirect ? "ctl00$body$cmddireSave" : "ctl00$body$cmdIndireSave"]: "Save",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": isDirect ? "5" : "3",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdInDirectSubordinates_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$ChangePageSizeTextBox": isDirect ? "1" : "10",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_GrdempSup_ClientState": ""
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);

  return "employees are added successfully for the selected employess.";
});
