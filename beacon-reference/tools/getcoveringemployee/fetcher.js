(function (args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("x-requested-with", "XMLHttpRequest");
  return {
    url: `${location.origin}/${reqOptions.sl}/Widgets/EmployeeDirectory/GetEmployeeDetails`,
    method: "GET",
    headers: myHeaders,
    params:{
      "searchText":args.searchKey
    }
  };
})