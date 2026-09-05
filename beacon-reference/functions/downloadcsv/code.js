(function (data , name) {
    //done
    if (!data?.length) {
        return null;
    }

    const csvHeaders = Object.keys(data[0]).join(',') + '\n';
    const csvRows = data.map(row =>
        Object.values(row).map(value => `"${value}"`).join(',')
    );
    const csvString = csvHeaders + csvRows.join('\n');

    const encodedCsv = encodeURIComponent(csvString);
    const csvUrl = `data:text/csv;charset=utf-8,${encodedCsv}`;

    window.BeaconBar.setDownloadForChatAIMessage({
        url: csvUrl,
        name:`${name || "download"}` ,
        type: "csv",
        fileName: `${name || "download"}.csv`,
        // size: "128 KB", // Optional
        target: "_blank", // Optional
        replace: true
    });

    return csvUrl;
})