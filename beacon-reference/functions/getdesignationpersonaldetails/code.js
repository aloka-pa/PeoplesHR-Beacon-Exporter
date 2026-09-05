(async function () {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const digest = await BeaconBar.executeFunction("getDigest")("subordinate=0&mvc=1");

    const url = `${reqOptions}EIMV9/Personal/Personal?subordinate=0&mvc=1&digest=${digest.digest}&_=${Date.now()}`;
    const response = await fetch(url, requestOptions);
    const data = await response.text();

    const match = data.match(/var\s+modelPersonal\s*=\s*({[\s\S]*?});/);

    if (match && match[1]) {
      const objectOnlyText = match[1];

      const objectOnly = (new Function(`return ${objectOnlyText}`))();


      return objectOnly.EmployeeInfor.ObjDesignation;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
});
