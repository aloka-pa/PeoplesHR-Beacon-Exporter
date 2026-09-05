(function(data, args, reqOptions) {
  const details = data.map(x=>({
    employeeName : x.EmployeeDisplayName,
    employeeId : x.EmployeeDisplayNumber
  }))
  return details;
})