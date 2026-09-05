(async function () {
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };
    const digest = await BeaconBar.executeFunction("getDigest")('IsShowButtons=1')
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const response = await fetch(`${reqOptions}EIM/ContractExtend.aspx?IsShowButtons=1&digest=${digest.digest}`, requestOptions)
    const data = await response.text()
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
    talentemployee: doc.querySelector("#TalentEmployeeSearch_ctl05_ctl07")?.value || "",
    searchCreteria: doc.querySelector('#TalentEmployeeSearch_ctl05_ctl19')?.value || ""
  };
}
const datssss = extractViewState(data);
    return datssss;
})