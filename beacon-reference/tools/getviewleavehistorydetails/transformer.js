(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(menu => menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const myHeaders = new Headers();
  myHeaders.append("__cfafvalue", window.csrf);
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlEncodedData = new URLSearchParams();
  urlEncodedData.append("EmpNumber", window.logKey);
  urlEncodedData.append("LeaveYear", args.year);
  urlEncodedData.append("IsReject", "0");
  urlEncodedData.append("_search", "false");
  urlEncodedData.append("nd", Date.now().toString());
  urlEncodedData.append("rows", "10000");
  urlEncodedData.append("page", "1");
  urlEncodedData.append("sidx", "");
  urlEncodedData.append("sord", "asc");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlEncodedData,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveHistory/GetLeaveStatusDetails`, requestOptions);

  const leaveDetails = await response.json();

  // const viewLeaveHistory = leaveDetails.map((item) => ({
  //   fromDate: item.LDetail?.FromDate,
  //   toDate: item.LDetail?.ToDate,
  //   appliedDate: item.LDetail?.EditDate,
  //   leaveType: item.LeaveTypeName,
  //   days: item.LDetail?.LeaveAmount,
  //   leaveHours: `${item.LDetail?.ATBStartTime} - ${item.LDetail?.ATBEndTime}`,
  //   status: item.Status ? item.Status.replace(/<[^>]*>?/gm, '').trim() : "N/A",
  //   reasonForLeave: item.LDetail?.Comment || "No Reason Provided",
  //   coveringEmployee: item.LDetail?.CoveringEmpNumber || "No Covering Employee"
  // }));
  const viewLeaveHistory = [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${month}/${day}/${year}`;
  };

  leaveDetails.forEach(item => {
    const detail = item.LDetail || {};
    viewLeaveHistory.push({
      LeaveAppIDEncrypted: detail.LeaveAppIDEncrypted || '-',
      FromDate: formatDate(detail.FromDate),
      ToDate: formatDate(detail.ToDate),
      LeaveAppliedDate: formatDate(detail.EditDate),
      LeaveType: item.LeaveTypeName || '-',
      Days: detail.LeaveAmountText || '-',
      LeaveHours: item.LeaveMinutes ? (item.LeaveMinutes / 60).toFixed(2) : '-',
      Status: item.Status?.replace(/<[^>]*>?/gm, '') || '-', // strip HTML
      ReasonForLeave: detail.Comment || '-',
      CoveringEmployee: item.LeaveActingEmp || '-',
      LeaveAppliedId: detail.LeaveAppID || " "
    });
  });

  if (viewLeaveHistory.length > 5) {
    BeaconBar.executeFunction("downloadcsv")(viewLeaveHistory);
  }
  return viewLeaveHistory;
});
