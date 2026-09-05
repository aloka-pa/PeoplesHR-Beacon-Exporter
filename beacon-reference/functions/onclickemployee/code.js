(async function (args) {
    //done
    const sl = await BeaconBar.getSharedData("sl");
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const response = await fetch(`${location.origin}/${sl}/EIM/AssignBankInformation.aspx`, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    });

    const detailsText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(detailsText, "text/html");

    const empNumber = doc.querySelector('input[id="ctl00_body_EmpSearch_txtEmpDisplayNumber"]')?.value || "";
    window.pqn = empNumber;

    const viewState = doc.querySelector("#__VIEWSTATE")?.value || "";
    const viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
    const eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || "";
    await BeaconBar.executeFunction("censusInformation")(args);

    const urlencoded = new URLSearchParams({
        scrollLeft: "",
        scrollTop: "",
        __EVENTTARGET: "GetSearchResult",
        __EVENTARGUMENT: "",
        __VIEWSTATE: viewState,
        __VIEWSTATEGENERATOR: viewStateGenerator,
        __SCROLLPOSITIONX: "0",
        __SCROLLPOSITIONY: "0",
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: eventValidation,
        "ctl00$hdnDateFormat": "m/d/yy",
        "ctl00$body$EmpSearch$hdnEmpNumber": empNumber,
        "ctl00$body$EmpSearch$hdnActiveInactiveToolbar": "",
        "ctl00$body$txtAccount": "",
        "ctl00$body$txtempnumber": empNumber,
        "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
        "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
        "ctl00$body$grdEmpBank$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "2",
        "ctl00_body_grdEmpBank_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
        "ctl00_body_grdEmpBank_ClientState": "",
        "ctl00$body$hdnCurrentAmount": "",
        "ctl00$body$hdnAmountType": "",
        "ctl00$body$txtEmpNo": empNumber
    });

    await fetch(`${location.origin}/${sl}/EIM/AssignBankInformation.aspx`, {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    });

    const digest2 = await BeaconBar.executeFunction('getDigest')("mvc=1");

    const myHeaders2 = new Headers();
    myHeaders2.append("accept", "*/*");
    myHeaders2.append("accept-language", "en-US,en;q=0.9");
    myHeaders2.append("cache-control", "no-cache");
    myHeaders2.append("x-requested-with", "XMLHttpRequest");


    const response2 = await fetch(`${location.origin}/${sl}/eimv9/employee/employee?mvc=1&digest=${digest2.digest}&_=${Date.now()}`, {
        method: "GET",
        headers: myHeaders2,
        redirect: "follow"
    });

    const text = await response2.text();
    const doc2 = parser.parseFromString(text, "text/html");
    const scriptTags = doc2.querySelectorAll("script");
    let modelObject = null;

    scriptTags.forEach(script => {
        if (script.textContent.includes("var model = {")) {
            const scriptContent = script.textContent;
            const modelStart = scriptContent.indexOf("var model = {");
            const modelEnd = scriptContent.indexOf("};", modelStart) + 1;
            const modelString = scriptContent.substring(modelStart + 12, modelEnd).trim();
            modelObject = JSON.parse(modelString);
        }
    });

    return {
        personalDetails: modelObject?.EmployeeDetails?.EmployeePersonalInfo,
        Emp_number: modelObject?.Emp_number
    };
});
