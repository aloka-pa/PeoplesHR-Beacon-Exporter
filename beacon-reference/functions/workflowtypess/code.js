(async function (wfTypeCode , wfModuleCode) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("content-type", "application/json; charset=UTF-8");

    const reqOptions = BeaconBar.executeFunction("reqOptions")();

    const raw = JSON.stringify({
        wfTypeCode: wfTypeCode,
        wf_tab: "0",
        wfModuleCode : wfModuleCode
        });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`${reqOptions}workflowv5/Approval/GetWorkflowTypeData/`, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text(); 
        return data;

    } catch (error) {
    }
});