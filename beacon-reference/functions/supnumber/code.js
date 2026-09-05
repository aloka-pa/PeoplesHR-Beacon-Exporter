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
    const response = await fetch(`${reqOptions}PerfV8/FinalAssessment/FinalAssessmentSelect`, requestOptions);
    const result = await response.text(); 
    function extractEmployeeNumber(htmlString) {
    const parser = new DOMParser();

    const doc = parser.parseFromString(htmlString, 'text/html');

    const employeeInput = doc.querySelector('#EmployeeNumber');

    return employeeInput ? employeeInput.value : null;
}
  const dataa = extractEmployeeNumber(result)
    return dataa;
  } catch (error) {
  }
});
