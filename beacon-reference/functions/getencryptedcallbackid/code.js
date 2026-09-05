(async function() {
        const reqOptions = await BeaconBar.executeFunction('reqOptions')();
  const url = `${reqOptions}EIMV9/Common/GetEncryptedCallBackId/`;

  const headers = {
    "accept": "text/plain, */*; q=0.01",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
};

  const body = "callBackFunction=EmployeeVMSearchCallback";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    return text; 
  } catch (error) {
    throw error;
  }
});
