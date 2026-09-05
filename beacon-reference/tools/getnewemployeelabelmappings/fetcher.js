(function (args, reqOptions) {
  return {
    url: `https://${location.host}/hr/beacon/api/config/employee-label-map`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };
})