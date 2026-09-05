(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/AssignNonCashBenifitEmployee.aspx")) {
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
        param : "IsShowButtons=1"
      }
    }
  }

  const updateUrlData = await payload("EIM/AssignNonCashBenifitEmployee.aspx");

  const editResponse = await BeaconBar.executeFunction("module")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.editId,
    __EVENTARGUMENT: "",
    __VIEWSTATE: window.assigned.viewState3,
    __VIEWSTATEGENERATOR: window.assigned.viewStateGen3,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.assigned.eventValidation3,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00_body_grdavailable_ClientState": "",
    "ctl00$body$hdnDateFormate": "m/d/yyyy",
    "ctl00$body$txtPublicKey": window.assigned.publicKey3,
    "ctl00$body$txtempnumber": window.assigned.empEnc
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

  window.ancb = editResponse;

  const parser = new DOMParser();
  const document = parser.parseFromString(editResponse.rawData, "text/html");

  const getValue = (selector) =>
    document.querySelector(selector)?.value.trim() || "";

  const isChecked = (selector) =>
    document.querySelector(selector)?.checked || false;

  const getSelectedOption = (selector) => {
    const select = document.querySelector(selector);
    const selected = select?.options[select.selectedIndex];
    return {
      value: selected?.value || "",
      name: selected?.textContent.trim() || ""
    };
  };

  const selectElement = document.getElementById("ctl00_body_cboBenHead");

  const benefitClearanceHeadPositionNames = Array.from(selectElement.options).map(option => ({
    name: option.text,
    value: option.value
  }));

  const assignedNonCashBenefit = {
    "Date of Issue": getValue("#ctl00_body_txtIssDate"),
    "Quantity": getValue("#ctl00_body_nuQuantity"),
    "Item Returnable": isChecked("#ctl00_body_chkretBle"),
    "Returnable Date": getValue("#ctl00_body_txtRepDate"),
    "Item Returned": isChecked("#ctl00_body_chkret"),
    "Returned Date": getValue("#ctl00_body_txtReturnedDate"),
    "Serial Number": getValue("#ctl00_body_txtSerialNo"),
    "Model": getValue("#ctl00_body_txtModel"),
    "Condition": getValue("#ctl00_body_txtCondition"),
    "Remarks": getValue("#ctl00_body_txtRemarks"),
    "Benefit Clearance Head Position Name": getSelectedOption("#ctl00_body_cboBenHead")
  };
  return { assignedNonCashBenefit, benefitClearanceHeadPositionNames };
});
