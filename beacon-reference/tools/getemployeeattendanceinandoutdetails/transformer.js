(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNAV9/ManualInOut/ManualInOut/0?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

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
      IsGroupByEmployee: false,
      FilterMode: "2",
      RosterCode: args.rosterCode,
      callBackId: 1,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
      PageMode: 0
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
      IsGroupByEmployee: false,
      FilterMode: "1",
      EmpNumber: empNumber,
      RosterCode: "",
      callBackId: 1,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
      PageMode: 0
    };
  }

  const requestOptions1 = {
    method: "POST",
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify(rawPayload),
    redirect: "follow"
  };

  const response2 = await fetch(
    `${location.origin}/${reqOptions.sl}/tnav9/api/ManualInOut/GetGridDataByCriteria/`,
    requestOptions1
  );

  const details1 = await response2.json();
  return details1.ManualInOutDetailList.map(item => ({
    Date: item.DatInDate,
    Shift: item.ShiftAbbreviation,
    "In Date": item.InDateText,
    "In Time": item.InTimeText || "",
    "Out Date": item.OutDateText,
    "Out Time": item.OutTimeText || "",
    Breaks: item.BreakCount,
    Comment: item.Comment || "",
    Status: item.RecordStatusText,
    Leave: item.LeaveType || ""
  }));
});
