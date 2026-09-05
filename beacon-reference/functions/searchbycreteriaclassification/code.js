(async function (args) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cache-control", "max-age=0");
    myHeaders.append("content-type", "application/x-www-form-urlencoded");

    const state = BeaconBar.getSharedData("searchBycreteria");
    const selectedCreteria = BeaconBar.getSharedData("selectedCreteria");
    const eligibility = BeaconBar.getSharedData("eligibility");

    const urlencoded = new URLSearchParams();
    urlencoded.append("RadScriptManager1_HiddenField", ";;Telerik.Web.UI, Version=2008.1.415.35, Culture=neutral, PublicKeyToken=121fae78165ba3d4:en-US:493502ac-fd18-4d2a-b4d2-e3cf218d0d84:fe8d4455:c7991a52:cc662d70:f52b3883:7e0e28a2");
    urlencoded.append("__EVENTTARGET", "");
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
    urlencoded.append("TalentEmployeeSearch$ctl05$ctl21", selectedCreteria);
    urlencoded.append("TalentEmployeeSearch$ctl05$ctl23", args.selectedClassification || "");
    urlencoded.append("TalentEmployeeSearch$ctl05$ctl35", "Search");
    urlencoded.append("TalentEmployeeSearch$ctl06$ctl00$ctl02$ctl01$colMultiEmpCheckSelectCheckBox", "on");
    urlencoded.append("TalentEmployeeSearch_ctl06_ClientState", "");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    const digest = await BeaconBar.executeFunction("getDigest")(eligibility);
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();

    const response = await fetch(`${reqOptions}Talent/SearchDialog.aspx?${eligibility}&digest=${digest.digest}`, requestOptions);
    const htmlString = await response.text();
     function extractViewState(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const SupervisorEmpNumber = doc.querySelector("#body_hdnSupervisorEmpNumber")?.value || "";

    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    const comapanydetails = doc.querySelector("#body_hdnIsCompanyDetail")?.value || "";
    const eventarguement = doc.querySelector("#__EVENTARGUMENT")?.value || "";
    const employeeSearch = doc.querySelector("label[for='TalentEmployeeSearch_ctl05_ctl07']").innerText;
    const talentemployee = doc.querySelector("#TalentEmployeeSearch_ctl05_ctl07")?.value || "";
    const searchCreteria = doc.querySelector('#TalentEmployeeSearch_ctl05_ctl19')?.value || "" ;
    const totalSubmit = doc.querySelector('#TalentEmployeeSearch_ctl05_ctl07')?.value || "" ;
    return {
      viewState, viewStateGenerator, eventValidation, SupervisorEmpNumber, comapanydetails, eventarguement, employeeSearch
      , talentemployee , searchCreteria , totalSubmit
    }
  }
  const finaloutputViewState = extractViewState(htmlString);
  BeaconBar.setSharedData("finaloutputViewState", finaloutputViewState)
    return htmlString; 
});
