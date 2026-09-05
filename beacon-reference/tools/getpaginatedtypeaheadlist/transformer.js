(async function (data, args, reqOptions) {
  const details = await (args.type === "attendance in and out"
  ? await BeaconBar.executeFunction('Attendance')() 
  : args.type === "team attendance"
  ? await BeaconBar.executeFunction('teamAttenadnce')()
  : args.type === "attendance summary" 
  ? await BeaconBar.executeFunction('Attendance1')() 
  : args.type === "shift adjustment" 
  ? await BeaconBar.executeFunction('shiftAdjustment1')() 
  : args.type === "team attendance in and out" 
  ? await BeaconBar.executeFunction('Attendance2')()
  : args.type === "prior overtime application"
  ? await BeaconBar.executeFunction('priorOvertime')()
  :args.type === "team shift adjustment"
  ? await BeaconBar.executeFunction('teamShift')()
  : await BeaconBar.executeFunction('AttendanceSummary')());
  if(!details.empNumber2){
    return "It seems you don't have access. Please check with the HR Admin";
  }


  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(
    `${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetPaginatedTypeaheadList/?term=${args.empId}&empNumber=${details.empNumber2}&key=${details.keyValue}&_=${Date.now()}`,
    requestOptions
  );

  const employeeDetails = await response.json();
  if(employeeDetails.results.length === 0){
    return "It seems you don't have access in this employee. Please check with the HR Admin"
  }else{
    return employeeDetails.results;
  }
});
