(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("TNAV9/ManualInOut/ManualInOut/1?mvc=1")) {
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
      callBackId: 1,
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
      callBackId: 1,
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

  const response2 = await fetch(`${location.origin}/${reqOptions.sl}/tnav9/api/ManualInOut/GetGridDataByCriteria/`, requestOptions1);

  const details1 = await response2.json();
  const teamAttendanceSummary = details1.ManualInOutDetailList.map((entry) => {
    return {
      Date: entry.InDateText || "",
      Shift: entry.ShiftAbbreviation || "",
      "In Date": entry.InDateText || "",
      "In Time": entry.InTimeText || "-",
      "Out Date": entry.OutDateText || "",
      "Out Time": entry.OutTimeText || "-",
      "Updated Punches": entry.PunchesCount || 0,
      Breaks: entry.BreakCount || 0,
      Reason: entry.ReasonCode === "-1" ? "Select a reason" : entry.ReasonCode || "",
      Status: entry.RecordStatusText || "",
      Leave: entry.LeaveDaysLabelString || "",
    };
  });
  return teamAttendanceSummary;
});
