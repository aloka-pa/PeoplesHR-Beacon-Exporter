(async function (bodyParams) {
  const reqOptions = BeaconBar.executeFunction("reqOptions")();
  const myHeaders = new Headers();
  myHeaders.append("content-type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest")


  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(bodyParams),
    redirect: "follow"
  };

  try {
    const response = await fetch(`${reqOptions}TNDV9/TrainingEnrollment/GetDetailsForSelectedSchedule`, requestOptions);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
})
