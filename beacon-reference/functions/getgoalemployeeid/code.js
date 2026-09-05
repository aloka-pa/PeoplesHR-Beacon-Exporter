(async function () {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const response = await fetch(`${reqOptions}PerfV8//GoalPlanning/_EmployeeInformationHeader/?_=${Date.now()}`, requestOptions)
    const data = await response.text()
    const match = data.match(/Emp_number=([^'"]+)/);
const empNumber = match ? match[1] : null;
    return empNumber;
})