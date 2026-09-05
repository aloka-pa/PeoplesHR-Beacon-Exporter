(async function () {
    //done
    const sl = await BeaconBar.getSharedData('sl');
    const myHeaders = new Headers();
    myHeaders.append("__cfafvalue", window.csrf);
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const raw = JSON.stringify({
        "EmpNumber": window.logKey
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${sl}/AbsenceV9/api/LeaveApplication/GetEntitledLeaveYears/`, requestOptions);
    const year = await response.json();
    const yearCode = year[0]?.YearCode;
    return yearCode || "";
})