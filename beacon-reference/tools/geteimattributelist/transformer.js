(async function (data, args, reqOptions) {
  if (args.entity === "location") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Location.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Location.aspx');

    // const url = `${reqOptions.sl}/${updateurl.updateUrl}`

    const details = await BeaconBar.executeFunction("getAllApi")(updateurl.updateUrl, args.codeId);

    if (details) {
      const urlencoded = new URLSearchParams();
      urlencoded.append("scrollLeft", "0");
      urlencoded.append("scrollTop", "0");
      urlencoded.append("__EVENTTARGET", details.target);
      urlencoded.append("__EVENTARGUMENT", "");
      urlencoded.append("__VIEWSTATE", details.viewState);
      urlencoded.append("__VIEWSTATEGENERATOR", details.viewStateGen);
      urlencoded.append("__VIEWSTATEENCRYPTED", "");
      urlencoded.append("__EVENTVALIDATION", details.eventValidation);
      urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
      urlencoded.append("ctl00$body$hdnIsHead", "");
      urlencoded.append("ctl00$body$hdnEditItemIndex", "");
      urlencoded.append("ctl00_body_RadWindowManager1_ClientState", "");
      urlencoded.append("ctl00$body$ContentSearch$cboCriteria", "LOC_CODE");
      urlencoded.append("ctl00$body$ContentSearch$txtContent", args.codeId);
      urlencoded.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      urlencoded.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      urlencoded.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
      urlencoded.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      urlencoded.append("ctl00_body_grdSummary_ClientState", "");
      urlencoded.append("ctl00$body$hdnDefCountry", "-1");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
      };

      const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`, requestOptions);
      const html = await response.text();
      const details1 = await BeaconBar.executeFunction("getDomExtract")(html);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      function extractOptions(selectId) {
        const select = doc.getElementById(selectId);
        if (!select) return [];
        return Array.from(select.options).map(option => ({
          value: option.value,
          label: option.text.trim()
        }));
      }

      const dataObj = {
        Countries: extractOptions("ctl00_body_ddlCountry"),
        TimeZoneGMT: extractOptions("ctl00_body_cboTimeZone"),
        Districts: extractOptions("ctl00_body_ddlDistrict")
      };

      const result = {
        code: doc.querySelector('#ctl00_body_txtCode')?.value || "",
        location: doc.querySelector('#ctl00_body_txtName')?.value || "",
        abbreviation: doc.querySelector('#ctl00_body_txtAbbreviation')?.value || "",
        telephone: doc.querySelector('#ctl00_body_txttp')?.value || "",
        fax: doc.querySelector('#ctl00_body_txtFax')?.value || "",
        email: doc.querySelector('#ctl00_body_txtemail')?.value || "",
        url: doc.querySelector('#ctl00_body_txturl')?.value || "",
        address: doc.querySelector('#ctl00_body_txtaddress')?.value.trim() || "",
        country: {
          text: doc.querySelector('#ctl00_body_ddlCountry option:checked')?.textContent.trim() || "",
          value: doc.querySelector('#ctl00_body_ddlCountry')?.value || ""
        },
        province: {
          text: doc.querySelector('#ctl00_body_ddlProvince option:checked')?.textContent.trim() || "",
          value: doc.querySelector('#ctl00_body_ddlProvince')?.value || ""
        },
        district: {
          text: doc.querySelector('#ctl00_body_ddlDistrict option:checked')?.textContent.trim() || "",
          value: doc.querySelector('#ctl00_body_ddlDistrict')?.value || ""
        },
        timezone: doc.querySelector('#ctl00_body_cboTimeZone')?.value || "",
        headOfLocation: doc.querySelector('#ctl00_body_txtHeadName')?.value || "",
        headTitle: doc.querySelector('#ctl00_body_txtHTitle')?.value || "",
        administrator: doc.querySelector('#ctl00_body_txtAdminName')?.value || "",
        logo: doc.querySelector('#ctl00_body_filMyFile')?.value || "",
        logoPreviewUrl: doc.querySelector('#ctl00_body_imgTempEMPImage')?.src || ""
      };

      window.viewData = {
        ...details1,
        ...result
      };

      return result;
    } else {
      return `location is not exist in the this id ${args.id}`;
    }
  }
  if (args.entity === "companyHierarchy") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/CompanyHierarchy.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CompanyHierarchy.aspx');

    const details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    window.ch = details;

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", window.ch.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", window.ch.viewStateGen);
    urlencoded1.append("__SCROLLPOSITIONX", "0");
    urlencoded1.append("__SCROLLPOSITIONY", "0");
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", window.ch.eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00_body_RadWindowManager1_ClientState", "");
    urlencoded1.append("ctl00$body$ContentSearchCompanyHie$cboCriteria", "T.HIE_CODE");
    urlencoded1.append("ctl00$body$ContentSearchCompanyHie$ddlHie", "-1");
    urlencoded1.append("ctl00$body$ContentSearchCompanyHie$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearchCompanyHie$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "26");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded1.append("ctl00$body$hdnOrgchartURL", "../OrgChartV9/companychart.aspx?popup=1&digest=WGreiH2lCZhF2jzcVDYkmg");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`, requestOptions1);
    const html1 = await response1.text();
    const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
    const parser = new DOMParser();
    const document = parser.parseFromString(html1, 'text/html');
    const anchor = document.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const postBackId = anchor?.getAttribute('href')?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackId);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
    urlencoded2.append("__SCROLLPOSITIONX", "0");
    urlencoded2.append("__SCROLLPOSITIONY", "0");
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00_body_RadWindowManager1_ClientState", "");
    urlencoded2.append("ctl00$body$ContentSearchCompanyHie$cboCriteria", "T.HIE_CODE");
    urlencoded2.append("ctl00$body$ContentSearchCompanyHie$ddlHie", "-1");
    urlencoded2.append("ctl00$body$ContentSearchCompanyHie$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");
    urlencoded2.append("ctl00$body$hdnOrgchartURL", "../OrgChartV9/companychart.aspx?popup=1&digest=WGreiH2lCZhF2jzcVDYkmg");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`, requestOptions2);
    const html2 = await response2.text();
    const doc2 = parser.parseFromString(html2, 'text/html');

    const getValue = (selector) => doc2.querySelector(selector)?.value?.trim() || "";
    const getText = (selector) => doc2.querySelector(selector)?.innerText?.trim() || "";
    const getSelectText = (selector) => {
      const el = doc2.querySelector(selector);
      return el ? el.options[el.selectedIndex]?.text.trim() || "" : "";
    };
    const getImgSrc = (selector) => doc2.querySelector(selector)?.getAttribute("src") || "";

    const checkbox = document.querySelector('#ctl00_body_chkHieCodeActive');
    const isActive = checkbox?.checked ? true : false;

    const hierarchyData = {
      code: getValue("#ctl00_body_txtCode"),
      hierarchyLevel: getSelectText("#ctl00_body_CboHierarchyLevel"),
      hierarchyName: getValue("#ctl00_body_txtDes"),
      abbreviation: getValue("#ctl00_body_txtAbbreviation"),
      telephone: getValue("#ctl00_body_txttp"),
      fax: getValue("#ctl00_body_txtFax"),
      email: getValue("#ctl00_body_txtemail"),
      url: getValue("#ctl00_body_txturl"),
      address: getValue("#ctl00_body_txtaddress"),
      headName: getValue("#ctl00_body_txtHeadName"),
      titleOfHead: getValue("#ctl00_body_txtHTitle"),
      administrator: getValue("#ctl00_body_txtAdminName"),
      country: getSelectText("#ctl00_body_ddlCountry"),
      location: getSelectText("#ctl00_body_dplocation"),
      logoUrl: getImgSrc("#ctl00_body_imgTempEMPImage"),
      headerImageUrl: getImgSrc("#ctl00_body_imgTempEMPImageHeader"),
      footerImageUrl: getImgSrc("#ctl00_body_imgTempEMPImageFooter"),
      isActive: isActive,
      additionalRoles: Array.from(doc2.querySelectorAll("#ctl00_body_grdHead input")).map(input => ({
        role: input.closest('tr')?.children[0]?.innerText.trim() || "",
        employeeName: input.value.trim()
      })),
      classifications: Array.from(doc2.querySelectorAll("#ctl00_body_drpClassification option"))
        .filter(option => option.selected)
        .map(option => option.text.trim())
    };
    return hierarchyData;
  }
  if (args.entity === "costCentre") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/Coscentre.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Coscentre.aspx');
    const details = await BeaconBar.executeFunction("getApiList")(updateurl.updateUrl);
    window.cc = details;

    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const urlencoded1 = new URLSearchParams();
    urlencoded1.append("scrollLeft", "0");
    urlencoded1.append("scrollTop", "0");
    urlencoded1.append("__EVENTTARGET", "");
    urlencoded1.append("__EVENTARGUMENT", "");
    urlencoded1.append("__VIEWSTATE", window.cc.viewState);
    urlencoded1.append("__VIEWSTATEGENERATOR", window.cc.viewStateGen);
    urlencoded1.append("__VIEWSTATEENCRYPTED", "");
    urlencoded1.append("__EVENTVALIDATION", window.cc.eventValidation);
    urlencoded1.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "CENTRE_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`, requestOptions1);
    const html1 = await response1.text();
    const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
    const parser = new DOMParser();
    const document1 = parser.parseFromString(html1, 'text/html');
    const anchor = document1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const postBackId = anchor?.getAttribute('href')?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackId);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "CENTRE_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}`, requestOptions2);
    const html2 = await response2.text();

    const costDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.cd = costDetails;
    const document2 = parser.parseFromString(html2, 'text/html');

    const getValue = (selector) => document2.querySelector(selector)?.value?.trim() || "";

    const extractedData = {
      code: getValue("#ctl00_body_txtCode"),
      costCentreName: getValue("#ctl00_body_txtName"),
      briefDescription: getValue("#ctl00_body_txtbriefDesc")
    };
    return extractedData;

  }

  if (args.entity === "subLocation") {

    if (!BeaconBar.user.metaData.menus.includes("eim/SubLocation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/SubLocation.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/SubLocation.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")(details);

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
    urlencoded1.append("ctl00$body$hdnIsHead", "");
    urlencoded1.append("ctl00$body$hdnEditItemIndex", "");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "SUB_LOC_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "5");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdSummary_ClientState", "");
    urlencoded1.append("ctl00$body$hdnDefCountry", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();
    const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
    const parser = new DOMParser();
    const document1 = parser.parseFromString(html1, 'text/html');
    const anchor = document1.querySelector('tr[id^="ctl00_body_grdSummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackKey = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackKey);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$hdnIsHead", "");
    urlencoded2.append("ctl00$body$hdnEditItemIndex", "");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "SUB_LOC_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdSummary_ClientState", "");
    urlencoded2.append("ctl00$body$hdnDefCountry", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();
    const costDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.sl = costDetails;

    const document2 = parser.parseFromString(html2, 'text/html');
    const code = document2.getElementById("ctl00_body_txtCode")?.value || "";
    const description = document2.getElementById("ctl00_body_txtName")?.value || "";
    const locationSelect = document2.getElementById("ctl00_body_ddlLocation");
    const selectedLocation = locationSelect?.options[locationSelect.selectedIndex];
    const location = {
      id: selectedLocation?.value || "",
      name: selectedLocation?.textContent?.trim() || ""
    };
    const headOfSubLocation = document2.getElementById("ctl00_body_txtHeadName")?.value || "";
    const select = document2.getElementById("ctl00_body_ddlLocation");
    const options = Array.from(select.options);

    const locationData = options.map(option => ({
      id: option.value,
      name: option.textContent.trim()
    }));

    const sublocationData = {
      Code: code,
      Description: description,
      Location: location,
      HeadOfSubLocation: headOfSubLocation,
      allLocation: locationData
    };

    return sublocationData;

  }

  if (args.entity === "salaryGrade") {
    if (!BeaconBar.user.metaData.menus.includes("EIM/SalaryGradeInfo.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/SalaryGradeInfo.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/SalaryGradeInfo.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("SalaryGradeInfo");

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
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "SAGRD.SAL_GRD_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "33");
    urlencoded1.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary1_ClientState", "");
    urlencoded1.append("ctl00$body$hdnDecimalFormat", "2");

    const requestOptions1 = { method: "POST", headers: myHeaders, body: urlencoded1, redirect: "follow" };
    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();
    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary1_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "SAGRD.SAL_GRD_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary1_ClientState", "");
    urlencoded2.append("ctl00$body$hdnDecimalFormat", "2");

    const requestOptions2 = { method: "POST", headers: myHeaders, body: urlencoded2, redirect: "follow" };
    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.sg = viewDetails;
    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const salaryGradeData = {
      code: doc2.getElementById('ctl00_body_txtsalcode')?.value.trim() || "",
      salaryGradeName: doc2.getElementById('ctl00_body_txtsalname')?.value.trim() || "",
      currency: {
        value: doc2.getElementById('ctl00_body_cboCurrType')?.value || "",
        text: doc2.getElementById('ctl00_body_cboCurrType')?.options[doc2.getElementById('ctl00_body_cboCurrType')?.selectedIndex]?.text.trim() || ""
      },
      salaryType: (() => {
        const rangeRadio = doc2.getElementById('ctl00_body_optsalary_0');
        const slotRadio = doc2.getElementById('ctl00_body_optsalary_1');
        if (rangeRadio?.checked) return "Range";
        if (slotRadio?.checked) return "Slot";
        return "";
      })(),
      minPoint: doc2.getElementById('ctl00_body_txtMin')?.value.trim() || "",
      midPoint: doc2.getElementById('ctl00_body_txtMid')?.value.trim() || "",
      maxPoint: doc2.getElementById('ctl00_body_txtMax')?.value.trim() || ""
    };

    const select = doc2.getElementById('ctl00_body_cboCurrType');
    const currencies = select ? Array.from(select.options)
      .filter(option => option.value !== "-1")
      .map(option => ({
        value: option.value,
        text: option.text.trim()
      })) : [];

    if (salaryGradeData) {
      return { salaryGradeData, currencies };
    } else {
      return "rating method code is not existing please check the rating method code"
    }

  }
  if (args.entity === "corporateTitle") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/CorporeteTitle.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/CorporeteTitle.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/CorporeteTitle.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }


    // const details = await BeaconBar.executeFunction("getApiList")("CorporeteTitle");

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
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "C.CT_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();
    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "C.CT_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.ct = finalDetails;

    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const getValue = (id) => doc2.getElementById(id)?.value?.trim() || "";
    const getSelectedOption = (id) => {
      const select = doc2.getElementById(id);
      if (select && select.selectedIndex >= 0) {
        return {
          value: select.options[select.selectedIndex].value,
          text: select.options[select.selectedIndex].text.trim()
        };
      }
      return { value: "", text: "" };
    };
    const isChecked = (id) => doc2.getElementById(id)?.checked || false;

    const extractedData = {
      code: getValue('ctl00_body_txtCode'),
      corporateTitle: getValue('ctl00_body_txtName'),
      salaryGrade: getSelectedOption('ctl00_body_dpSalary'),
      topInHierarchy: isChecked('ctl00_body_chkTop'),
      nextUpgradeLevel: getSelectedOption('ctl00_body_dpNextUpgrade'),
      level: parseInt(getValue('ctl00_body_nuLevel'), 10) || 0,
      managerialPosition: isChecked('ctl00_body_ManagePos')
    };

    const salaryGrades = Array.from(doc2.querySelectorAll('#ctl00_body_dpSalary option'))
      .filter(option => option.value !== "-1" && option.value.trim() && option.text.trim())
      .map(({ value, text }) => ({ value, text: text.trim() }));

    const nextUpgradeLevels = Array.from(doc2.querySelectorAll('#ctl00_body_dpNextUpgrade option'))
      .filter(option => option.value !== "-1" && option.value.trim() && option.text.trim())
      .map(({ value, text }) => ({ value, text: text.trim() }));

    return { extractedData, salaryGrades, nextUpgradeLevels };

  }
  if (args.entity === "designation") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/Designation.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/Designation.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/Designation.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("Designation");

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
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "D.DSG_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "35");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = { method: "POST", headers: myHeaders, body: urlencoded1, redirect: "follow" };
    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "D.DSG_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = { method: "POST", headers: myHeaders, body: urlencoded2, redirect: "follow" };
    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.design = finalDetails;

    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const getValue = (id) => doc2.getElementById(id)?.value?.trim() ?? "";
    const getSelectedOption = (id) => {
      const select = doc2.getElementById(id);
      return select?.selectedIndex >= 0
        ? { value: select.value, text: select.options[select.selectedIndex].text.trim() }
        : { value: "", text: "" };
    };
    const isChecked = (id) => doc2.getElementById(id)?.checked ?? false;

    const designationDetails = {
      code: getValue("ctl00_body_txtCode"),
      designation: getValue("ctl00_body_txtName"),
      seniorManagement: isChecked("ctl00_body_chksenior"),
      salaryGrade: getSelectedOption("ctl00_body_dpSalary"),
      corporateTitle: getSelectedOption("ctl00_body_dpNextUpgrade"),
      nextDesignationInCareerProgression: getSelectedOption("ctl00_body_dpnextupgradedsg"),
      functionalRole: getSelectedOption("ctl00_body_cbofunctionRole")
    };

    const extractOptions = (selector) =>
      Array.from(doc2.querySelector(selector)?.options || [])
        .filter(opt => opt.value !== "-1" && opt.value.trim() && opt.text.trim())
        .map(opt => ({ value: opt.value, text: opt.text.trim() }));

    const salaryGrades = extractOptions('#ctl00_body_dpSalary');
    const nextDesignationInCareerProgression = extractOptions('#ctl00_body_dpnextupgradedsg');
    const functionalRoles = extractOptions('#ctl00_body_cbofunctionRole');

    return { designationDetails, salaryGrades, nextDesignationInCareerProgression, functionalRoles };

  }
  if (args.entity === "jobDescriptionCategory") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/JdCategory.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdCategory.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/JdCategory.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
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
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "7");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = { method: "POST", headers: myHeaders, body: urlencoded1, redirect: "follow" };
    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__SCROLLPOSITIONX", "0");
    urlencoded2.append("__SCROLLPOSITIONY", "0");
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "JDCAT_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = { method: "POST", headers: myHeaders, body: urlencoded2, redirect: "follow" };
    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.jdc = finalDetails;

    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const getValue = (id) => doc2.getElementById(id)?.value?.trim() || "";

    const extractedData = {
      code: getValue('ctl00_body_txtCode'),
      jobDescriptionCategory: getValue('ctl00_body_txtName')
    };

    return extractedData;

  }
  if (args.entity === "jobDescriptionType") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/JdType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/JdType.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/JdType.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }


    // const details = await BeaconBar.executeFunction("getApiList")("JdType");

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
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "JDTYPE_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "JDTYPE_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.jdt = finalDetails;

    const parser2 = new DOMParser();
    const document = parser2.parseFromString(html2, 'text/html');

    const getValue = (id) => document.getElementById(id)?.value?.trim() || "";

    const getSelectedOption = (id) => {
      const select = document.getElementById(id);
      if (!select || select.selectedIndex < 0) return { value: "", text: "" };
      const selected = select.options[select.selectedIndex];
      return {
        value: selected.value,
        text: selected.text.trim()
      };
    };

    const extractOptions = (id) => {
      const select = document.getElementById(id);
      if (!select) return [];

      return Array.from(select.options)
        .filter(opt => opt.value !== "-1" && opt.value.trim() && opt.text.trim())
        .map(opt => ({ value: opt.value, text: opt.text.trim() }));
    };

    const extractedData = {
      code: getValue("ctl00_body_txtCode"),
      jobDescriptionType: getValue("ctl00_body_txtName"),
      jobDescriptionCategory: getSelectedOption("ctl00_body_dpSalary"),
      allJobDescriptionCategories: extractOptions("ctl00_body_dpSalary")
    };

    return extractedData;

  }
  if (args.entity === "qualificationClassification") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/QualificationType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/QualificationClassific.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/QualificationClassific.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("QualificationClassific");

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
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId || "");
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "6");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow",
    };

    const response1 = await fetch(`/${reqOptions.sl}/EIM/QualificationClassific.aspx`, requestOptions1);
    const html1 = await response1.text();

    const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, "text/html");

    const row = doc1.querySelector("#ctl00_body_grdsummary_ctl00__0");
    const key = row?.querySelector("a")?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || null;
    if (!key) {
      throw new Error("Unable to find the key for postback.");
    }

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", key);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId || "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow",
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/EIM/QualificationClassific.aspx`, requestOptions2);
    const html2 = await response2.text();
    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);

    window.rm = finalDetails;

    function extractSkillRatingData(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const ratingCodeElement = doc.querySelector("#ctl00_body_txtCode");
      const ratingMethodElement = doc.querySelector("#ctl00_body_txtName");
      const rank = doc.querySelector("#ctl00_body_txtRate");

      const ratingCode = ratingCodeElement ? ratingCodeElement.value.trim() : "";
      const ratingMethod = ratingMethodElement ? ratingMethodElement.value.trim() : "";
      const ranking = rank ? rank.value.trim() : "";




      return {
        code: ratingCode,
        Classification: ratingMethod,
        Rank: ranking
      };
    }


    const extractedData = extractSkillRatingData(html2);

    return extractedData;

  }
  if (args.entity === "ratingMethod") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/RatingMethods.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/RatingMethods.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/RatingMethods.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("RatingMethods");

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
    urlencoded1.append("ctl00$body$hdnIsHead", "");
    urlencoded1.append("ctl00$body$hdnEditItemIndex", "");
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "RATING_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId || "");
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "6");
    urlencoded1.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow",
    };

    const response1 = await fetch(`/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const viewDetails = await BeaconBar.executeFunction("getDomExtract")(html1);
    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, "text/html");

    const row = doc1.querySelector("#ctl00_body_grdsummary_ctl00__0");
    const key = row?.querySelector("a")?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1] || null;

    if (!key) {
      throw new Error("Unable to find the key for postback.");
    }

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", key);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewDetails.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewDetails.viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", viewDetails.eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "RATING_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId || "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow",
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();
    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);

    window.rm = finalDetails;

    function extractSkillRatingData(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const grades = [];

      const ratingCodeElement = doc.querySelector("#ctl00_body_txtCode");
      const ratingMethodElement = doc.querySelector("#ctl00_body_txtName");

      const ratingCode = ratingCodeElement ? ratingCodeElement.value.trim() : "";
      const ratingMethod = ratingMethodElement ? ratingMethodElement.value.trim() : "";

      const gradeRows = doc.querySelectorAll('#ctl00_body_grdgrade_ctl00 tbody tr');

      gradeRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
          grades.push({
            grade: cells[0].textContent.trim(),
            minimumMarks: parseFloat(cells[1].textContent.trim()) || 0,
            maximumMarks: parseFloat(cells[2].textContent.trim()) || 0,
            averageMarks: parseFloat(cells[3].textContent.trim()) || 0
          });
        }
      });

      if (ratingCode) {
        return {
          code: ratingCode,
          ratingMethod: ratingMethod,
          grades: grades
        };
      } else {
        return "rating method code is not exist please the check the rating method code."
      }
    }


    const extractedData = extractSkillRatingData(html2);
    return extractedData;

  }

  if (args.entity === "membershipType") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/MemberShipType.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/MemberShipType.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/MemberShipType.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
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
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "2");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions1 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions1);
    const html1 = await response1.text();

    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "MEMBTYPE_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions2);
    const html2 = await response2.text();

    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.mt = finalDetails;

    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const getValue = (id) => doc2.getElementById(id)?.value?.trim() || "";

    const membership = {
      code: getValue("ctl00_body_txtCode"),
      membershipType: getValue("ctl00_body_txtName")
    };

    return membership;

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
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "EIM/Membership.aspx";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("Membership");

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
    urlencoded1.append("ctl00$body$ContentSearch$cboCriteria", "MEMBSHIP_CODE");
    urlencoded1.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded1.append("ctl00$body$ContentSearch$butSearch", "Search");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded1.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "3");
    urlencoded1.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded1.append("ctl00_body_grdsummary_ClientState", "");

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: myHeaders,
      body: urlencoded1,
      redirect: "follow"
    });
    const html1 = await response1.text();

    const parser1 = new DOMParser();
    const doc1 = parser1.parseFromString(html1, 'text/html');

    const anchor = doc1.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
    const href = anchor?.getAttribute('href') || "";
    const match = href.match(/__doPostBack\('([^']+)'/);
    const postBackCode = match ? match[1] : "";

    const viewState = doc1.querySelector('#__VIEWSTATE')?.value || '';
    const eventValidation = doc1.querySelector('#__EVENTVALIDATION')?.value || '';
    const viewStateGen = doc1.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");
    urlencoded2.append("__EVENTTARGET", postBackCode);
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__VIEWSTATE", viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", eventValidation);
    urlencoded2.append("ctl00$hdnDateFormat", "dd/mm/yy");
    urlencoded2.append("ctl00$body$ContentSearch$cboCriteria", "MEMBSHIP_CODE");
    urlencoded2.append("ctl00$body$ContentSearch$txtContent", args.codeId);
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    urlencoded2.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1");
    urlencoded2.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    urlencoded2.append("ctl00_body_grdsummary_ClientState", "");

    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    });
    const html2 = await response2.text();

    const finalDetails = await BeaconBar.executeFunction("getDomExtract")(html2);
    window.md = finalDetails

    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(html2, 'text/html');

    const getElementValue = (id) => doc2.getElementById(id)?.value?.trim() || "";

    const getSelectedOption = (id) => {
      const select = doc2.getElementById(id);
      const selected = select?.selectedOptions?.[0];
      return selected ? { value: selected.value, text: selected.text.trim() } : { value: "", text: "" };
    };

    const extractOptions = (id) => {
      const select = doc2.getElementById(id);
      return select ? Array.from(select.options)
        .filter(opt => opt.value !== "-1" && opt.value.trim() && opt.text.trim())
        .map(opt => ({ value: opt.value, text: opt.text.trim() })) : [];
    };

    const membershipDetails = {
      code: getElementValue("ctl00_body_txtCode"),
      membership: getElementValue("ctl00_body_txtName"),
      selectedMembershipType: getSelectedOption("ctl00_body_dpcountry"),
      allMembershipTypes: extractOptions("ctl00_body_dpcountry")
    };
    return membershipDetails;

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
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
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "MEMBTITLE_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const getValue = (id) => {
      const el = doc.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const membershipTitleDetails = {
      code: getValue("ctl00_body_txtCode"),
      membershipTitle: getValue("ctl00_body_txtName")
    };

    window.mt = postBackResponse;

    return membershipTitleDetails;

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
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
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": "",
      "ctl00$body$hdnEventType": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "BGN_UNIT_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.bu = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const getValue = (id) => {
      const el = doc.getElementById(id);
      return el ? el.value.trim() : "";
    };

    const bargainingUnitDetails = {
      code: getValue("ctl00_body_txtBGNCode"),
      name: getValue("ctl00_body_txtBGNName"),
      abbreviation: getValue("ctl00_body_txtAbbreviation"),
      registeredDate: getValue("ctl00_body_txtRegDate"),
      registeredNumber: getValue("ctl00_body_txtRegNumber"),
      registeredBody: getValue("ctl00_body_txtRegBody")
    };

    return bargainingUnitDetails;

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
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
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "DATA.BEN_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    window.cb = postBackResponse;

    const getValue = (id) => doc.getElementById(id)?.value?.trim() || "";
    const getSelectedText = (id) => {
      const el = doc.getElementById(id);
      return el ? el.options[el.selectedIndex]?.text.trim() || "" : "";
    };

    const cashbenefitdetails = {
      code: getValue("ctl00_body_txtCode"),
      description: getValue("ctl00_body_txtName"),
      amount: getValue("ctl00_body_nuamount"),
      currency: getSelectedText("ctl00_body_cboCurrency"),
      rateEffectiveDate: getValue("ctl00_body_dtRateEffDate_txtDate")
    };

    const select = doc.getElementById("ctl00_body_cboCurrency");
    if (!select) return [];

    const allcurrencies = Array.from(select.options)
      .filter(opt => opt.value && opt.value !== "-1")
      .map(opt => ({
        value: opt.value,
        text: opt.text.trim()
      }));

    return { cashbenefitdetails, allcurrencies };

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
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
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "NBENCAT_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    window.ncb = postBackResponse;

    const code = doc.getElementById("ctl00_body_txtCode")?.value?.trim() || "";
    const description = doc.getElementById("ctl00_body_txtName")?.value?.trim() || "";

    return { code, description };

  }
  if (args.entity === "nonCashBenefit") {

    if (!BeaconBar.user.metaData.menus.includes("EIM/NonCashBenifit.aspx")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }

    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/NonCashBenifit.aspx');

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "NonCashBenifit";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("NonCashBenifit");

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "B.NBEN_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "7",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "B.NBEN_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.cda = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const categorySelect = doc.getElementById("ctl00_body_dpCategory");
    const categories = [];

    if (categorySelect) {
      for (const option of categorySelect.options) {
        categories.push({
          value: option.value,
          text: option.text.trim()
        });
      }
    }

    const code = doc.getElementById("ctl00_body_txtCode")?.value?.trim() || "";
    const description = doc.getElementById("ctl00_body_txtName")?.value?.trim() || "";
    const selectedCategory = categorySelect?.options[categorySelect.selectedIndex]?.text?.trim() || "";

    return {
      code,
      description,
      category: selectedCategory,
      categories
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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
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
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "CAT_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.ec = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "STAFFCAT_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "STAFFCAT_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.sc = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const statutoryClassification = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      statutoryClassification
    };
    return result;

  }
  if (args.entity === "function") {

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "FUNCTION_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "FUNCTION_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.fu = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

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

    let details;
    let url;

    if (updateurl.updateUrl) {
      url = updateurl.updateUrl;
      details = await BeaconBar.executeFunction("getUpdateApiList")(url);
    } else {
      url = "FunctionalRole";
      details = await BeaconBar.executeFunction("getApiList")(url);
    }

    // const details = await BeaconBar.executeFunction("getApiList")("FunctionalRole");

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "F.FUNCTION_ROLE_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "4",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "F.FUNCTION_ROLE_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.fr = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const functionRole = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const selectElement = doc.querySelector("#ctl00_body_dpcountry");
    let functionSelect = null;
    const options = [];

    if (selectElement) {
      const selected = selectElement.selectedOptions[0];
      functionSelect = {
        value: selected?.value || "",
        text: selected?.textContent.trim() || ""
      };

      for (const option of selectElement.options) {
        options.push({
          value: option.value,
          text: option.text.trim()
        });
      }
    }

    const result = {
      code,
      functionSelect,
      functionRole,
      options
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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "CLASSIFICATION_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "CLASSIFICATION_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.cl = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "GP_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "5",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "GP_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.eg = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "EMPT_TYPE_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "10",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "EMPT_TYPE_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.et = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const employeeTypeDetails = {
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

    if (employeeTypeDetails.code) {
      return employeeTypeDetails
    } {
      return "no employement type code is not exist no update for employment details.";
    }

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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "SALU_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "SALU_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.eti = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const employeetypeDetails = {
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
        employeetypeDetails.maritalStatuses.push({
          label: label ? label.textContent.trim() : "",
          checked: checkbox.checked
        });
      });
    }

    return employeetypeDetails;

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
    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "GEN_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "3",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "GEN_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.ge = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const gender = doc.querySelector("#ctl00_body_txtGenName")?.value?.trim() || "";
    const description = doc.querySelector("#ctl00_body_txtdesc")?.value?.trim() || "";

    const result = {
      code,
      gender,
      description
    };
    return result;

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
    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "MARST_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "8",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "MARST_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.ms = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const maritalStatus = doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      maritalStatus
    };
    return result;
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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "BLGRP_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1000",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const parser = new DOMParser();
    const doc = parser.parseFromString(searchResponse.rawData, "text/html");

    const link = doc.querySelector("tr.GridRow_Default a[href^='javascript:__doPostBack']");
    const href = link?.getAttribute("href") || "";
    const match = href.match(/__doPostBack\('([^']+)'/);

    const postBackId = match ? match[1] : "";
    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: postBackId,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "BLGRP_ID",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.bg = postBackResponse;

    const document = parser.parseFromString(postBackResponse.rawData, "text/html");

    const code = document.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const bloodgroup = document.querySelector("#ctl00_body_txtName")?.value?.trim() || "";

    const result = {
      code,
      bloodgroup
    };

    return result;
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

    const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __VIEWSTATE: details.viewState,
      __VIEWSTATEGENERATOR: details.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: details.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "ATT_TYPE_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$ContentSearch$butSearch": "Search",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "9",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: searchResponse.postBackCode,
      __EVENTARGUMENT: "",
      __VIEWSTATE: searchResponse.viewState,
      __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: searchResponse.eventValidation,
      "ctl00$hdnDateFormat": "dd/mm/yy",
      "ctl00$body$ContentSearch$cboCriteria": "ATT_TYPE_CODE",
      "ctl00$body$ContentSearch$txtContent": args.codeId,
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
      "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "1",
      "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
      "ctl00_body_grdsummary_ClientState": ""
    }, url);

    window.at = postBackResponse;

    const parser = new DOMParser();
    const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

    const code = doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";
    const attachmentType = doc.querySelector("#ctl00_body_txtDesc")?.value?.trim() || "";
    const expiration = doc.querySelector("#ctl00_body_ChkisExpire")?.checked || false;

    const result = {
      code,
      attachmentType,
      expiration
    };

    return result;
  }
});
