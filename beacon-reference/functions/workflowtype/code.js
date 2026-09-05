(async function(req) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  try {
    const response = await fetch(`${req}WorkFlow_v6/DefineWorkflowType.aspx`, requestOptions);
    const data = await response.text(); 
    return data;
  } catch (error) {
    return null;
  }
});
