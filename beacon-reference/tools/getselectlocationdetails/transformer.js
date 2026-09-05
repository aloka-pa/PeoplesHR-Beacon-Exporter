(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Location.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const details = await BeaconBar.executeFunction('getApiList')("Location");

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const initialFormData = new FormData();
  initialFormData.append("scrollLeft", "0");
  initialFormData.append("scrollTop", "0");
  initialFormData.append("__EVENTTARGET", "");
  initialFormData.append("__EVENTARGUMENT", "");
  initialFormData.append("__VIEWSTATE", details.viewState);
  initialFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  initialFormData.append("__VIEWSTATEENCRYPTED", "");
  initialFormData.append("__EVENTVALIDATION", details.eventValidation);
  initialFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  initialFormData.append("ctl00$body$hdnIsHead", "");
  initialFormData.append("ctl00$body$hdnEditItemIndex", "");
  initialFormData.append("ctl00_body_RadWindowManager1_ClientState", "");
  initialFormData.append("ctl00$body$ContentSearch$cboCriteria", "LOC_CODE");
  initialFormData.append("ctl00$body$ContentSearch$txtContent", "");
  initialFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  initialFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  initialFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
  initialFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  initialFormData.append("ctl00_body_grdSummary_ClientState", "");
  initialFormData.append("ctl00$body$butNew", "New");
  initialFormData.append("ctl00$body$hdnDefCountry", "-1");

  const fetchEditResponse = await fetch(`${location.origin}/${reqOptions.sl}/EIM/Location.aspx`, {
    method: "POST",
    headers: myHeaders,
    body: initialFormData,
    redirect: "follow"
  });

  const html = await fetchEditResponse.text();
  const countryDetails = await BeaconBar.executeFunction("getDomExtract")(html);
  window.viewState = countryDetails;

  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  function extractOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return [];
    return Array.from(select.options).map(option => ({
      value: option.value,
      label: option.text.trim()
    }));
  }

  const countries = extractOptions("ctl00_body_ddlCountry");

  // const FuseJS = await BeaconBar.executeFunction("getTool")("fuse");
  // const countryFuse = new FuseJS(countries, {
  //   keys: ['label'],
  //   threshold: 0.1
  // });
  // const countryCode = countryFuse.search(args.countryName).map(({ item }) => item).slice(0, 5);


  // const provinceCode = await BeaconBar.executeFunction("getProvinceCode")(countryCode[0].value);

  // const provinceFuse = new FuseJS(provinceCode, {
  //   keys: ['label'],
  //   threshold: 0.1
  // });
  // const provinceCode = provinceFuse.search(args.provinceName).map(({ item }) => item).slice(0, 5);

  // const districtCode = await BeaconBar.executeFunction("getDistrictCode")(countryCode[0].value, args.provinceValue);

  // return {
  //   countryCode,
  //   provinceCode,
  //   districtCode
  // };
  return countries;
})
