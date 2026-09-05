(async function(data, args, reqOptions) {
  const allResultsgroups = BeaconBar.getSharedData("allResultsgroups");

  const matchedItem = allResultsgroups.find(
    item => item.Description === args.description
  );
  if (!matchedItem) {
    throw new Error(`Description not found: ${args.description}`);
  }
  const result = await BeaconBar.executeFunction("getWorkFlowGroups")(matchedItem.EventKey);
  return result;

})