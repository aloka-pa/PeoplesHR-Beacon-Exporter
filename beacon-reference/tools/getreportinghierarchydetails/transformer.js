(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Reportsto.aspx?IsShowButtons=1")) {
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

  const updateUrlData = await payload("EIM/Reportsto.aspx?IsShowButtons=1");

  const digest = await BeaconBar.executeFunction('getDigest')(updateUrlData.param);
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`, requestOptions);
  const responseData = await response.text();

  const parser = new DOMParser();
  const doccument = parser.parseFromString(responseData, 'text/html');

  const directSelector = 'input[type="checkbox"][name^="ctl00$body$grdDirectSubordinates"]';
  const indirectSelector = 'input[type="checkbox"][name^="ctl00$body$grdInDirectSubordinates"]';

  const directCheckboxes = Array.from(doccument.querySelectorAll(directSelector));
  const indirectCheckboxes = Array.from(doccument.querySelectorAll(indirectSelector));

  const checkboxNames = [
    ...directCheckboxes.map(cb => cb.getAttribute('name')),
    ...indirectCheckboxes.map(cb => cb.getAttribute('name'))
  ];

  const empNumber = doccument.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";

  window.empnum = empNumber;

  const viewState = doccument.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doccument.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doccument.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  await BeaconBar.executeFunction("censusInformation")(args.id);

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "GetSearchResult",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$txtempnumber": empNumber,
    "ctl00$body$hdnEmployeeNo": args.id,
    "ctl00$body$HFCurrTabIndex": "0",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
    "ctl00_body_grdDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    ...Object.fromEntries(checkboxNames.map(name => [name, "on"])),
    "ctl00_body_grdDirectSubordinates_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdInDirectSubordinates$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdInDirectSubordinates_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdInDirectSubordinates_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$GrdempSup$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_GrdempSup_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_GrdempSup_ClientState": ""
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}&digest=${digest.digest}`);

  const doc = parser.parseFromString(editResponse.rawData, 'text/html');

  const directCheckboxes1 = Array.from(doc.querySelectorAll(directSelector));
  const indirectCheckboxes1 = Array.from(doc.querySelectorAll(indirectSelector));

  const checkboxNames1 = [
    ...directCheckboxes1.map(cb => cb.getAttribute('name')),
    ...indirectCheckboxes1.map(cb => cb.getAttribute('name'))
  ];

  window.checkboxNames = checkboxNames1;
  window.rh = editResponse;

  const directSubordinates = [];
  const indirectSubordinates = [];
  const indirectDirectsupervisors = [];

  doc.querySelectorAll('[id^="ctl00_body_grdDirectSubordinates_ctl00__"]').forEach(row => {
    const cells = row.querySelectorAll('td');
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (cells.length >= 2) {
      directSubordinates.push({
        empId: cells[0].textContent.trim(),
        name: cells[1].textContent.trim(),
        checked: checkbox ? checkbox.checked : null
      });
    }
  });

  doc.querySelectorAll('[id^="ctl00_body_grdInDirectSubordinates_ctl00__"]').forEach(row => {
    const cells = row.querySelectorAll('td');
    const checkbox = row.querySelector('input[type="checkbox"]');
    if (cells.length >= 2) {
      indirectSubordinates.push({
        empId: cells[0].textContent.trim(),
        name: cells[1].textContent.trim(),
        checked: checkbox ? checkbox.checked : null
      });
    }
  });

  doc.querySelectorAll('[id^="ctl00_body_GrdempSup_ctl00__"]').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      indirectDirectsupervisors.push({
        empId: cells[0].textContent.trim(),
        name: cells[1].textContent.trim()
      });
    }
  });

  const empNum = doc.querySelector("#ctl00_body_EmpSearch_txtEmpDisplayNumber").value || "";
  if (empNum === args.id) {
    return {
      directSubordinates,
      indirectSubordinates,
      indirectDirectsupervisors
    };
  } else {
    return "no availbel in the employee and display employee id."
  }
});
