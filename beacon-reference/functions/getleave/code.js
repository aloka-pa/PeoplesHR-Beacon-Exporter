(async function (args) {
  //done
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('absence/ess/ViewSubbordinateLeaveDetail.aspx?subo=0');
  let url;
  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "absence/ess/ViewSubbordinateLeaveDetail.aspx?subo=0"
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  debugger;

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const digest = await BeaconBar.executeFunction("getDigest")(updateurl.updateParams);
  const response = await fetch(`${reqOptions}${url}&digest=${digest.digest}`, requestOptions)
  const data = await response.text()
  function extractViewState(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const SupervisorEmpNumber = doc.querySelector("#body_hdnSupervisorEmpNumber")?.value || "";

    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    const comapanydetails = doc.querySelector("#body_hdnIsCompanyDetail")?.value || "";
    const eventarguement = doc.querySelector("#__EVENTARGUMENT")?.value || "";



    return {
      viewState, viewStateGenerator, eventValidation, SupervisorEmpNumber, comapanydetails, eventarguement

    }
  }
  const datas = extractViewState(data)
  BeaconBar.setSharedData("getLeave", datas)
})