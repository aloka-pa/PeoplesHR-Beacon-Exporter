(function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIMV9/SetupConfiguration/SetupConfiguration?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  return data;
})