(async function () {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Benefitv9/History/BenefitHistory/?mvc=1&bs=4');
    let url = updateurl.updateUrl || "Benefitv9/History/BenefitHistory/?mvc=1&bs=4";

    const digestkey1 = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);
    const sl = await BeaconBar.getSharedData("sl");

    const myHeaders = new Headers({
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded"
    });

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${sl}/${url}&digest=${digestkey1.digest}`, requestOptions);
    const data1 = await response1.text();

    const match = data1.match(/"CurrentEmployeeNumber"\s*:\s*"([^"]+)"/);

    return match ? match[1] : null;
});
