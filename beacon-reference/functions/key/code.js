(async function () {
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const url = `${reqOptions}eimv9/employee/employee?mvc=1&digest=8vXxCtVwzShA2jkCUfCLbQ&_=1747900205905`;

  const headers = new Headers({
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
  });

  const options = {
    method: "GET",
    headers,
    redirect: "follow"
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.text();
    const modelMatch = data.match(/var\s+model\s*=\s*({[\s\S]*?});/);
    const jsonString = modelMatch ? modelMatch[1] : null;
    const parsed = JSON.parse(jsonString);

    return parsed;

  } catch (error) {
    return null;
  }
})
