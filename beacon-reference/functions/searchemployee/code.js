(async function () {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const eligibility = await BeaconBar.executeFunction("eligibilityGroup")();
  BeaconBar.setSharedData("eligibility", eligibility);
  const digest = await BeaconBar.executeFunction("getDigest")(eligibility);
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  const url = `${reqOptions}Talent/SearchDialog.aspx?${eligibility}&digest=${digest.digest}`;

  const response = await fetch(url, requestOptions);
  const data = await response.text();
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

    return {
      viewState, viewStateGenerator, eventValidation, SupervisorEmpNumber, comapanydetails, eventarguement, employeeSearch
      , talentemployee , searchCreteria
    }
  }
 function extractDocumentOptions(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const select = doc.querySelector('select[name="TalentEmployeeSearch$ctl05$ctl21"]');
  if (!select) return [];

  const options = Array.from(select.options).map(opt => ({
    value: opt.value,
    label: opt.text.trim()
  }));

  return options;
}
 const options = extractDocumentOptions(data);
 BeaconBar.setSharedData("options", options);

  const extracteddata = extractViewState(data);
  BeaconBar.setSharedData("creteria",extracteddata )
  return extracteddata;
});
