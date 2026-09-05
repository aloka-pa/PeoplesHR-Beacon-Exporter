(async function () {
    //done
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNAV9/ManualInOut/ManualInOut/0?mvc=1');
    let url;

    if(updateurl.updateUrl){
        url = updateurl.updateUrl
    }else{
        url = "TNAV9/ManualInOut/ManualInOut/0?mvc=1"
    }

    const digestkey1 = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);
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

    const response1 = await fetch(`${location.origin}/${sl}/${url}&digest=${digestkey1.digest}`, requestOptions);
    const data1 = await response1.text();

    const empNumberPattern = /"EmployeeSearchURL":".*?empNumber=([^"&]+)/;
    const searchTokenPattern = /searchToken=([^"&]+)/;
    const callBackPattern = /(?:callBack=|SearchCallBack":")(.*?)(?:&|")/;

    // Extracting values using regex
    const empNumberMatch = data1.match(empNumberPattern);
    const searchTokenMatch = data1.match(searchTokenPattern);
    const callBackMatch = data1.match(callBackPattern);

    // Extracted values
    const empNumber = empNumberMatch ? empNumberMatch[1] : null;
    const searchToken = searchTokenMatch ? searchTokenMatch[1] : null;
    const callBack = callBackMatch ? decodeURIComponent(callBackMatch[1]) : null;

    const searchUrl = `${location.origin}/${sl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=all&searchQueryState=activeonly&breadCrumbEnable=0&isDivLoading=0&isShowDisplayName=0&isMultiple=0&searchToken=${searchToken}&_=${Date.now()}`;
    const response2 = await fetch(searchUrl, requestOptions);
    const data2 = await response2.text();

    const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
    const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

    const empNumber2 = empNumberMatch2 ? empNumberMatch2[1] : null;
    const keyValue = keyValueMatch ? keyValueMatch[1] : null;


    window.empLog = {
        empNumber2: empNumber2,
        keyValue: keyValue
    };


    return {
        empNumber2,
        keyValue
    };
});
