(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(menu => menu.includes("AbsenceV9/LeaveHistory/LeaveHistory?mvc=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  if (!args.id) {
    return "must be calling 'getAdminInformationDetails' tool execute to get the employee number, do ask employee id directly self employee id will be take"
  }

  if (args.id !== BeaconBar.user.metaData.empNo) {
    return "It seems you don't have access. Please check with the HR Admin"
  }

  const empKey = await BeaconBar.executeFunction("employeeLeaveApplication")();

  // const yearResponse = await fetch(
  //   `${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/GetEntitledLeaveYears/`,
  //   {
  //     method: "POST",
  //     headers: {
  //       "__cfafvalue": window.csrf,
  //       accept: "*/*",
  //       "accept-language": "en-US,en;q=0.9",
  //       "content-type": "application/json",
  //     },
  //     body: JSON.stringify({ EmpNumber: empKey }),
  //     redirect: "follow",
  //   }
  // );

  // const year = await yearResponse.json();
  // const yearCode = year[0].YearCode;

  const leaveTypesResponse = await fetch(
    `${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/GetEntitledLeaveTypes/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "x-requested-with": "XMLHttpRequest",
        "__cfafvalue": window.csrf,
      },
      body: JSON.stringify({
        EmpNumber: empKey,
        LeaveYear: args.year,
        ApplicationPage: 1,
      }),
      redirect: "follow",
    }
  );

  const leaveTypes = await leaveTypesResponse.json();

  const leaveBalanceDetails = leaveTypes.map((leave) => ({
    leaveTypeName: leave.TypeName,
    leaveTypeCode: leave.TypeCode,
    yearCode: leave.YearCode,
    leaveGroupCode: leave.LGCode,
    calendarCode: leave.CalendarCode,
    entitlement: leave.Entitlement.EntitlementDV,
    utilized: leave.Entitlement.UtilizedDV,
    balance: leave.Entitlement.BalanceDV,
    pendingApproval: leave.Entitlement.PendingDV,
  }));

  return leaveBalanceDetails;
});
