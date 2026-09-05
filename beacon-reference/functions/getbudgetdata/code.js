(async function getBudgetData(wfmid) {
    try {
        const response = await fetch(`https://${location.host}/hr/RecruitmentV9/RecruitmentBudget/GetBudgetData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `wfMainId=${wfmid}`,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
    }
})