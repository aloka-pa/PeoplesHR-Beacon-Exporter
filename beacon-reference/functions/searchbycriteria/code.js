(async function (args) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");

    const state = BeaconBar.getSharedData("selectEmployee") || BeaconBar.getSharedData("creteria");

    const urlencoded = new URLSearchParams();
    urlencoded.append("RadScriptManager1_HiddenField", ";;Telerik.Web.UI, Version=2008.1.415.35, Culture=neutral, PublicKeyToken=121fae78165ba3d4:en-US:493502ac-fd18-4d2a-b4d2-e3cf218d0d84:fe8d4455:c7991a52:cc662d70:f52b3883:7e0e28a2");
    urlencoded.append("__EVENTTARGET", "TalentEmployeeSearch$ctl05$ctl21");
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__LASTFOCUS", "");
    urlencoded.append("__VIEWSTATE", state.viewState);
    urlencoded.append("__VIEWSTATEGENERATOR", state.viewStateGenerator);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", state.eventValidation);
    urlencoded.append("RadWindowManager1_ClientState", "");
    urlencoded.append("TalentEmployeeSearch$ctl05$ctl14", "0");
    urlencoded.append("TalentEmployeeSearch$ctl05$ctl16", "");
    urlencoded.append("TalentEmployeeSearch$ctl05$RadioButtonGroup1", state.searchCreteria);
    urlencoded.append("TalentEmployeeSearch$ctl05$ctl21", args.creteria);
    urlencoded.append("TalentEmployeeSearch_ctl06_ClientState", "");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow"
    };

    const eligibility = BeaconBar.getSharedData("eligibility");
    const digest = await BeaconBar.executeFunction("getDigest")(eligibility);
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();

    const response = await fetch(`${reqOptions}Talent/SearchDialog.aspx?${eligibility}&digest=${digest.digest}`, requestOptions);

    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.text();

    function extractClassificationOptions(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const select = doc.querySelector('select[name="TalentEmployeeSearch$ctl05$ctl23"]');
      if (!select) return [];

      return Array.from(select.options).map((option, index) => ({
        index: index + 1,
        value: option.value,
        label: option.textContent.trim()
      }));
    }

    function extractViewState(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      return {
        viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
        viewStateGenerator: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
        eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || "",
        SupervisorEmpNumber: doc.querySelector("#body_hdnSupervisorEmpNumber")?.value || "",
        comapanydetails: doc.querySelector("#body_hdnIsCompanyDetail")?.value || "",
        eventarguement: doc.querySelector("#__EVENTARGUMENT")?.value || "",
        employeeSearch: doc.querySelector("label[for='TalentEmployeeSearch_ctl05_ctl07']")?.innerText || "",
        talentemployee: doc.querySelector("#TalentEmployeeSearch_ctl05_ctl07")?.value || "",
        searchCreteria: doc.querySelector('#TalentEmployeeSearch_ctl05_ctl19')?.value || ""
      };
    }

    const classifications = extractClassificationOptions(data);
    const newState = extractViewState(data);

    BeaconBar.setSharedData("searchBycreteria", newState);

    return classifications;

  } catch (error) {
    return { success: false, message: error.message };
  }
});
