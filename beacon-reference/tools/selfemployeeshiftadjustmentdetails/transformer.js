(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("TNAVUE/app/ShiftAdjustment/?mvc=1&self=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const empNumber = await BeaconBar.executeFunction("selfEmployeeShiftAdjustmentDetails")();

  const rawPayload = {
    FromDate: args.fromDate,
    ToDate: args.toDate,
    IsGroupByEmployee: false,
    FilterMode: "1",
    EmpNumber: empNumber,
    RosterCode: "",
    EmpNumberList: "",
    // IsClientUoc: false,
    SearchKey: "",
    PageSize: 10,
    PageIndex: 1
  };

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

  const schedulingModes = Array.isArray(data1)
    ? data1.map((shift) => {
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
    })
    : [];

  return {
    gridDataColumns: details1.GridDateColumnList,
    schedulingModes
  };
});
