(async function () {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const reqOptions = BeaconBar.executeFunction("reqOptions")();

  try {
    const response = await fetch(`${reqOptions}WorkFlow_v6/DefineWorkflowType.aspx`, requestOptions);
    const text = await response.text();
  } catch (error) {
  }
});
