(function (keyword) {
  const menu = BeaconBar.user?.metaData?.menu || BeaconBar.user?.metaData?.menus || [];

  return menu.some(x => {
    if (typeof x === "string") {
      return x.toLowerCase().includes(keyword.toLowerCase());
    }
    if (typeof x === "object") {
      return Object.values(x).some(val =>
        String(val).toLowerCase().includes(keyword.toLowerCase())
      );
    }
    return false;
  });
})
