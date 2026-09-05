(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.some(x => x.includes("TNAVUE/app/ShiftAdjustment/?mvc=1"))) {
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
      RosterCode: "",
      EmpNumber: "",
      FromDate: args.fromDate,
      ToDate: args.toDate,
      FilterMode: "3",
      IsGroupByEmployee: false,
      SearchKey: "",
      EmpNumberList: "",
      PageIndex: 1,
      PageSize: 10
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
      RosterCode: "",
      EmpNumber: empNumber,
      FromDate: args.fromDate,
      ToDate: args.toDate,
      FilterMode: "1",
      IsGroupByEmployee: false,
      SearchKey: "",
      EmpNumberList: "",
      PageIndex: 1,
      PageSize: 10
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

  const response2 = await fetch(
    `${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftAdjustmentGridData`,
    requestOptions1
  );

  const details1 = await response2.json();
  const rgpId = details1.EmpShiftDetailList?.[0]?.RGPId || "";

  const rawPayload1 = {
    RgpId: rgpId,
    PageIndex: 1,
    PageSize: 10,
    SearchString: ""
  };

  const requestOptions2 = {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    body: JSON.stringify(rawPayload1),
    redirect: "follow"
  };

  const response3 = await fetch(
    `${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftDataByRosterGroup`,
    requestOptions2
  );

  const data1 = await response3.json();
  const schedulingModes = data1?.map((shift) => {
    const duration = (shift.OutTime >= shift.InTime)
      ? shift.OutTime - shift.InTime
      : (24 - shift.InTime) + shift.OutTime;

    return {
      ShiftCode: shift.ShiftCode,
      ShiftName: shift.ShiftName,
      ShiftType: shift.IsFlexyShift ? "Flexible" : "Fixed",
      InTime: shift.InTime,
      OutTime: shift.OutTime,
      DurationHours: duration
    };
  }) || [];

  const teamSift = {
    ...details1.GridDateColumnList,
    ...schedulingModes
  }

  if (teamSift.length >= 10) {
    await BeaconBar.executeFunction("downloadcsv")(teamSift);
    return teamSift.slice(0, 10);
  }

  return teamSift;
});
