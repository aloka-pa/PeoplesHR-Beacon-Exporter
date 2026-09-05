(async function (data, args, reqOptions) {
  const empKey = await BeaconBar.executeFunction("employeeLeaveApplication")();
  const myHeaders = new Headers({
    "__cfafvalue": window.csrf,
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded",
    "x-requested-with": "XMLHttpRequest"
  });

  const raw = new URLSearchParams({
    EmpNumber: empKey,
    LeaveYear: args.year,
    IsReject: "0",
    _search: "false",
    nd: Date.now().toString(),
    rows: "1000",
    page: "1",
    sidx: "",
    sord: "asc"
  }).toString();

  const url = `${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveHistory/GetLeaveStatusDetails`;
  const request = {
    method: "POST",
    headers: myHeaders,
    body: raw
  };

  const response = await fetch(url, request);
  const datass = await response.json();

  const summarDetails = datass.map(item => ({
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
