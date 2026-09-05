(function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNAVUE/app/RosterEmployee?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  return data;
})