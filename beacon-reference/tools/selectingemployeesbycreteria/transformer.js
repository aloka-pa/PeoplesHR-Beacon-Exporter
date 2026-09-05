(async function(data, args, reqOptions) {
  const selectEmployeesByCreteria = await BeaconBar.executeFunction("searchByCriteria")(args);
  BeaconBar.setSharedData("selectedCreteria" , args.creteria);
  return selectEmployeesByCreteria;
})