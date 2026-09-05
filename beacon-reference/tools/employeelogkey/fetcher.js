(function (args, reqOptions) {
  return {
    url: `${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumber/`,
    method: 'GET',
    headers: {
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "x-requested-with" : "XMLHttpRequest"
    },
    params: {
      loggedEmpNumber: window.logs.empNumber2,
      empNumber: args.empId,
      empDisplayName: decodeURIComponent(args.empName),
      empDateJoined: decodeURIComponent(args.empDOB),
      key: window.logs.keyValue,
      _: Date.now()
    }
  };
});
