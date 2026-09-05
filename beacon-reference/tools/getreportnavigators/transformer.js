(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  // await BeaconBar.executeFunction("censusInformation")(args.id);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const reqBase = await BeaconBar.executeFunction("reqOptions")();
  // ReportNavigator

  const response = await fetch(`${reqBase}GP/ReportNavigator.aspx`, requestOptions);
  const htmlText = await response.text();

  function extractReportLinksFromTable(tableHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(tableHTML, "text/html");

    const rows = doc.querySelectorAll("tbody tr");
    const reports = [];

    rows.forEach(row => {
      const reportName = row.querySelector("td")?.textContent.trim();
      const anchor = row.querySelector("a");
      const onclickRaw = anchor?.getAttribute("onclick") || "";

      const urlMatch = onclickRaw.match(/openWinNavigateUrl\('([^']+)'\)/);
      const fullUrl = urlMatch ? urlMatch[1] : "";

      if (reportName && fullUrl) {
        reports.push({
          name: reportName,
          link: fullUrl
        });
      }
    });

    return reports;
  }

  const allData = extractReportLinksFromTable(htmlText);
  return allData;
});
