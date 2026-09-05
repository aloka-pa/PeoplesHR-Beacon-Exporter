(async function () {
    //done
    // const menus = BeaconBar?.user?.metaData?.menus || [];
    // const targetUrl = "AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1";

    // const result = menus.find(url => url.includes(targetUrl));
    // const updateParams = result?.split('?')[1] || null;

    const url = await BeaconBar.executeFunction("updateUrlParams")("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1")


    const digest1 = await BeaconBar.executeFunction('getDigest')(url.updateParams);
    const sl = await BeaconBar.getSharedData('sl');
    const myHeaders = new Headers();
    myHeaders.append("accept", "text/html, */*; q=0.01");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("x-requested-with", "XMLHttpRequest")


    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${sl}/${url.updateUrl}&digest=${digest1.digest}`, requestOptions);
    const data1 = await response1.text();

    const parse = new DOMParser();
    const dom = parse.parseFromString(data1, "text/html");

    const csrfElement = dom.querySelector("#hdbAbsenceV9AFToken");
    const csrf = csrfElement ? csrfElement.value : null;
    window.csrf = csrf;

    const empNumberMatch = data1.match(/empNumber=([^&]*)/);
    const searchTokenMatch = data1.match(/searchToken=([^&]*)/);
    const digestMatch = data1.match(/digest=([A-Za-z0-9+/=]+)/);

    const empNumber = empNumberMatch ? decodeURIComponent(empNumberMatch[1]) : null;
    const searchToken = searchTokenMatch ? decodeURIComponent(searchTokenMatch[1]) : null;
    const digest = digestMatch ? digestMatch[1] : null;

    window.empLog = empNumber;

    if (!empNumber) return;

    const searchUrl = `${location.origin}/${sl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=MQA0ACwAMgA=&searchMode=2&searchQueryMode=all&searchQueryState=all&isMultiple=0&breadCrumbEnable=0&isDivLoading=1&elgmodid=14&searchToken=${searchToken}&digest=${digest}&_=${Date.now()}`;
    const response2 = await fetch(searchUrl, requestOptions);
    const data2 = await response2.text();
    const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
    const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

    return {
        empNumber2: empNumberMatch2 ? empNumberMatch2[1] : null,
        keyValue: keyValueMatch ? keyValueMatch[1] : null
    }
})