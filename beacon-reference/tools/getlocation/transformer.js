(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");

  const details = await BeaconBar.executeFunction("getAllApi")("Location", args.locationCode);

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
  urlencoded.append("ctl00$body$ContentSearch$txtContent", args.locationCode);
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

  const response = await fetch(`${location.origin}/hr/EIM/Location.aspx`, requestOptions);
  const html = await response.text();
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  const detail = {
    viewState: document.querySelector('#__VIEWSTATE')?.value || '',
    eventValidation: document.querySelector('#__EVENTVALIDATION')?.value || '',
    viewStateGen: document.querySelector('#__VIEWSTATEGENERATOR')?.value || ''
  };

  function extractOptions(selectId) {
    const select = document.getElementById(selectId);
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
    code: document.querySelector('#ctl00_body_txtCode')?.value || "",
    location: document.querySelector('#ctl00_body_txtName')?.value || "",
    abbreviation: document.querySelector('#ctl00_body_txtAbbreviation')?.value || "",
    telephone: document.querySelector('#ctl00_body_txttp')?.value || "",
    fax: document.querySelector('#ctl00_body_txtFax')?.value || "",
    email: document.querySelector('#ctl00_body_txtemail')?.value || "",
    url: document.querySelector('#ctl00_body_txturl')?.value || "",
    address: document.querySelector('#ctl00_body_txtaddress')?.value.trim() || "",
    country: {
      text: document.querySelector('#ctl00_body_ddlCountry option:checked')?.textContent.trim() || "",
      value: document.querySelector('#ctl00_body_ddlCountry')?.value || ""
    },
    province: {
      text: document.querySelector('#ctl00_body_ddlProvince option:checked')?.textContent.trim() || "",
      value: document.querySelector('#ctl00_body_ddlProvince')?.value || ""
    },
    district: {
      text: document.querySelector('#ctl00_body_ddlDistrict option:checked')?.textContent.trim() || "",
      value: document.querySelector('#ctl00_body_ddlDistrict')?.value || ""
    },
    timezone: document.querySelector('#ctl00_body_cboTimeZone')?.value || "",
    headOfLocation: document.querySelector('#ctl00_body_txtHeadName')?.value || "",
    headTitle: document.querySelector('#ctl00_body_txtHTitle')?.value || "",
    administrator: document.querySelector('#ctl00_body_txtAdminName')?.value || "",
    logo: document.querySelector('#ctl00_body_filMyFile')?.value || "",
    logoPreviewUrl: document.querySelector('#ctl00_body_imgTempEMPImage')?.src || ""
  };

  window.viewData = detail;

  return { result };
});
