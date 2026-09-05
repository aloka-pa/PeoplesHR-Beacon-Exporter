(async function () {
    //done
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

    const response1 = await fetch(`${location.origin}/${sl}/TNAVUE/app/ShiftAdjustment?mvc=1&bs=4&digest=${digestkey1.digest}`,requestOptions);
    const data1 = await response1.text();

    const empNumberPattern = /empNumber=([^"&]+)/;
    const callBackPattern = /(?:callBack=|SearchCallBack":")(.*?)(?:&|")/;
    const elgModIdPattern = /elgmodid=([^"&]+)/;
    const elgGrpIdPattern = /elggrpid=([^"&]+)/;
    const elgParamPattern = /ElgParam=([^"&]+)/;
    const searchTokenPattern = /searchToken=([^"&']+)/;

    const empNumberMatch = data1.match(empNumberPattern);
    const callBackMatch = data1.match(callBackPattern);
    const elgModIdMatch = data1.match(elgModIdPattern);
    const elgGrpIdMatch = data1.match(elgGrpIdPattern);
    const elgParamMatch = data1.match(elgParamPattern);
    const searchTokenMatch = data1.match(searchTokenPattern);

    const empNumber = empNumberMatch ? empNumberMatch[1] : "";
    const callBack = callBackMatch ? decodeURIComponent(callBackMatch[1]) : "";
    // const elgModId = elgModIdMatch ? elgModIdMatch[1] : "";
    // const elgGrpId = elgGrpIdMatch ? elgGrpIdMatch[1] : "";
    // const elgParam = elgParamMatch ? elgParamMatch[1] : "";
    const searchToken = searchTokenMatch ? searchTokenMatch[1] : "";

    const searchUrl = `${location.origin}/${sl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=All&searchQueryState=ActiveOnly&isMultiple=1&breadCrumbEnable=0&isDivLoading=0&displayName=&searchToken=${searchToken}`;
    
    const response2 = await fetch(searchUrl, requestOptions);
    const data2 = await response2.text();

    const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
    const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

    const empNumber2 = empNumberMatch2 ? empNumberMatch2[1] : "";
    const keyValue = keyValueMatch ? keyValueMatch[1] : "";

    window.empLog = {
        empNumber2,
        keyValue
    };

    return {
        empNumber2,
        keyValue
    };
});
