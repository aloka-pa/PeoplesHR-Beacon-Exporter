(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/Reportsto.aspx?IsShowButtons=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  let url;
  let digest;

  if (args.type === "Indirect Subordinates") {
    digest = await BeaconBar.executeFunction("getDigest")("sid=0&sln=multiple&mode=basic&sm=activeonly&table=false&iv=getSearchResultMultipleIndirect&CloseMethod=getSearchResultMultipleIndirect()");
    url = `${reqOptions.sl}/EIM/EmployeeSearch.aspx?sid=0&sln=multiple&mode=basic&sm=activeonly&table=false&iv=getSearchResultMultipleIndirect&CloseMethod=getSearchResultMultipleIndirect()&digest=${digest.digest}`;
  } else if (args.type === "Direct Subordinates") {
    digest = await BeaconBar.executeFunction("getDigest")("sid=0&sln=multiple&mode=basic&sm=activeonly&table=false&iv=getSearchResultMultipleDirect&CloseMethod=getSearchResultMultipleDirect()");
    url = `${reqOptions.sl}/EIM/EmployeeSearch.aspx?sid=0&sln=multiple&mode=basic&sm=activeonly&table=false&iv=getSearchResultMultipleDirect&CloseMethod=getSearchResultMultipleDirect()&digest=${digest.digest}`;
  }

  const response = await fetch(`${location.origin}/${url}`, requestOptions);
  const text = await response.text();

  const dom = await BeaconBar.executeFunction('getDomExtract')(text);

  const employeeResponse = await BeaconBar.executeFunction('module')({
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": dom.viewState,
    "__VIEWSTATEGENERATOR": dom.viewStateGen,
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": dom.eventValidation,
    "RadWindowManager2_ClientState": "",
    "EmployeeSearch$ctl05$RadioButtonGroup1": "ctl07",
    "EmployeeSearch$ctl05$ctl14": "0",
    "EmployeeSearch$ctl05$ctl16": "",
    "EmployeeSearch$ctl05$ctl21": "",
    "EmployeeSearch$ctl05$ctl37": "Search",
    "EmployeeSearch_ctl06_ClientState": "",
    "hdnReturnId": ""
  }, url);

  window.beaurl = {
    url: url,
    payload: employeeResponse
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(employeeResponse.rawData, "text/html");
  const tbody = document.querySelector("#EmployeeSearch_ctl06_ctl00 > tbody");
  const rows = tbody.querySelectorAll("tr");

  const employees = [];

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const employeeId = cells[1]?.textContent.trim();
    const name = cells[2]?.textContent.trim();
    const dateOfJoining = cells[3]?.textContent.trim();

    if (employeeId && name && dateOfJoining && /^\d+$/.test(employeeId)) {
      employees.push({
        index: employees.length,
        employeeId,
        name,
        dateOfJoining
      });
    }
  });
  return employees;
});
