(async function (args) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const url = new URL(`${reqOptions}recruitmentv9/Requisitions/DownloadJobDescription`);
  url.searchParams.set("hieCode", args.hieCode);
  url.searchParams.set("salGrdCode", args.salGrdCode);
  url.searchParams.set("ctCode", args.ctCode);
  url.searchParams.set("dsgCode", args.DsgCode);
  url.searchParams.set("_", Date.now());

  const response = await fetch(url.toString(), requestOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  return text;
});
