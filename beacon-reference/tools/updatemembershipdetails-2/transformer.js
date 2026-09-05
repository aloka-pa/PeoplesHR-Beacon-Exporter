(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/MemberOfProf.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        // param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url
      }
    }
  }

  const updateUrlData = await payload("EIM/MemberOfProf.aspx");

  const editResponse = await BeaconBar.executeFunction('module')({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: args.updateId,
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: window.view.viewState,
    __VIEWSTATEGENERATOR: window.view.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: window.view.eventValidation,
    "ctl00$hdnDateFormat": "m/d/yy",
    "ctl00$hdnQuickmenu": "",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$EmpSearch$hdnEmpNumber": args.employeeNumber,
    "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
    "ctl00$body$dpcountry": "-1",
    "ctl00$body$CustomHiddenField": "",
    "ctl00$body$dpmemship": "-1",
    "ctl00$body$txtMemshipNum": "",
    "ctl00$body$dpbasis": "-1",
    "ctl00$body$dpmemtitles": "-1",
    "ctl00$body$txtStartdate": formattedDate,
    "ctl00$body$txtEndDate": formattedDate,
    "ctl00$body$nurears": "",
    "ctl00$body$dpIndCurrency": "000112",
    "ctl00$body$txtIndEffDate": formattedDate,
    "ctl00$body$nuBornAmount": "",
    "ctl00$body$dpComCurrency": "000112",
    "ctl00$body$txtComEffDate": formattedDate,
    "ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdgrade_ClientState": "",
    "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdBarginingSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
    "ctl00_body_grdBarginingSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdBarginingSummary_ClientState": "",
    "ctl00$body$txtempnumber": args.employeeNumber,
    "ctl00$body$hdnSelectedTab": "0",
    "ctl00$body$hdnHavePendingMemshipWFData": "0",
    "ctl00$body$hdnHavePendingBargainWFData": "0",
    "ctl00$body$txtPublicKey": window.view.publicKey,
    "ctl00$body$hdnEventType": "1",
    "ctl00$body$HiddenField1": ""
  }, `${reqOptions.sl}/${updateUrlData.pageUrl}`);

  const parser = new DOMParser();
  const document = parser.parseFromString(editResponse.rawData, "text/html");

  window.pk = editResponse;

  const select = document.querySelector("#ctl00_body_dpIndCurrency");

  const currencyOptions = Array.from(select.options)
    .filter(option => option.value !== "-1") // Exclude default/empty placeholder
    .map(option => ({
      value: option.value,
      label: option.textContent.trim()
    }));

  const userUpdateMebershipDetails = {
    membershipType: {
      label: document.querySelector("#ctl00_body_dpcountry")?.selectedOptions[0]?.textContent.trim() || "",
      value: document.querySelector("#ctl00_body_dpcountry")?.value || ""
    },
    noOfMemberships: document.querySelector("#ctl00_body_numonth")?.value.trim() || "",
    membership: {
      label: document.querySelector("#ctl00_body_dpmemship")?.selectedOptions[0]?.textContent.trim() || "",
      value: document.querySelector("#ctl00_body_dpmemship")?.value || ""
    },
    membershipNumber: document.querySelector("#ctl00_body_txtMemshipNum")?.value.trim() || "",
    subscriptionOwnership: {
      label: document.querySelector("#ctl00_body_dpbasis")?.selectedOptions[0]?.textContent.trim() || "",
      value: document.querySelector("#ctl00_body_dpbasis")?.value || ""
    },
    membershipTitle: {
      label: document.querySelector("#ctl00_body_dpmemtitles")?.selectedOptions[0]?.textContent.trim() || "",
      value: document.querySelector("#ctl00_body_dpmemtitles")?.value || ""
    },
    commencementDate: document.querySelector("#ctl00_body_txtStartdate")?.value.trim() || "",
    renewalDate: document.querySelector("#ctl00_body_txtEndDate")?.value.trim() || "",
    paidByIndividualCurrency: {
      label: document.querySelector("#ctl00_body_dpIndCurrency")?.selectedOptions[0]?.textContent.trim() || "",
      value: document.querySelector("#ctl00_body_dpIndCurrency")?.value || ""
    },
    paidByIndividualEffDate: document.querySelector("#ctl00_body_txtIndEffDate")?.value.trim() || "",
    paidByCompanyCurrency: {
      label: document.querySelector("#ctl00_body_dpComCurrency")?.selectedOptions[0]?.textContent.trim() || "",
      value: document.querySelector("#ctl00_body_dpComCurrency")?.value || ""
    },
    paidbyIndividualAmount: document.querySelector("#ctl00_body_nurears")?.value.trim() || "",
    paidbyCompanyAmount: document.querySelector("#ctl00_body_nuBornAmount")?.value.trim() || "",
    paidByCompanyEffDate: document.querySelector("#ctl00_body_txtComEffDate")?.value.trim() || ""
  }
  return { userUpdateMebershipDetails, currencyOptions }
})