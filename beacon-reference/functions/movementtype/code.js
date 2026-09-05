(async function (args) {
    const reqOptions = BeaconBar.executeFunction("reqOptions")();
    const baseUrl = `${reqOptions}ELC/ElcType/GetElcTypeSummary`;
    
    const headers = new Headers({
        "accept": "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest"
    });

    const allResults = [];

    for (let page = 2; page <= args.totalCount; page++) {
        const params = new URLSearchParams({
            _search: "false",
            nd: Date.now().toString(),
            rows: "100",
            page: page.toString(),
            sidx: "Name",
            sord: "asc"
        });

        try {
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: headers,
                body: params.toString()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            allResults.push(result);
        } catch (err) {
        }
    }

    return allResults;
})