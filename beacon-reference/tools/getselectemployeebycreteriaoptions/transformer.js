(async function(data, args, reqOptions) {
   await BeaconBar.executeFunction("searchEmployee")();
   const options = BeaconBar.getSharedData("options")
  return options;
})