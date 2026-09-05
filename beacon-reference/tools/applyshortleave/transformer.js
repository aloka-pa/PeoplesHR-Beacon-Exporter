(async function(data, args, reqOptions) {
  const applyshortleave = await BeaconBar.executeFunction('shortleave')(args) 
  return applyshortleave;
})