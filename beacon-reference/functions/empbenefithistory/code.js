(async function () {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Benefitv9/AdminHistory/AdminHistory/?mvc=1');

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

    const response1 = await fetch(`${location.origin}/${sl}/${updateurl.updateUrl}&digest=${digestkey1.digest}`, requestOptions);
    const data1 = await response1.text();

    // const parse = new DOMParser();
    // const dom = parse.parseFromString(data1, "text/html");

    // const csrfElement = dom.querySelector("#hdbAbsenceV9AFToken");
    // const csrf = csrfElement ? csrfElement.value : null;
    // window.csrf = csrf;

    const empNumberMatch = data1.match(/"EmpNumber":"([^"]+)"/);
    const searchTokenMatch = data1.match(/"searchToken":"([^"]+)"/);
    // const digestMatch = data1.match(/digest=([A-Za-z0-9+/=]+)/);
    const callbackMatch = data1.match(/"CallBackMethod":"([^"]+)"/);
    const logEmpNumberMatch = data1.match(/"LogEmpNumber":"([^"]+)"/);


    const empNumber = empNumberMatch ? empNumberMatch[1] : null;
    const searchToken = searchTokenMatch ? searchTokenMatch[1] : null;
    // const digest = digestMatch ? digestMatch[1] : null;
    const callback = callbackMatch ? callbackMatch[1] : null;
    const logEmpNumber = logEmpNumberMatch ? logEmpNumberMatch[1] : null;

    const raw = {
        empNumber: empNumber,
        callBack: callback,
        searchMode: "2",
        searchQueryMode: "all",
        searchQueryState: "activeonly",
        breadCrumbEnable: "0",
        isDivLoading: "0",
        isShowDisplayName: "0",
        isMultiple: "0",
        searchToken: searchToken,
    };
    const params = new URLSearchParams(raw).toString();
    const digestkey = await BeaconBar.executeFunction('getDigest')(params);

    const searchUrl = `${location.origin}/${sl}/CommonComponents/Search/Search?empNumber=${logEmpNumber}&callBack=${callback}&searchMode=2&searchQueryMode=all&searchQueryState=activeonly&breadCrumbEnable=0&isDivLoading=0&isShowDisplayName=0&isMultiple=0&searchToken=${searchToken}&digest=${digestkey.digest}&_=${Date.now()}`;
    const response2 = await fetch(searchUrl, requestOptions);
    const data2 = await response2.text();
    const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
    const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

    window.empLog = {
        empNumber2: empNumberMatch2 ? empNumberMatch2[1] : null,
        keyValue: keyValueMatch ? keyValueMatch[1] : null
    }

    return {
        empNumber2: empNumberMatch2 ? empNumberMatch2[1] : null,
        keyValue: keyValueMatch ? keyValueMatch[1] : null
    }
})