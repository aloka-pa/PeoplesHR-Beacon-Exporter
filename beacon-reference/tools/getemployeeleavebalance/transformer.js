(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(menu => menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const year = await BeaconBar.executeFunction("year")();

  if (!year) {
    return  "No leave year configuration.";
  }

  const raw = JSON.stringify({
    "EmpNumber": window.logKey,
    "LeaveYear": year,
    "ApplicationPage": 1
  });

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "__cfafvalue": window.csrf,
      "x-requested-with": "XMLHttpRequest"
    },
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/GetEntitledLeaveTypes/`, requestOptions);
  const data1 = await response.json();

  const leaveBalanceDetails = data1.map((leave) => ({
    leaveTypeName: leave.TypeName,
    leaveTypeCode: leave.TypeCode,
    yearCode: leave.YearCode,
    leaveGroupCode: leave.LGCode,
    calendarCode: leave.CalendarCode,
    entitlement: leave.Entitlement.EntitlementDV,
    utilized: leave.Entitlement.UtilizedDV,
    balance: leave.Entitlement.BalanceDV,
    pendingApproval: leave.Entitlement.PendingDV
  }));

  return leaveBalanceDetails;
});
