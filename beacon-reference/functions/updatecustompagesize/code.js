(async function () {
  //done
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const url = `${reqOptions}CommonComponents/Search/UpdateCustemPageSize`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        PageZize: "1000"
      }),
    });

    if (!response.ok) {
      throw new Error(`❌ Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
})
