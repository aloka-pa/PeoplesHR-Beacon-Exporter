(async function (approval) {
  let items = BeaconBar.getSharedData("summary");
  if (!items) {
    items = await BeaconBar.executeFunction("summary")();
    BeaconBar.setSharedData("summary", items);
  }
  return items.some(
    obj => obj.text && obj.text.toLowerCase().includes(approval.toLowerCase())
  );
});
