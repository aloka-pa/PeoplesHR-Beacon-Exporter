(async function (data, args, reqOptions) {
  
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  let rawPayload;

  if (args.rosterCode) {
    rawPayload = {
      FromDateText: args.fromDate,
      ToDateText: args.toDate,
      IsGroupByEmployee: true,
      FilterMode: "2",
      RosterCode: args.rosterCode,
      callBackId: 4,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
      PageMode: 0,
    };
  } else {
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const response1 = await fetch(
      `${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumberFromTypeahead/?loggedEmpNumber=${window.empLog.empNumber2}&empNumber=${args.id}&key=${window.empLog.keyValue}&_=${Date.now()}`,
      requestOptions
    );

    const details = await response1.json();
    const empNumber = details?.Message || "";

    rawPayload = {
      FromDateText: args.fromDate,
      ToDateText: args.toDate,
      IsGroupByEmployee: true,
      FilterMode: "1",
      EmpNumber: empNumber,
      RosterCode: "",
      callBackId: 2,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
    };
  }

  const requestOptions1 = {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify(rawPayload),
    redirect: "follow"
  };

  const response2 = await fetch(
   `${location.origin}/${reqOptions.sl}/tnav9/api/PriorOT/GetGridDataByCriteria/`,
    requestOptions1
  );
  const details1 = await response2.json();
  BeaconBar.setSharedData("employeedata", details1.EmployeeList[0])


  const priorOvertimeDetails = details1.PriorOTDetailList.map((entry) => ({
    employeeName:entry.EmpDisplayNumber || "",
    employeeId : entry.EmpDisplayName || "",
    employeeHeaderName : entry.EmpHeaderName || "",
    Date: entry.InDateText || "",
    "Shift Name": entry.ShiftAbbreviation || "OFF",
    "In Date": entry.InDateText || "-",
    "In Time": entry.InTime >= 0 ? formatTime(entry.InTime) : "-",
    "Out Date": entry.OutDateText || "-",
    "Out Time": entry.OutTime >= 0 ? formatTime(entry.OutTime) : "-",
    "Max Pre OT": entry.PriorDetail.MaxPreOT ? formatTime(entry.PriorDetail.MaxPreOT) : "-",
    "Max Post OT": entry.PriorDetail.MaxPostOT ? formatTime(entry.PriorDetail.MaxPostOT) : "-",
    "Pre OT": entry.PreOTHrsText || "",
    "Post OT": entry.PostOTHrsText || "",
    Reason: entry.ReasonCode === "" ? "Select a reason" : entry.Reason || "",
    Comment: entry.Comment || "",
    Status: entry.RecordStatusText || ""
  }));

  function formatTime(decimalTime) {
    if (decimalTime < 0) return "-";
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // const updateDetails = details1.PriorOTDetailList.filter(x => x.PostOTHrsText === "");
  window.updatePrior = details1.PriorOTDetailList;
  if(priorOvertimeDetails.length>=10){
    await BeaconBar.executeFunction("downloadcsv")(priorOvertimeDetails);
    return priorOvertimeDetails.slice(0,10);
  }

  return priorOvertimeDetails;
});