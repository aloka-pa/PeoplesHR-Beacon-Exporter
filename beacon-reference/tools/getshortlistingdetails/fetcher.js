(function (args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(x => x.includes("RecruitmentV9/ShortListing/Index?mvc=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  return {
    url: `${location.origin}/${reqOptions.sl}/recruitmentv9/ShortListing/GetCandidates`,
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    params: {
      filter: 0,
      _: Date.now()
    }
  };
})
