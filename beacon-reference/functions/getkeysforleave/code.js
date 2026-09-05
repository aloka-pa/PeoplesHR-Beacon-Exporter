(async function () {
    //done
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("content-type", "application/json; charset=utf-8");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const reqOptions = BeaconBar.executeFunction("reqOptions")();
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    const response = await fetch(`${reqOptions}CommonComponents/Search/GetKey/?_=${Date.now()}`, requestOptions)
    const data = await response.text()
    const message = JSON.parse(data);
    const messages = message.Message;
    return messages;

})