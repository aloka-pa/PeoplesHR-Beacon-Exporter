(async function (data, args, reqOptions) {
  if (args.entity === "location") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Location.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const formdata = new FormData();
    formdata.append("scrollLeft", "0");
    formdata.append("scrollTop", "0");
    formdata.append("__EVENTTARGET", "");
    formdata.append("__EVENTARGUMENT", "");
    formdata.append("__LASTFOCUS", "");
    formdata.append("__VIEWSTATE", window.viewState.viewState);
    formdata.append("__VIEWSTATEGENERATOR", window.viewState.viewStateGen);
    formdata.append("__VIEWSTATEENCRYPTED", "");
    formdata.append("__EVENTVALIDATION", window.viewState.eventValidation);
    formdata.append("ctl00$hdnDateFormat", "dd/mm/yy");
    formdata.append("ctl00$body$hdnIsHead", "");
    formdata.append("ctl00$body$hdnEditItemIndex", "");
    formdata.append("ctl00_body_RadWindowManager1_ClientState", "");
    formdata.append("ctl00$body$txtName", args.location["ctl00_body_txtName"] || "");
    formdata.append("ctl00$body$txtAbbreviation", args.location["ctl00_body_txtAbbreviation"] || "");
    formdata.append("ctl00$body$txttp", args.location["ctl00_body_txttp"] || "");
    formdata.append("ctl00$body$txtFax", args.location["ctl00_body_txtFax"] || "");
    formdata.append("ctl00$body$txtemail", args.location["ctl00_body_txtemail"] || "");
    formdata.append("ctl00$body$txturl", args.location["ctl00_body_txturl"] || "");
    formdata.append("ctl00$body$txtaddress", args.location["ctl00_body_txtaddress"] || "");
    formdata.append("ctl00$body$ddlCountry", args.location["ctl00_body_ddlCountry"] || "");
    formdata.append("ctl00$body$ddlProvince", args.location["ctl00_body_ddlProvince"] || "");
    formdata.append("ctl00$body$ddlDistrict", args.location["ctl00_body_ddlDistrict"] || "");
    formdata.append("ctl00$body$cboTimeZone", args.location["ctl00_body_cboTimeZone"] || "");
    formdata.append("ctl00$body$txtHeadName", args.location["ctl00_body_txtHeadName"] || "");
    formdata.append("ctl00$body$txtHTitle", args.location["ctl00_body_txtHTitle"] || "");
    formdata.append("ctl00$body$txtAdminName", args.location["ctl00_body_txtAdminName"] || "");
    formdata.append("ctl00$body$filMyFile", "file");
    formdata.append("ctl00$body$butSave", "Save");
    formdata.append("ctl00$body$hdnDefCountry", "-1");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow"
    };

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Location.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
    } else {
      url = `${location.origin}/${reqOptions.sl}/EIM/Location.aspx`
    }

    const response = await fetch(url, requestOptions);
    const html = await response.text();
    return "Created Successfully!";
  }
  if (args.entity === "costCenter") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Coscentre.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Coscentre.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    } else {
      url = `EIM/Coscentre.aspx`
      details = await BeaconBar.executeFunction("getApiList")("Coscentre");
    }

    // const details = await BeaconBar.executeFunction("getApiList")("Coscentre");

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", details.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "CENTRE_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded1.append("ctl00$body$butNew", "New");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const fetchEditResponse = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html = await fetchEditResponse.text();
    const parser = new DOMParser();
    const documentEdit = parser.parseFromString(html, 'text/html');

    const viewState = documentEdit.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = documentEdit.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = documentEdit.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", "");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$txtName", args.costCenter["costCentreName"] || "");
    urlencoded2.append("ctl00$body$txtbriefDesc", args.costCenter["description"] || "");
    urlencoded2.append("ctl00$body$butSave", "Save");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const saveResponse = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    await saveResponse.text();
    return "Create Successfully!";
  }
  if (args.entity === "subLocation") {
    if (!BeaconBar.user.metaData.menus.includes("eim/SubLocation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/SubLocation.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
    } else {
      url = `${location.origin}/${reqOptions.sl}/eim/SubLocation.aspx`
    }

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", "");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", window.sls.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", window.sls.viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", window.sls.eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$hdnIsHead", "");
    urlencoded2.append("ctl00$body$hdnEditItemIndex", "");
    urlencoded2.append("ctl00$body$txtName", args.subLocation["ctl00_body_txtName"]);
    urlencoded2.append("ctl00$body$ddlLocation", args.subLocation["ctl00_body_ddlLocation"]);
    urlencoded2.append("ctl00$body$txtHeadName", args.subLocation["ctl00_body_txtHeadName"] || "");
    urlencoded2.append("ctl00$body$CmdSave", "Save");
    urlencoded2.append("ctl00$body$hdnDefCountry", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(url, requestOptions2);
    const result = await response2.text();

    return "Successfully created!";
  }
  if (args.entity === "salaryGrade") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/SalaryGradeInfo.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded1 = new URLSearchParams();
    // urlencoded1.append("ctl00_body_RadScriptManager_HiddenField", ";;HBS:en-GB:1bf6bb2e-a9e3-48c2-8258-789b8d94ae17:64806b3a");
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "ctl00$body$cboCurrType");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__LASTFOCUS", "");
    urlencoded1.append("__VIEWSTATE", window.sg.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", window.sg.viewStateGen);
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", window.sg.eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00$hdnQuickmenu", "");
    urlencoded1.append("ctl00$body$txtsalname", args.salaryGrade["ctl00_body_txtsalname"]);
    urlencoded1.append("ctl00$body$cboCurrType", args.salaryGrade["ctl00_body_cboCurrType"]);
    urlencoded1.append("ctl00$body$optsalary", "0");
    urlencoded1.append("ctl00$body$txtMin", "0");
    urlencoded1.append("ctl00$body$txtMid", "0");
    urlencoded1.append("ctl00$body$txtMax", "0");
    urlencoded1.append("ctl00$body$hdnDecimalFormat", "2");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/SalaryGradeInfo.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
    } else {
      url = `${location.origin}/${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`
    }

    const response1 = await fetch(url, requestOptions1);
    const html1 = await response1.text();
    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", "");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__LASTFOCUS", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$hdnQuickmenu", "");
    urlencoded2.append("ctl00$body$txtsalname", args.salaryGrade["ctl00_body_txtsalname"]);
    urlencoded2.append("ctl00$body$cboCurrType", args.salaryGrade["ctl00_body_cboCurrType"]);
    urlencoded2.append("ctl00$body$optsalary", "0");
    urlencoded2.append("ctl00$body$txtMin", args.salaryGrade["ctl00_body_txtMin"]);
    urlencoded2.append("ctl00$body$txtMid", args.salaryGrade["ctl00_body_txtMid"]);
    urlencoded2.append("ctl00$body$txtMax", args.salaryGrade["ctl00_body_txtMax"]);
    urlencoded2.append("ctl00$body$butSave", "Save");
    urlencoded2.append("ctl00$body$hdnDecimalFormat", "2");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(url, requestOptions2);
    const html2 = await response2.text();

    return "create successfully!";
  }
  if (args.entity === "corporateTitle") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/CorporeteTitle.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const urlencoded = new URLSearchParams();
    urlencoded.append("scrollLeft", "0");
    urlencoded.append("scrollTop", "0");
    urlencoded.append("__EVENTTARGET", "");
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__VIEWSTATE", window.cp.viewState);
    urlencoded.append("__VIEWSTATEGENERATOR", window.cp.viewStateGen);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", window.cp.eventValidation);
    urlencoded.append("ctl00$hdnDateFormat", "m/d/yy");
    urlencoded.append("ctl00$hdnQuickmenu", "");
    urlencoded.append("ctl00$body$txtName", args.corporateTitle["ctl00_body_txtName"]);
    urlencoded.append("ctl00$body$dpSalary", args.corporateTitle["ctl00_body_dpSalary"]);

    if (args.corporateTitle["ctl00_body_chkTop"] === "on") {
      urlencoded.append("ctl00$body$chkTop", "on");
    } else {
      urlencoded.append("ctl00$body$dpNextUpgrade", args.corporateTitle["ctl00_body_dpNextUpgrade"] || "-1");
    }

    urlencoded.append("ctl00$body$nuLevel", args.corporateTitle["ctl00_body_nuLevel"]?.toString() || "");
    urlencoded.append("ctl00$body$butSave", "Save");

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CorporeteTitle.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
    } else {
      url = `${location.origin}/${reqOptions.sl}/EIM/CorporeteTitle.aspx`
    }

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const response = await fetch(url, requestOptions);
    const html = await response.text();

    return "Created successfully!!";
  }
  if (args.entity === "designation") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Designation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded = new URLSearchParams();
    // urlencoded.append("ctl00_body_RadScriptManager_HiddenField", ";;HBS:en-GB:1bf6bb2e-a9e3-48c2-8258-789b8d94ae17:64806b3a");
    urlencoded.append("scrollLeft", "0");
    urlencoded.append("scrollTop", "0");
    urlencoded.append("__EVENTTARGET", "");
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__LASTFOCUS", "");
    urlencoded.append("__VIEWSTATE", window.cd.viewState)
    urlencoded.append("__VIEWSTATEGENERATOR", window.cd.viewStateGen);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", window.cd.eventValidation);
    urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded.append("ctl00$body$txtName", args.designation["ctl00_body_txtName"]);
    urlencoded.append("ctl00$body$chksenior", args.designation["ctl00_body_chksenior"]);
    urlencoded.append("ctl00$body$dpSalary", args.designation["ctl00_body_dpSalary"]);
    urlencoded.append("ctl00$body$dpNextUpgrade", args.designation["ctl00_body_dpNextUpgrade"] || "-1");
    urlencoded.append("ctl00$body$dpnextupgradedsg", args.designation["ctl00_body_dpnextupgradedsg"] || "-1");
    urlencoded.append("ctl00$body$cbofunctionRole", args.designation["ctl00_body_cbofunctionRole"] || "-1");
    urlencoded.append("ctl00$body$butSave", "Save");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Designation.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
    } else {
      url = `${location.origin}/${reqOptions.sl}/EIM/Designation.aspx`
    }

    const response = await fetch(url, requestOptions);
    const html = await response.text();

    return "create sucessfully!!";

  }
  if (args.entity === "jobDescriptionCategory") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/JdCategory.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdCategory.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    } else {
      url = `EIM/JdCategory.aspx`
      details = await BeaconBar.executeFunction("getApiList")("Coscentre");
    }

    // const details = await BeaconBar.executeFunction("getApiList")("JdCategory");

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", details.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    urlencoded1.append("__SCROLLPOSITIONX", "0");
    urlencoded1.append("__SCROLLPOSITIONY", "0");
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "JDCAT_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "7");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded1.append("ctl00$body$butNew", "New");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html1, 'text/html');

    const viewState = doc.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", "");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__SCROLLPOSITIONX", "0");
    urlencoded2.append("__SCROLLPOSITIONY", "0");
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$txtName", args.jobDescriptionCategory["jobDescriptionCategoryName"]);
    urlencoded2.append("ctl00$body$butSave", "Save");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    return "Create Successfully!!";
  }
  if (args.entity === "jobDescriptionType") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/JdType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded = new URLSearchParams();
    urlencoded.append("scrollLeft", "0");
    urlencoded.append("scrollTop", "0");
    urlencoded.append("__EVENTTARGET", "");
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__VIEWSTATE", window.ca.viewState);
    urlencoded.append("__VIEWSTATEGENERATOR", window.ca.viewStateGen);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", window.ca.eventValidation);
    urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded.append("ctl00$body$txtName", args.jobDescriptionType["jobDescriptionTypeName"]);
    urlencoded.append("ctl00$body$dpSalary", args.jobDescriptionType["jobDescriptionCategory"]);
    urlencoded.append("ctl00$body$butSave", "Save");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdType.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = `${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`
    } else {
      url = `${location.origin}/${reqOptions.sl}/EIM/JdType.aspx`
    }

    const response = await fetch(url, requestOptions);
    const html = await response.text();
    return "Create Successfully!!";
  }
  if (args.entity === "qualificationType") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/QualificationType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/QualificationType.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    } else {
      url = `EIM/QualificationType.aspx`
      details = await BeaconBar.executeFunction("getApiList")("QualificationType");
    }
    // const details = await BeaconBar.executeFunction("getApiList")("QualificationType");

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", details.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    urlencoded1.append("__SCROLLPOSITIONX", "0");
    urlencoded1.append("__SCROLLPOSITIONY", "0");
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "QUALIFI_TYPE_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "5");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded1.append("ctl00$body$butNew", "New");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html1, 'text/html');

    const viewState = doc.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", "");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__SCROLLPOSITIONX", "0");
    urlencoded2.append("__SCROLLPOSITIONY", "0");
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$hdnQuickmenu", "");
    urlencoded2.append("ctl00$body$txtName", args.qualificationType["qualificationTypeName"]);
    urlencoded2.append("ctl00$body$butSave", "Save");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    return "Create Successfully!!";
  }
  if (args.entity === "ratingMethod") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/RatingMethods.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/RatingMethods.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    } else {
      url = `EIM/RatingMethods.aspx`
      details = await BeaconBar.executeFunction("getApiList")("RatingMethods");
    }
    // const details = await BeaconBar.executeFunction("getApiList")("RatingMethods");
    const commonHeaders = new Headers({
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      "x-requested-with": "XMLHttpRequest"

    });

    const searchParams = new URLSearchParams();
    searchParams.append("scrollLeft", "0");
    searchParams.append("scrollTop", "0");
    searchParams.append("__EVENTTARGET", "");
    searchParams.append("__EVENTARGUMENT", "");
    searchParams.append("__VIEWSTATE", details.viewState);
    searchParams.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    searchParams.append("__VIEWSTATEENCRYPTED", "");
    searchParams.append("__EVENTVALIDATION", details.eventValidation);
    searchParams.append("ctl00$hdnDateFormat", "dd/mm/yy");
    searchParams.append("ctl00$hdnQuickmenu", "1");
    searchParams.append("ctl00$body$ContentSearch$cboCriteria", "RATING_CODE");
    searchParams.append("ctl00$body$ContentSearch$txtContent", "");
    searchParams.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchParams.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    searchParams.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "6");
    searchParams.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    searchParams.append("ctl00_body_grdsummary_ClientState", "");
    searchParams.append("ctl00$body$butNew", "New");

    const searchResponse = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: commonHeaders,
      body: searchParams,
      redirect: "follow"
    });

    const searchHtml = await searchResponse.text();
    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(searchHtml);
    window.rm = finalDetails;

    const submitParams1 = new URLSearchParams();
    submitParams1.append("__EVENTTARGET", "ctl00$body$nuninimun");
    submitParams1.append("__EVENTARGUMENT", "");
    submitParams1.append("__VIEWSTATE", window.rm.viewState);
    submitParams1.append("__VIEWSTATEGENERATOR", window.rm.viewStateGen);
    submitParams1.append("__VIEWSTATEENCRYPTED", "");
    submitParams1.append("__EVENTVALIDATION", window.rm.eventValidation);
    submitParams1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    submitParams1.append("ctl00$body$txtName", args.ratingMethod["ratingMethod"]);
    submitParams1.append("ctl00$body$txtgrade", args.ratingMethod["grade"]);
    submitParams1.append("ctl00$body$nuninimun", args.ratingMethod["minimumMarks"]);
    submitParams1.append("ctl00$body$numax", "");
    submitParams1.append("ctl00$body$nuAvg", "");

    const submitResponse1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: commonHeaders,
      body: submitParams1,
      redirect: "follow"
    });

    const submitHtml1 = await submitResponse1.text();
    const finalDetails1 = await BeaconBar.executeFunction("getDomExtract")(submitHtml1);
    window.sy = finalDetails1;

    const submitParams2 = new URLSearchParams();
    submitParams2.append("__EVENTTARGET", "ctl00$body$numax");
    submitParams2.append("__EVENTARGUMENT", "");
    submitParams2.append("__VIEWSTATE", window.sy.viewState);
    submitParams2.append("__VIEWSTATEGENERATOR", window.sy.viewStateGen);
    submitParams2.append("__VIEWSTATEENCRYPTED", "");
    submitParams2.append("__EVENTVALIDATION", window.sy.eventValidation);
    submitParams2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    submitParams2.append("ctl00$body$txtName", args.ratingMethod.ratingMethod);
    submitParams2.append("ctl00$body$txtgrade", args.ratingMethod.grade);
    submitParams2.append("ctl00$body$nuninimun", args.ratingMethod.minimumMarks);
    submitParams2.append("ctl00$body$numax", args.ratingMethod.maximumMarks);
    submitParams2.append("ctl00$body$nuAvg", "");

    const submitResponse2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: commonHeaders,
      body: submitParams2,
      redirect: "follow"
    });

    const submitHtml2 = await submitResponse2.text();
    const finalDetails2 = await BeaconBar.executeFunction("getDomExtract")(submitHtml2);
    window.sy = finalDetails2;

    const average = (args.minimumMarks + args.maximumMarks) / 2;

    const submitParams3 = new URLSearchParams();
    submitParams3.append("__EVENTTARGET", "ctl00$body$btnsavesub");
    submitParams3.append("__EVENTARGUMENT", "");
    submitParams3.append("__VIEWSTATE", window.sy.viewState);
    submitParams3.append("__VIEWSTATEGENERATOR", window.sy.viewStateGen);
    submitParams3.append("__VIEWSTATEENCRYPTED", "");
    submitParams3.append("__EVENTVALIDATION", window.sy.eventValidation);
    submitParams3.append("ctl00$hdnDateFormat", "dd/mm/yy");
    submitParams3.append("ctl00$body$txtName", args.ratingMethod.ratingMethod);
    submitParams3.append("ctl00$body$txtgrade", args.ratingMethod.grade);
    submitParams3.append("ctl00$body$nuninimun", args.ratingMethod.minimumMarks);
    submitParams3.append("ctl00$body$numax", args.ratingMethod.maximumMarks);
    submitParams3.append("ctl00$body$nuAvg", average);

    const submitResponse3 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: commonHeaders,
      body: submitParams3,
      redirect: "follow"
    });

    const submitHtml3 = await submitResponse3.text();
    const finalDetails3 = await BeaconBar.executeFunction("getDomExtract")(submitHtml3);
    window.sy = finalDetails3;

    const submitParams4 = new URLSearchParams();
    submitParams4.append("scrollLeft", "0");
    submitParams4.append("scrollTop", "0");
    submitParams4.append("__EVENTTARGET", "");
    submitParams4.append("__EVENTARGUMENT", "");
    submitParams4.append("__VIEWSTATE", window.sy.viewState);
    submitParams4.append("__LASTFOCUS", "");
    submitParams4.append("__VIEWSTATEGENERATOR", window.sy.viewStateGen);
    submitParams4.append("__VIEWSTATEENCRYPTED", "");
    submitParams4.append("__EVENTVALIDATION", window.sy.eventValidation);
    submitParams4.append("ctl00$hdnDateFormat", "dd/mm/yy");
    submitParams4.append("ctl00$body$txtName", args.ratingMethod.ratingMethod);
    submitParams4.append("ctl00$body$txtgrade", "");
    submitParams4.append("ctl00$body$nuninimun", "");
    submitParams4.append("ctl00$body$numax", "");
    submitParams4.append("ctl00$body$nuAvg", "");
    submitParams4.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    submitParams4.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    submitParams4.append("ctl00$body$grdgrade$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    submitParams4.append("ctl00_body_grdgrade_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    submitParams4.append("ctl00_body_grdgrade_ClientState", "");
    submitParams4.append("ctl00$body$butSave", "Save");

    const submitResponse4 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: commonHeaders,
      body: submitParams4,
      redirect: "follow"
    });

    const submitHtml4 = await submitResponse4.text();
    return "create rating method!!";
  }
  if (args.entity === "membershipType") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipType.aspx');
    let url;
    let details;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
      details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    } else {
      url = `EIM/MemberShipType.aspx`
      details = await BeaconBar.executeFunction("getApiList")("MemberShipType");
    }
    // const details = await BeaconBar.executeFunction("getApiList")("MemberShipType");

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", details.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", details.eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "MEMBTYPE_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "2");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded1.append("ctl00$body$butNew", "New");

    const initialRequest = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, initialRequest);
    const html1 = await response1.text();

    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", "");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$txtName", args.membershipType["membershipType"]);
    urlencoded2.append("ctl00$body$butSave", "Save");

    const finalRequest = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, finalRequest);
    const html2 = await response2.text();

    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const getValue = (id) => doc2.getElementById(id)?.value?.trim() || "";

    const createmembershipDetails = {
      code: getValue("ctl00_body_txtCode"),
      membershipType: getValue("ctl00_body_txtName")
    };

    return createmembershipDetails;
  }
  if (args.entity === "membershipDetails") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Membership.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Membership.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      // details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "Membership";
      // details = await BeaconBar.executeFunction("getApiList")(url);
    }


    const create = await BeaconBar.executeFunction("getEIMApii")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",
        __VIEWSTATE: window.cm.viewState,
        __VIEWSTATEGENERATOR: window.cm.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.cm.eventValidation,
        "ctl00$hdnDateFormat": "dd/mm/yy",
        "ctl00$body$txtName": args.membershipDetails["ctl00_body_txtName"],
        "ctl00$body$dpcountry": args.membershipDetails["ctl00_body_dpcountry"],
        "ctl00$body$butSave": "Save"
      }, url);

    const html = create.rawData || "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getElementValue = (id) => doc.getElementById(id)?.value?.trim() || "";

    const getSelectedOption = (id) => {
      const select = doc.getElementById(id);
      const selected = select?.selectedOptions?.[0];
      return selected ? { value: selected.value, text: selected.text.trim() } : { value: "", text: "" };
    };

    const createMembershipDetails = {
      code: getElementValue("ctl00_body_txtCode"),
      membership: getElementValue("ctl00_body_txtName"),
      selectedMembershipType: getSelectedOption("ctl00_body_dpcountry")
    };

    return createMembershipDetails;
  }
  if (args.entity === "membershipTitle") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipTitles.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipTitles.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "MemberShipTitles";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("MemberShipTitles");

    const create = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "MEMBTITLE_CODE",
      "ctl00$body$ContentSearch$txtContent": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: create.viewState,
      __VIEWSTATEGENERATOR: create.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: create.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.membershipTitle["membershipTitleName"],
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const getValue = (id) => {
      const el = doc.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const createMembershipTitleDetails = {
      code: getValue("ctl00_body_txtCode"),
      membershipTitle: getValue("ctl00_body_txtName")
    };

    return createMembershipTitleDetails;
  }
  if (args.entity === "bargainingUnit") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/BargainingUnit.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/BargainingUnit.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "BargainingUnit";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("BargainingUnit");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "BGN_UNIT_CODE",
      "ctl00$body$ContentSearch$txtContent": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New",
      "ctl00$body$hdnEventType": ""
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtBGNName": args.bargainingUnit["ctl00_body_txtBGNName"] || "",
      "ctl00$body$txtAbbreviation": args.bargainingUnit["ctl00_body_txtAbbreviation"] || "",
      "ctl00$body$txtRegDate": args.bargainingUnit["ctl00_body_txtRegDate"] || "",
      "ctl00$body$txtRegNumber": args.bargainingUnit["ctl00_body_txtRegNumber"] || "",
      "ctl00$body$txtRegBody": args.bargainingUnit["ctl00_body_txtRegBody"] || "",
      "ctl00$body$butSave": "Save",
      "ctl00$body$hdnEventType": "1"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const getValue = (id) => {
      const el = doc.getElementById(id);
      return el ? el.value.trim() : "";
    };

    return {
      code: getValue("ctl00_body_txtBGNCode"),
      name: getValue("ctl00_body_txtBGNName"),
      abbreviation: getValue("ctl00_body_txtAbbreviation"),
      registeredDate: getValue("ctl00_body_txtRegDate"),
      registeredNumber: getValue("ctl00_body_txtRegNumber"),
      registeredBody: getValue("ctl00_body_txtRegBody")
    };
  }
  if (args.entity === "cashBenefit") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/CashBenifit.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CashBenifit.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "CashBenifit";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("CashBenifit");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "DATA.BEN_CODE",
      "ctl00$body$ContentSearch$txtContent": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.cashBenefit["ctl00_body_txtName"] || "",
      "ctl00$body$nuamount": args.cashBenefit["ctl00_body_nuamount"] || "",
      "ctl00$body$cboCurrency": args.cashBenefit["ctl00_body_cboCurrency"] || "",
      "ctl00$body$dtRateEffDate$txtDate": args.cashBenefit["ctl00_body_dtRateEffDate_txtDate"] || "",
      "ctl00$body$dtRateEffDate$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const getValue = (id) => doc.getElementById(id)?.value?.trim() || "";
    const getSelectedText = (id) => {
      const el = doc.getElementById(id);
      return el ? el.options[el.selectedIndex]?.text.trim() || "" : "";
    };

    const createCashBenefitDetails = {
      code: getValue("ctl00_body_txtCode"),
      description: getValue("ctl00_body_txtName"),
      amount: getValue("ctl00_body_nuamount"),
      currency: getSelectedText("ctl00_body_cboCurrency"),
      rateEffectiveDate: getValue("ctl00_body_dtRateEffDate_txtDate")
    };

    return createCashBenefitDetails;
  }
  if (args.entity === "nonCashBenefitCategory") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifitCategory.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/NonCashBenifitCategory.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "NonCashBenifitCategory";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("NonCashBenifitCategory");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "NBENCAT_CODE",
      "ctl00$body$ContentSearch$txtContent": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.nonCashBenefitCategory["ctl00_body_txtName"] || "",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.getElementById("ctl00_body_txtCode")?.value?.trim() || "";
    const description = doc.getElementById("ctl00_body_txtName")?.value?.trim() || "";

    return {
      code,
      description
    };
  }
  if (args.entity === "nonCashBenefit") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifit.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/NonCashBenifit.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
    } else {
      url = "NonCashBenifit"
    }
    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: window.ncd.viewState,
      __VIEWSTATEGENERATOR: window.ncd.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.ncd.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.nonCashBenefit["ctl00_body_txtName"] || "",
      "ctl00$body$dpCategory": args.nonCashBenefit["ctl00_body_dpCategory"] || "",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.getElementById("ctl00_body_txtCode")?.value?.trim() || "";
    const description = doc.getElementById("ctl00_body_txtName")?.value?.trim() || "";

    return {
      code,
      description
    };
  }
  if (args.entity === "employeeCategory") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/StaffCatogary.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/StaffCatogary.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "StaffCatogary";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("StaffCatogary");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "CAT_CODE",
      "ctl00$body$ContentSearch$txtContent": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.employeeCategory["employeeCategory"] || "",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const employeeCategory = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      employeeCategory
    };
    return result;
  }
  if (args.entity === "statutoryClassification") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/EmpCatgary.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/EmpCatgary.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EmpCatgary";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("EmpCatgary");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.statutoryClassification["statutoryClassificationName"],
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const employeeCategory = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      employeeCategory
    };
    return result;
  }
  if (args.entity === "createFunction") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Function.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Function.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "Function";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("Function");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.createFunction["functionName"] || "",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const functionDetails = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      functionDetails
    };
    return result;
  }
  if (args.entity === "functionalRoles") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/FunctionalRole.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/FunctionalRole.aspx');
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl
    } else {
      url = "FunctionalRole"
    }

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: window.ft.viewState,
      __VIEWSTATEGENERATOR: window.ft.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.ft.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$dpcountry": args.functionalRoles["ctl00_body_dpcountry"],
      "ctl00$body$txtName": args.functionalRoles["ctl00_body_txtName"],
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const functionRole = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const selectElement = doc.querySelector("#ctl00_body_dpcountry");
    let functionSelect = null;

    if (selectElement) {
      const selected = selectElement.selectedOptions[0];
      functionSelect = {
        value: selected?.value || "",
        text: selected?.textContent.trim() || ""
      };
    }

    const result = {
      code,
      functionSelect,
      functionRole
    };

    return result;
  }
  if (args.entity === "classification") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Classification.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Classification.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "Classification";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("Classification");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.classification["classificationName"] || "",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const classification = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      classification
    };
    return result;
  }
  if (args.entity === "employeeGroup") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/StaffGroup.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/StaffGroup.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "StaffGroup";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("StaffGroup");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtName": args.employeeGroup["empGroupName"] || "",
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const employeeGroupname = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      employeeGroupname
    };
    return result;
  }
  if (args.entity === "employmentType") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/EmployeementType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/EmployeementType.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EmployeementType";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("EmployeementType");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const payload = {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$txtempdesc": args.employmentType["ctl00_body_txtempdesc"] || "",
      "ctl00$body$dpempcat": args.employmentType["ctl00_body_dpempcat"] || "",
      "ctl00$body$butSave": "Save"
    };

    if (args["ctl00_body_cbisdatelimit"] === "on") {
      payload["ctl00_body_cbisdatelimit"] = "on";
      payload["ctl00_body_nuDuration"] = args.employmentType["ctl00_body_nuDuration"] || "";
      payload["ctl00_body_dpDurationType"] = args.employmentType["ctl00_body_dpDurationType"] || "";
    }

    if (args["ctl00_body_chkRetirementAge"] === "on") {
      payload["ctl00_body_chkRetirementAge"] = "on";
      payload["ctl00_body_nuAgeofMale"] = args.employmentType["ctl00_body_nuAgeofMale"] || "";
      payload["ctl00_body_nuAgeofFemale"] = args.employmentType["ctl00_body_nuAgeofFemale"] || "";
    }

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")(payload, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const createemployeeTypeDetails = {
      code: doc.querySelector("#ctl00_body_txtempcode")?.value?.trim() || "",
      employmentType: doc.querySelector("#ctl00_body_txtempdesc")?.value?.trim() || "",
      dateLimited: doc.querySelector("#ctl00_body_cbisdatelimit")?.checked || false,
      duration: doc.querySelector("#ctl00_body_nuDuration")?.value?.trim() || "",
      durationUnit: doc.querySelector("#ctl00_body_dpDurationType option:checked")?.textContent.trim() || "",
      retirementAgeRequired: doc.querySelector("#ctl00_body_chkRetirementAge")?.checked || false,
      retirementAgeMale: doc.querySelector("#ctl00_body_nuAgeofMale")?.value?.trim() || "",
      retirementAgeFemale: doc.querySelector("#ctl00_body_nuAgeofFemale")?.value?.trim() || "",
      employmentCategory: doc.querySelector("#ctl00_body_dpempcat option:checked")?.textContent.trim() || ""
    };

    return createemployeeTypeDetails;
  }
  if (args.entity === "employeeTitle") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Salutation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Salutation.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "Salutation";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("Salutation");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00$body$butNew": "New"
    }, url);

    const payload = {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$hdnDateFormat": "m/d/yy",
      "ctl00$hdnQuickmenu": "",
      "ctl00$body$txtName": args.employeeTitle["ctl00_body_txtName"] || "",
      "ctl00$body$butSave": "Save"
    };

    if (args.employeeTitle["ctl00_body_chkGenderValid"] === "on") {
      payload["ctl00_body_chkGenderValid"] = "on";
    }

    if (args.employeeTitle["ctl00_body_cboGender"]) {
      payload["ctl00_body_cboGender"] = args.employeeTitle["ctl00_body_cboGender"];
    }

    for (let i = 0; i <= 12; i++) {
      const key = `ctl00$body$chkMaritalStatus$${i}`;
      if (args.employeeTitle[key] === "on") {
        payload[key] = "on";
      }
    }


    const saveResponse = await BeaconBar.executeFunction("getEIMApii")(payload, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const createemployeetypeDetails = {
      code: doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "",
      employeeTitle: doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "",
      genderValidate: doc.querySelector("#ctl00_body_chkGenderValid")?.checked || false,
      gender: (() => {
        const selected = doc.querySelector("#ctl00_body_cboGender")?.selectedOptions?.[0];
        return selected ? selected.textContent.trim() : "";
      })(),
      maritalStatusLabel: doc.querySelector("#ctl00_body_lblMAritalStatus")?.textContent.trim() || "",
      maritalStatuses: []
    };

    const maritalTable = doc.querySelector("#ctl00_body_chkMaritalStatus");
    if (maritalTable) {
      const checkboxes = maritalTable.querySelectorAll("input[type='checkbox']");
      checkboxes.forEach((checkbox) => {
        const label = maritalTable.querySelector(`label[for="${checkbox.id}"]`);
        createemployeetypeDetails.maritalStatuses.push({
          label: label ? label.textContent.trim() : "",
          checked: checkbox.checked
        });
      });
    }

    return createemployeetypeDetails;
  }
  if (args.entity === "genderType") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/GenderType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/GenderType.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "GenderType";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("GenderType");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$body$txtGenName": args.genderType["ctl00_body_txtGenName"],
      "ctl00$body$txtdesc": args.genderType["ctl00_body_txtdesc"],
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const gender = doc.querySelector("#ctl00_body_txtGenName")?.value?.trim() || "";
    const description = doc.querySelector("#ctl00_body_txtdesc")?.value?.trim() || "";

    const createdetails = {
      code,
      gender,
      description
    };
    return createdetails;
  }
  if (args.entity === "maritalStatus") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/MaritalStatus.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MaritalStatus.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "MaritalStatus";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("MaritalStatus");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$body$txtName": args.maritalStatus["ctl00_body_txtName"],
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const maritalStatus = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const createdetails = {
      code,
      maritalStatus
    };
    return createdetails;
  }
  if (args.entity === "bloodGroup") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/BloodGroup.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/BloodGroup.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "BloodGroup";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("BloodGroup");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$body$txtName": args.bloodGroup["ctl00_body_txtName"],
      "ctl00$body$butSave": "Save"
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const bloodgroup = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const createdetails = {
      code,
      bloodgroup
    };
    return createdetails;
  }
  if (args.entity === "attachmentType") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/AttachmentType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/AttachmentType.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "AttachmentType";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }
    // const details = await BeaconBar.executeFunction("getApiList")("AttachmentType");

    const newInt = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$butNew": "New"
    }, url);

    const payload = {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,
      "ctl00$body$txtDesc": args.attachmentType["ctl00_body_txtDesc"] || "",
      "ctl00$body$butSave": "Save"
    };

    if (args["ctl00_body_ChkisExpire"] === "on") {
      payload["ctl00_body_ChkisExpire"] = "on";
    }

    const saveResponse = await BeaconBar.executeFunction("getEIMApii")(payload, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(saveResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const attachmentType = doc.querySelector("#ctl00_body_txtDesc")?.value?.trim() || "";
    const expiration = doc.querySelector("#ctl00_body_ChkisExpire")?.checked || false;

    const createdetails = {
      code,
      attachmentType,
      expiration
    };
    return createdetails;
  }

  if (args.entity === "cashBenefitAssignToSalaryGrade") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignCashBenifit.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    let payload = {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: window.cashBenefit.viewState,
      __VIEWSTATEGENERATOR: window.cashBenefit.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.cashBenefit.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$hdnQuickmenu": "1",
      "ctl00$body$lnkAdd": "Add"
    }

    args.cashBenefitAssignToSalaryGrade?.userSpecificcashBenefitAssignToSalaryGradeNames?.forEach(x => {
      payload[x] = "on";
    });

    const addResponse = await BeaconBar.executeFunction("getEIMApii")(payload, "AssignCashBenifit");

    await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: addResponse.viewState,
      __VIEWSTATEGENERATOR: addResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: addResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$hdnQuickmenu": "1",
      "ctl00$body$butSave": "Save"
    }, "AssignCashBenifit");

    return "sucessfully created"
  }

  if (args.entity === "nonCashBenefitAssignToSalaryGrade") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/AssignNonCashBenifit.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    let payload = {
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: window.noncashBenefit.viewState,
      __VIEWSTATEGENERATOR: window.noncashBenefit.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.noncashBenefit.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00_body_grdavailable_ClientState": "",
      "ctl00$hdnQuickmenu": "1",
      "ctl00$body$lnkAdd": "Add"
    }

    args.nonCashBenefitAssignToSalaryGrade?.userSpecificcashBenefitAssignToSalaryGradeNames?.forEach(x => {
      payload[x] = "on";
    });

    const addResponse = await BeaconBar.executeFunction("getEIMApii")(payload, "AssignNonCashBenifit");

    await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      __VIEWSTATE: addResponse.viewState,
      __VIEWSTATEGENERATOR: addResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: addResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$hdnQuickmenu": "1",
      "ctl00_body_grdavailable_ClientState ": "",
      "ctl00$body$butSave": "Save"
    }, "AssignNonCashBenifit");

    return "sucessfully created"


    return args
  }

  // return args;
})