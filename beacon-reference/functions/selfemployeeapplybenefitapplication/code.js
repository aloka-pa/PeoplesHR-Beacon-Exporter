(async function () {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Benefitv9/Application/Application/?mvc=1');
    let url = updateurl.updateUrl || "Benefitv9/Application/Application/?mvc=1";

    const digestkey1 = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);
    const sl = await BeaconBar.getSharedData("sl");

    const myHeaders = new Headers({
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-requested-with" : "XMLHttpRequest"
    });

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${sl}/${url}&digest=${digestkey1.digest}`, requestOptions);
    const data1 = await response1.text();

    const objMatch = data1.match(/window\.BenefitApplicationObj\s*=\s*'([^']+)'/);
    let benefitObj = null;

    if (objMatch) {
        try {
            benefitObj = JSON.parse(objMatch[1]);
        } catch (e) { }
    }

    let empNumber = null;
    let benefitTypes = [];
    let appId = null;
    let keyValue = null;

    if (benefitObj) {
        empNumber = benefitObj.CurrentEmployeeNumber || null;
        appId = benefitObj.AppId || null;
        keyValue = benefitObj.KeyValue || null;
        betAppYear = benefitObj.BetAppYear || null
        benefitTypes = (benefitObj.BmBenefitTypes || []).map(x => ({
            BetCode: x.BetCode,
            BetName: x.BetName
        }));
    }

    const match = data1.match(/window\.BenefitApplicationObj\s*=\s*(['"])(.*?)\1;/s);

    const jsonString = match ? match[2] : null;
    const parsed = JSON.parse(jsonString);

    window.benefitdetails = parsed;

    return {
        empNumber: empNumber,
        appId: appId,
        keyValue: keyValue,
        betAppYear: betAppYear,
        benefitTypes: benefitTypes
    };
});
