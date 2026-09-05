(async function (req , evaluationId) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`${req}PerfV8//api/FinalAssessment/GetStages?evaluationId=${evaluationId}`, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();  
        return data;
    } catch (error) {
    }
});
