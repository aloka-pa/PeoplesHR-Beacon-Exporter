(async function () {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  const response = await fetch(`${reqOptions}WorkflowV5/Approval/Summary/?bs=4&ModuleID=1014`, requestOptions);
  const data = await response.text();

  function extracted(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const anchors = doc.querySelectorAll("a[onclick]");
    const results = Array.from(anchors).map(a => {
      const onclick = a.getAttribute("onclick");
      const match = onclick.match(/return\s+(\w+)\(([^)]*)\)/);

      let fnName = null;
      let params = [];
      if (match) {
        fnName = match[1];
        params = match[2].split(",").map(p => p.trim());
      }

      return {
        text: a.textContent.trim(),
        params: params,
      };
    });

    return results; 
  }

  const dats = extracted(data);
  return dats; 
});