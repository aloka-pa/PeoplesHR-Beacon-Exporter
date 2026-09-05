(async function () {
    // Setup
    const digestkey1 = await BeaconBar.executeFunction('getDigest')("mvc=1&bs=4");
    const sl = await BeaconBar.getSharedData("sl");
    
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const baseUrl = `${location.origin}/${sl}`;

    // Step 1: Get the Attendance Application page
    const response1 = await fetch(
        `${baseUrl}/TNAVUE/app/AttendanceApproval/AttendanceApplication/1?mvc=1&bs=4&digest=${digestkey1.digest}`,
        requestOptions
    );
    const data1 = await response1.text();

    // Extract patterns from the page
    const empNumberMatch = data1.match(/empNumber=([^"&]+)/);
    const callBackMatch = data1.match(/(?:callBack=|SearchCallBack":")(.*?)(?:&|")/);
    const searchTokenMatch = data1.match(/searchToken=([^"&']+)/);

    const empNumber = empNumberMatch ? empNumberMatch[1] : "";
    const callBack = callBackMatch ? decodeURIComponent(callBackMatch[1]) : "";
    const searchToken = searchTokenMatch ? searchTokenMatch[1] : "";

    // Step 2: Search for employee
    const searchUrl = `${baseUrl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=All&searchQueryState=ActiveOnly&isMultiple=1&breadCrumbEnable=0&isDivLoading=0&displayName=&searchToken=${searchToken}`;
    
    const response2 = await fetch(searchUrl, requestOptions);
    const data2 = await response2.text();

    const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
    const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

    const empNumber2 = empNumberMatch2 ? empNumberMatch2[1] : "";
    const keyValue = keyValueMatch ? keyValueMatch[1] : "";

    // Step 3: Get attendance summary data
    const summaryBody = new URLSearchParams();
    summaryBody.append("empNumber", empNumber2);
    summaryBody.append("keyValue", keyValue);

    const response3 = await fetch(`${baseUrl}/AttendanceApproval/GetEmployeeSummary`, {
        method: "POST",
        headers: myHeaders,
        body: summaryBody,
        redirect: "follow"
    });
    
    const summaryData = await response3.json();

    // Helper function
    const getFieldValue = (array, uniqueId) => 
        array?.find(x => x.UniqueId === uniqueId)?.FieldValue || "0";

    // Structure and store result
    const result = {
        employee: {
            number: summaryData.EmployeeData.EmpDisplayNumber,
            name: summaryData.EmployeeData.EmpDisplayName,
            designation: summaryData.EmployeeData.Designation,
            completeName: summaryData.EmployeeData.EmpCompleteName
        },
        period: summaryData.SummaryPeriod,
        summary: {
            preOT: getFieldValue(summaryData.SummaryData_01, "DAT_SOT"),
            postOT: getFieldValue(summaryData.SummaryData_01, "DAT_EOT"),
            absentDays: getFieldValue(summaryData.SummaryData_01, "DAT_ABSENT_DAY"),
            lateHours: getFieldValue(summaryData.SummaryData_02, "DAT_SLATE"),
            earlyHours: getFieldValue(summaryData.SummaryData_02, "DAT_ELATE"),
            nopayDays: getFieldValue(summaryData.SummaryData_03, "DAT_NPY_DAYS"),
            workHours: getFieldValue(summaryData.SummaryData_03, "DAT_WORKHRS")
        },
        rawData: summaryData
    };

    window.attendanceSummary = result;
    return result;
})();