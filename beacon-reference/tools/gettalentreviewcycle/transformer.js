(async function(data, args, reqOptions) {
  const selectLeaderShip = await BeaconBar.executeFunction("selectLeaderShip");
  return selectLeaderShip;
})