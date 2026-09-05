(async function () {
  async function fetche() {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("content-type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
    const reqOptions = BeaconBar.executeFunction('reqOptions')();

    const url = `${reqOptions}EIMV9/api/CommonAPI/GetEncryptedSearchTokenWithFuction?callback=EmployeeVMSearchCallback&_=${Date.now()}`;

    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json(); 
      return data;
    } catch (error) {
    }
  }

  const result = await fetche();
  return result;
});
