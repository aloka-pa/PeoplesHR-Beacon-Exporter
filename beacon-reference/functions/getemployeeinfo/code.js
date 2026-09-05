(async function () {
  try {
    const reqOptions = await BeaconBar.executeFunction('reqOptions')();
    const getDigest = await BeaconBar.executeFunction('getDigest')('mvc=1');

    const baseUrl = `${reqOptions}eimv9/employee/employee?mvc=1&digest=${getDigest.digest}`;

    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "Accept": "*/*",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
      },
      redirect: "follow"
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.text(); 
    const modelMatch = data.match(/var\s+model\s*=\s*({[\s\S]*?});/);
 const jsonString = modelMatch ? modelMatch[1] : null;
    const parsed = JSON.parse(jsonString);

  return parsed;
  } catch (error) {
  }
});
