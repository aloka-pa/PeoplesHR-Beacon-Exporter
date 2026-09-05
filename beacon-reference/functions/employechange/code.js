(async function(args) {
        const reqOptions = await BeaconBar.executeFunction('reqOptions')();

    const  baseUrl= `${reqOptions}CommonComponents/Search/GetEmpNumber/`
  const url = new URL(baseUrl);

  url.searchParams.set("loggedEmpNumber", args.loggedEmpNumber);
  url.searchParams.set("empNumber", args.empNumber);
  url.searchParams.set("empDisplayName", args.empDisplayName);
  url.searchParams.set("empDateJoined", args.empDateJoined);
  url.searchParams.set("key", args.key);
  url.searchParams.set("_", Date.now());

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const text = await response.text();
    return text;
  } catch (err) {
    throw err;
  }
})
