(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/empCoveringDetails.aspx")) {
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

  const updateUrlData = await payload("EIM/empCoveringDetails.aspx");

  const addResponse = await BeaconBar.executeFunction("module")(
    {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: window.emp2.viewState,
      __VIEWSTATEGENERATOR: window.emp2.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.emp2.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$EmpSearch$hdnEmpNumber": args.id,
      "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
      "ctl00$body$drpSalaryGrade": args.personalGradeValue,
      "ctl00$body$drpClassification": args.groupLevelValue,
      "ctl00$body$drpCorporateTitle": args.positionTitleValue,
      "ctl00$body$drpdsg": args.subGroupLevelValue,
      "ctl00$body$hdnDisplayMethod": "1",
      "ctl00$body$txtactfrom": args.effectFromDate,
      "ctl00$body$txtactto": args.effectToDate,
      "ctl00$body$fileAttatchment": "",
      "ctl00$body$payable": "rbpayable",
      "ctl00$body$txtCmmt": args.remarks || "",
      "ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdCovringDtl$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdCovringDtl_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdCovringDtl_ClientState": "",
      "ctl00$body$grdCovringDtl$ctl00$ctl04$Txt_comment": "",
      "ctl00$body$butSave": "Save",
      "ctl00$footers$hdnIsDateChanged": "1",
      "ctl00$footers$txtPublicKey": window.emp.publicKey1,
      "ctl00$footers$txtempNo": window.emp.empEnc
    },
    `${reqOptions.sl}/${updateUrlData.pageUrl}`
  );

  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(addResponse.rawData, "text/html");
  const validation = parsedDoc.getElementById("ctl00_body_butNew");
  if (validation?.disabled) {
    const scriptContent = parsedDoc.querySelector("script")?.textContent || "";
    const match = scriptContent.match(/HbsAlert\('(.*?)'\)/);
    const alertMessage = match ? match[1] : null;
    return alertMessage || "The specified period will overlap with an existing period. Please specify another date range.";
  } else {
    return "Successfully created — returning all created values.";
  }

})