(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(menu => menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const myHeaders = new Headers({
    "__cfafvalue": window.csrf,
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest"

  });

  const raw = new URLSearchParams({
    EmpNumber: window.logKey,
    LeaveYear: args.year,
    IsReject: "0",
    _search: "false",
    nd: Date.now().toString(),
    rows: "1000",
    page: "1",
    sidx: "",
    sord: "asc"
  }).toString();

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw
  };
  const response = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveHistory/GetLeaveStatusDetails`, requestOptions);

  const leaveSummary = await response.json();

  const summarDetails = leaveSummary.map(item => ({
    fromDate: item.LDetail.FromDate,
    toDate: item.LDetail.ToDate,
    appliedDate: item.LDetail.EditDate,
    leaveType: item.LeaveTypeName,
    days: item.LDetail.LeaveAmountText,
    status: item.Status.replace(/<\/?[^>]+(>|$)/g, ""),
    reasonForLeave: item.LeaveReason || item.Comment || "",
    coveringEmployee: item.LeaveActingEmp
  }));
  return summarDetails;
})