(async function (args) {
   await BeaconBar.executeFunction("loadOrGetLibrary")("pdf");
  const myHeaders = new Headers();
  myHeaders.append(
    "accept",
    "application/pdf,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
  );
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const url = `${reqOptions}EIMV9/Personal/DesignationAttachmentDownload?id=${args.DsgCode}`;

  const response = await fetch(url, requestOptions);
  // if (!response.ok || !response.headers.get("Content-Type")?.includes("application/pdf")) {
  //   throw new Error(" Failed to fetch a valid PDF response.");
  // }

  const pdfData = await response.arrayBuffer(); 

 

  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

  let textContent = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    textContent += pageText + '\n';
  }

  const jobcontent = textContent.trim();

  return {
    designation: args.DsgName,
    jobcontent
  };
});
