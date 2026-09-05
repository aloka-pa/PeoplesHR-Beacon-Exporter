(async function () {
  //done
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("priority", "u=1, i");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const digest = await BeaconBar.executeFunction("getDigest")("mvc=1&bs=4");
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}AbsenceV9/ShortLeaveApplication/ShortLeaveApplication?mvc=1&bs=4&digest=${digest.digest}`, requestOptions)
  const data = await response.text();
  function extractViewState(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const token = doc.querySelector("#hdbAbsenceV9AFToken")?.value || "";

    const scripts = Array.from(doc.querySelectorAll("script"));
    let match = null;

    for (const script of scripts) {
      const scriptText = script.textContent || "";
      const result = scriptText.match(/var\s+modelShortLeave\s*=\s*'([^']*)';/);
      if (result) {
        match = result[1]; // Get the actual JSON string
        break;
      }
    }

    return {
      token,
      match: JSON.parse(match)
    };
  }

  const datatoken = extractViewState(data);

  return datatoken;
})