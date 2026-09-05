(async function (args) {
    //done
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const userid = BeaconBar.user.metaData.empNo
    const response = await fetch(`${reqOptions}Widgets/Payslip/RequestPlaySlipQueryString?empNumber=${args.employeeid || userid}&payYear=${args.year}&pfCode=${args.pfCode}&payScheduleId=${args.schedule}&_=${Date.now()}`, requestOptions)
    const data = await response.json();
    return data;
})