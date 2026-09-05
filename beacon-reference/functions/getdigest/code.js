(async function (params) {
    //done
    const sl = await BeaconBar.getSharedData("sl");
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("x-requested-with", "XMLHttpRequest")
    const urlencoded = new URLSearchParams();
    urlencoded.append("para", params);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow"
    };

    const res = await fetch(`${location.origin}/${sl}/home/beaconutil`, requestOptions);
    return res.json();
});