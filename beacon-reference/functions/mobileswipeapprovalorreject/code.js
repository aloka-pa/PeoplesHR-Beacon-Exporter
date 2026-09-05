(async function (comment, args) {
  const dta = BeaconBar.getSharedData("util");
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const url = `${reqOptions}TNA/MobileSwipeApproval.aspx?WFMainID=${dta.args.WorkflowMainId}&Allowedit=0&CATID=0&digest=${dta.digest.digest}`;

  const headers = {
    "Accept": "*/*",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-requested-with": "XMLHttpRequest"
  };

  const formData = new URLSearchParams();
  formData.append("ctl00$main$RadScriptManager", "ctl00$body$UpdatePanel4|ctl00$body$btnSubmit");
  formData.append("ctl00_main_RadScriptManager_HiddenField", "");
  formData.append("__EVENTTARGET", "");
  formData.append("__EVENTARGUMENT", "");
   formData.append("ctl00_main_RadWindowManager1_ClientState", "");
  formData.append("__VIEWSTATE", dta.payload.viewState);
  formData.append("__VIEWSTATEGENERATOR", dta.payload.viewStateGen);

  // ✅ use raw key names
  formData.append("ctl00$body$grdEmployees$ctl00$ctl04$txtComments", comment);
  formData.append("__VIEWSTATEENCRYPTED","")
  formData.append("__EVENTVALIDATION",dta.payload.eventValidation )
  formData.append("ctl00$body$hdnLat", dta.payload.latitude);
  formData.append("ctl00$body$hdnLongi", dta.payload.longitude);
  formData.append("ctl00$body$hdnJSON_DataHolder", dta.payload.JSON_DataHolder);
  formData.append("ctl00$body$HdnGeoUrl", dta.payload.HdnGeoUrl);
  formData.append("ctl00$body$Hdngeo", dta.payload.ctl00_body_Hdngeo);
  formData.append("ctl00$hdnDisableModuleQuickMenuIcon", "");
  formData.append("ctl00$hdnCulturDateFormat", dta.payload.DateFormat);

  formData.append("__ASYNCPOST", "true");
  formData.append("ctl00$body$btnSubmit", args);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: formData,
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.text();
  } catch (error) {
  }
});
