(async function () {
    //done
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNAVUE/app/ShiftAdjustment/?mvc=1');
    let url;

    if (updateurl.updateUrl) {
        url = updateurl.updateUrl
    } else {
        url = "TNAVUE/app/ShiftAdjustment/?mvc=1&bs=4&self=1"
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

    const empNumberPattern = /window\.\$LoggedEmpNumber\s*=\s*'([^']+)'/;
    const empNumberMatch = data1.match(empNumberPattern);
    const empNumber = empNumberMatch ? empNumberMatch[1] : null;

    return empNumber;
});