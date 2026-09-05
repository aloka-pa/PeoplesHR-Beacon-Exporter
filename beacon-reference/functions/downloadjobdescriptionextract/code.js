(async function (args, postData = null) {
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const baseUrl = `${reqOptions}recruitmentv9/Requisitions/DownloadJobDescription`;

  let response;

  if (postData) {
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      },
      body: JSON.stringify(postData), 
    });
  } else {
    const url = new URL(baseUrl);
    url.searchParams.set("hieCode", args.hieCode);
    url.searchParams.set("salGrdCode", args.salGrdCode);
    url.searchParams.set("ctCode", args.ctCode);
    url.searchParams.set("dsgCode", args.DsgCode);
    url.searchParams.set("_", Date.now());

    const myHeaders = new Headers();
    myHeaders.append("accept", "application/pdf");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

    response = await fetch(url.toString(), {
      method: 'GET',
      headers: myHeaders,
    });
  }

 await BeaconBar.executeFunction("loadOrGetLibrary")("pdf");

  if (!response.ok || !response.headers.get("Content-Type").includes("application/pdf")) {
    throw new Error("Failed to fetch a valid PDF response.");
  }

  const pdfData = await response.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  let textContent = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    textContent += pageText + '\n';
  }

  return textContent.trim();
})
