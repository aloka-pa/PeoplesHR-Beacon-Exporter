(async function(data, args, reqOptions) {
   const searchEmployees = await BeaconBar.executeFunction("searchEmployee")();
  const selectingEmployees = await BeaconBar.executeFunction("selectEmployees")(searchEmployees)
   return selectingEmployees;
})