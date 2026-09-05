(async function (data, args, reqOptions) {
  
  if (!BeaconBar.user.metaData.menus.includes("TNAV9/AttendanceSummary/AttendanceSummary/1?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  let rawPayload;

  if (args.filterMode) {
    rawPayload = {
      FromDateText: args.fromDate,
      ToDateText: args.toDate,
      IsGroupByEmployee: false,
      FilterMode: "3",
      RosterCode: "",
      callBackId: 4,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
      PageMode: 1
    };
  } else {
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const response1 = await fetch(`${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumberFromTypeahead/?loggedEmpNumber=${window.empLog.empNumber2}&empNumber=${args.id}&key=${window.empLog.keyValue}&_=${Date.now()}`,
      requestOptions
    );

    const details = await response1.json();
    const empNumber = details?.Message || "";
    rawPayload = {
      FromDateText: args.fromDate,
      ToDateText: args.toDate,
      IsGroupByEmployee: false,
      FilterMode: "1",
      EmpNumber: empNumber,
      RosterCode: "",
      callBackId: 4,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
      PageMode: 1
    };
  }

  const requestOptions1 = {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify(rawPayload),
    redirect: "follow"
  };

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/tnav9/api/AttendanceSummary/GetGridDataByCriteria/`, requestOptions1);

  const details1 = await response2.json();
  const teamAttendanceSummary = details1.AttendanceSummaryDetailList.map((entry) => {
    return {
      Date: entry.DatInDateString.split(" ")[0],
      Shift: entry.ShiftAbbreviation || "OFF",
      InDate: entry.InDateText || "-",
      InTime: entry.InTimeText || "-",
      OutDate: entry.OutDateText || "-",
      OutTime: entry.OutTimeText || "-",
      Breaks: entry.BreakCount || 0,
      Overtime: formatTime(entry.TotalOvertime),
      EarlyMin: formatTime(entry.StartLate),
      LateMin: formatTime(entry.EndLate),
      WorkHours: formatTime(entry.WorkHours),
      Nopay: entry.NopayDays ? entry.NopayDays.toFixed(2) : "0.00",
      Leave: entry.LeaveDaysLabelString || "",
      Notifications: entry.Message || ""
    };
  });

  function formatTime(value) {
    if (!value || value === 0) return "00:00";
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  if(teamAttendanceSummary.length>=10){
    await BeaconBar.executeFunction("downloadcsv")(teamAttendanceSummary);
    return teamAttendanceSummary.slice(0,10);
  }

  return teamAttendanceSummary;
});
