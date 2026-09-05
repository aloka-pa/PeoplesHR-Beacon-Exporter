(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNAVUE/app/ShiftAdjustment?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  window.dateDetails = {
    idsss: args.id,
    fromDate: args.fromDate,
    toDate: args.toDate
  };
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  let rawPayload;
  if (args.rosterCode) {
    rawPayload = {
      FromDate: args.fromDate,
      EmpNumber: "",
      EmpNumberList: "",
      ToDate: args.toDate,
      IsGroupByEmployee: false,
      FilterMode: "2",
      RosterCode: args.rosterCode,
      SearchKey: "",
      IsClientUoc: false,
      PageSize: 10,
      PageIndex: 1
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
    window.logDetails = empNumber;
    rawPayload = {
      FromDate: args.fromDate,
      ToDate: args.toDate,
      IsGroupByEmployee: false,
      FilterMode: "1",
      EmpNumber: empNumber,
      RosterCode: "",
      EmpNumberList: "",
      SearchKey: "",
      PageSize: 10,
      PageIndex: 1
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
  window.shiftDetails = details1;

  let pageIndex = 1;
  const pageSize = 10;
  let allResults = [];

  while (true) {
    const rawPayload = {
      RgpId: rgpId,
      PageIndex: pageIndex,
      PageSize: pageSize,
      SearchString: ""
    };
    const requestOptions = {
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
    const response = await fetch(
      `${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftDataByRosterGroup`,
      requestOptions
    );
    const data = await response.json();
    if (!data || data.length === 0) {
      break;
    }
    allResults = allResults.concat(data);
    pageIndex++;
  }

  const availabeleSchedulingModes = Array.isArray(allResults)
    ? allResults.map((shift) => {
        const duration = shift.OutTime >= shift.InTime ? shift.OutTime - shift.InTime : 24 - shift.InTime + shift.OutTime;
        return {
          ShiftCode: shift.ShiftCode,
          ShiftName: shift.ShiftName,
          shiftAbbreviation: shift.Abbreviation,
          InTime: shift.InTime,
          OutTime: shift.OutTime,
          DurationHours: duration
        };
      })
    : [];


  const requestOptions2 = {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      "x-requested-with": "XMLHttpRequest"
    },
    redirect: "follow"
  };
  const response3 = await fetch(
    `${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/ReloadExcelTab`,
    requestOptions2
  );
  const reason = await response3.json();
  const reasons = reason.Data.Reasons;

  return {
    existingGridDataColumns: details1.EmpShiftDetailList.map(x => ({
      shiftAbbreviation: x.ShiftAbbreviation,
      shiftAbbreviationCode: x.ShiftCode,
      shiftDate: x.RosterDate,
      shiftDetails: x.ToolTip
    })),
    availabeleSchedulingModes,
    reasons
  };
});
