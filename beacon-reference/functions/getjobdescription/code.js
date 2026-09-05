(async function (args) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json; charset=utf-8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  const url = new URL(`${reqOptions}recruitmentv9/Requisitions/CheckJobDescription`);
  url.searchParams.set("hieCode", args.hieCode);
  url.searchParams.set("salGrdCode", args.salGrdCode);
  url.searchParams.set("ctCode", args.ctCode);
  url.searchParams.set("dsgCode", args.DsgCode);
  url.searchParams.set("_", Date.now());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.text();
  return data;
})
