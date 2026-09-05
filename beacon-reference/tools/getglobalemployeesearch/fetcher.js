(function (args, reqOptions) {
  return {
    url: `${window.origin}/${reqOptions.sl}/Widgets/EmployeeDirectory/GetEmployeeDetails`,
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"

    },
    params: {
      "searchText": args.empSearch
    }
  };
})