(async function(data, args, reqOptions) {
  const classificationadd = await BeaconBar.executeFunction("searchByCreteriaClassification")(args)
  return classificationadd;
})