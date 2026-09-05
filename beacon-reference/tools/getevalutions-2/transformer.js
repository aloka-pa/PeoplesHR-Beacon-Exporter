(async function(data, args, reqOptions) {
  const evalutionsData = await BeaconBar.executeFunction("getGoalEvalutionIds")();
  return evalutionsData;
})