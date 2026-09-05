(async function (args) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const digest = await BeaconBar.executeFunction("getDigest")(`WFMainID=${args.WorkflowMainId}&Allowedit=0&CATID=0`);
  const reqOptions = await BeaconBar.executeFunction("reqOptions")()
  const response = await fetch(`${reqOptions}TNA/MobileSwipeApproval.aspx?WFMainID=${args.WorkflowMainId}&Allowedit=0&CATID=0&digest=${digest.digest}`, requestOptions)
  const data = await response.text();
  function approvepayload(html) {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    const details = {
      viewState: document.querySelector('#__VIEWSTATE')?.value || '',
      eventValidation: document.querySelector('#__EVENTVALIDATION')?.value || '',
      viewStateGen: document.querySelector('#__VIEWSTATEGENERATOR')?.value || '',
      longitude: document.querySelector("#ctl00_body_hdnLongi")?.value || "",
      latitude: document.querySelector("#ctl00_body_hdnLat")?.value || "",
      JSON_DataHolder: document.querySelector("#ctl00_body_hdnJSON_DataHolder")?.value || "",
      HdnGeoUrl: document.querySelector("#ctl00_body_HdnGeoUrl")?.value || "",
      DateFormat: document.querySelector("#ctl00_hdnCulturDateFormat")?.value || "",
      ctl00_body_Hdngeo : document.querySelector("#ctl00_body_Hdngeo")?.value || "",
      rawData: html
    }

    return details
  }
  const payload = approvepayload(data);
  const util = { payload, args, digest };
  BeaconBar.setSharedData("util", util)
  function extractEmployeeDataFromHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const table = doc.getElementById("ctl00_body_grdEmployees_ctl00");
  if (!table) return [];

  const rows = table.querySelectorAll("tbody tr");
  const result = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 8) return; 

    const name = cells[0]?.textContent.trim();
    if (!name) return;

    const employee = {
      name,
      date: cells[1]?.querySelector("span")?.textContent.trim() || "",
      time: cells[2]?.querySelector("span")?.textContent.trim() || "",
      shift: cells[3]?.querySelector("span")?.textContent.trim() || "",
      location: cells[4]?.querySelector("span")?.textContent.trim() || "",
      distance: cells[5]?.querySelector("span")?.textContent.trim() || "",
      comment: cells[6]?.textContent.trim() || "",
      approvalComment: cells[7]?.querySelector("input")?.value.trim() || ""
    };

    result.push(employee);
  });

  return result;
}


  const extractEmployeeData = extractEmployeeDataFromHTML(data)
  return extractEmployeeData;

})