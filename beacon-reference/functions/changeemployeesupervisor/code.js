(async function (id) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const digest = await BeaconBar.executeFunction('getDigest')("sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResultSup()");
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();

    const response = await fetch(`${reqOptions}/EIM/EmployeeSearch.aspx?sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResultSup()&digest=${digest.digest}`, requestOptions);
    const text = await response.text();
    const state = await BeaconBar.executeFunction("getDomExtract")(text);

    const urlencoded = new URLSearchParams();
    urlencoded.append("__EVENTTARGET", "");
    urlencoded.append("__EVENTARGUMENT", "");
    urlencoded.append("__LASTFOCUS", "");
    urlencoded.append("__VIEWSTATE", state.viewState);
    urlencoded.append("__VIEWSTATEGENERATOR", state.viewStateGen);
    urlencoded.append("__VIEWSTATEENCRYPTED", "");
    urlencoded.append("__EVENTVALIDATION", state.eventValidation);
    urlencoded.append("RadWindowManager2_ClientState", "");
    urlencoded.append("EmployeeSearch$ctl05$RadioButtonGroup1", "ctl12");
    urlencoded.append("EmployeeSearch$ctl05$ctl14", "0");
    urlencoded.append("EmployeeSearch$ctl05$ctl16", id);
    urlencoded.append("EmployeeSearch$ctl05$ctl21", "");
    urlencoded.append("EmployeeSearch$ctl05$ctl37", "Search");
    urlencoded.append("EmployeeSearch_ctl06_ClientState", "");
    urlencoded.append("hdnReturnId", "");

    const requestOptions1 = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    const response2 = await fetch(`${reqOptions}/EIM/EmployeeSearch.aspx?sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResultSup()&digest=${digest.digest}`, requestOptions1);
    const text2 = await response2.text();
    const state2 = await BeaconBar.executeFunction("getDomExtract")(text2);

    const urlencoded2 = new URLSearchParams();
    urlencoded2.append("__EVENTTARGET", "EmployeeSearch$ctl06$ctl00$ctl04$ctl01");
    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__LASTFOCUS", "");
    urlencoded2.append("__VIEWSTATE", state2.viewState);
    urlencoded2.append("__VIEWSTATEGENERATOR", state2.viewStateGen);
    urlencoded2.append("__VIEWSTATEENCRYPTED", "");
    urlencoded2.append("__EVENTVALIDATION", state2.eventValidation);
    urlencoded2.append("RadWindowManager2_ClientState", "");
    urlencoded2.append("EmployeeSearch$ctl05$RadioButtonGroup1", "ctl12");
    urlencoded2.append("EmployeeSearch$ctl05$ctl14", "0");
    urlencoded2.append("EmployeeSearch$ctl05$ctl16", id);
    urlencoded2.append("EmployeeSearch$ctl05$ctl21", "");
    urlencoded2.append("EmployeeSearch_ctl06_ClientState", "");
    urlencoded2.append("hdnReturnId", "");

    const requestOptions2 = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded2,
        redirect: "follow"
    };

    const response3 = await fetch(`${reqOptions}/EIM/EmployeeSearch.aspx?sid=0&sln=single&mode=basic&sm=activeonly&table=false&iv=getSearchResult&CloseMethod=getSearchResultSup()&digest=${digest.digest}`, requestOptions2);
    const text3 = await response3.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text3, "text/html");

    const row = doc.querySelector('tr[id^="EmployeeSearch_ctl06_ctl00__"]');
    const cells = row?.querySelectorAll("td");

    return {
        employeeId: cells?.[0]?.textContent.trim(),
        employeeName: cells?.[1]?.textContent.trim()
    };
});
