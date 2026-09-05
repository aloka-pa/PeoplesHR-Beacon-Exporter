(async function(data, args, reqOptions) {
  const datas = await BeaconBar.executeFunction("getEvalutions")();

  return datas;
})