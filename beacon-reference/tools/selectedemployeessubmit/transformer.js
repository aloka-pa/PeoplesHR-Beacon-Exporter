(async function(data, args, reqOptions) {
  const submit = await BeaconBar.executeFunction("candidatesubmit")(args);
  await BeaconBar.executeFunction("selectLeaderShipaftersubmit")();
  return {submit , message : "successfully added to the candidate pool"};
})