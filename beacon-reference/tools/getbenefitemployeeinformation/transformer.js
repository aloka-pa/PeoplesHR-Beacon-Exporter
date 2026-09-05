(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(x => x.includes("Benefitv9/AdminHistory/AdminHistory/?mvc=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const details = await BeaconBar.executeFunction('empBenefitHistory')();
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  try {
    const response = await fetch(`${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetPaginatedTypeaheadList/?term=${args.empId}&empNumber=${details.empNumber2}&key=${details.keyValue}&_=${Date.now()}`, requestOptions);
    const employeeDetails = await response.json();
    return employeeDetails.results
  }
  catch {
    return "Access denied, you do not have access to view this information"
  }
})