(async function(ApprovalComment){
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("content-type", "application/json");
    
    const objects = BeaconBar.getSharedData("selected");
    
    const processedData = objects.map((entry, index) => {
        const updatedEntry = JSON.parse(JSON.stringify(entry));
        if (index === 0) {
            updatedEntry.IsSelected = true;
        }
        if (updatedEntry.IsSelected && updatedEntry.MClockData) {
            updatedEntry.MClockData.ApprovalComment = ApprovalComment;
        } 
        return updatedEntry;
    });
        const raw = JSON.stringify(processedData);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };
    
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const response = await fetch(`${reqOptions}tnav9/api/ManualInOut/RejectManualData/`, requestOptions);
    const data = await response.text();
    
    return data;
})