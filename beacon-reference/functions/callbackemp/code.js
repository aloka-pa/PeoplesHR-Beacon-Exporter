(async function () {
  //done
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("priority", "u=0, i");
  myHeaders.append("x-requested-with", "XMLHttpRequest")
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const digest = await BeaconBar.executeFunction("getDigest")('CallbackID=18&ShowMode=3&ShowState=1&IsMultySelect=1');
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}absence/ess/LeaveCommonComponantESS.aspx?CallbackID=18&ShowMode=3&ShowState=1&IsMultySelect=1&digest=${digest.digest}`, requestOptions)
  const data = await response.text()
  function extractViewState(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const hdnurlESS = doc.querySelector("#hdnurlESS")?.value || "";
    const rawUrl = hdnurlESS;

    const queryString = rawUrl.split('?')[1];

    const params = new URLSearchParams(queryString);

    const empNumber = params.get('empNumber');
    const callBack = params.get('callBack');
    return {
      empNumber, callBack
    }
  }
  const datas = extractViewState(data);
  return datas;
})