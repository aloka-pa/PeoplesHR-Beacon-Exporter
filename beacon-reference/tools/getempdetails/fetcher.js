(function (args, reqOptions) {
  return {
    url: `https://${location.host}/hr/api/v1/intapi/GetEntityData`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    params: new URLSearchParams({
      "value": args.searchKey,
    })
  };
})