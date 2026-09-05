(async function applyShortLeave(args) {
  //done
  const token = BeaconBar.getSharedData("token");
  const empNumber = BeaconBar.getSharedData("EmpNumber");

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("__cfafvalue", token);
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split('.').map(Number);
    return { hour: h, minute: m };
  };

  function parseLeaveDate(dateStr) {
    // Input format: "22-07-2024"
    const [dd, mm, yyyy] = dateStr.split('-');
    return new Date(`${yyyy}-${mm}-${dd}`);
  }

  function getISOTime(dateObj, timeStr) {
    const { hour, minute } = parseTime(timeStr);
    dateObj.setHours(hour);
    dateObj.setMinutes(minute);
    dateObj.setSeconds(0);
    return dateObj.toISOString();
  }

  function formatTime(timeStr) {
    const { hour, minute } = parseTime(timeStr);
    return `${String(hour).padStart(2, '0')}.${String(minute).padStart(2, '0')}`;
  }

  function formatLeaveDateText(dateObj) {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yy = String(dateObj.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;  // Example: "22/07/24"
  }

  const leaveDateObj = parseLeaveDate(args.leaveDate);
  const startISO = getISOTime(new Date(leaveDateObj), args.startTime);
  const endISO = getISOTime(new Date(leaveDateObj), args.endTime);
  const minutesDiff = (new Date(endISO) - new Date(startISO)) / (1000 * 60);  // in minutes

  const utils = await BeaconBar.executeFunction("getleaveGroup")(args.Year);

  const raw = JSON.stringify({
    EmpNumber: empNumber,
    LeaveYear: args.Year,
    LeaveGroup: utils.LGCode,
    TBTCode: utils.typecode,
    ApprovalEmpNumber: args.approverNumber,
    LeaveDate: new Date(leaveDateObj.setHours(0, 0, 0, 0)).toISOString(),
    LeaveDateText: formatLeaveDateText(leaveDateObj),
    DtStartTime: startISO,
    DtEndTime: endISO,
    StartTime: formatTime(args.startTime),
    EndTime: formatTime(args.endTime),
    NumberOfHours: minutesDiff,
    ReasonCode: args.reason,
    Comment: args.comment || "",
    PreviousAppIdText: null,
    IsImpersonate: -1,
    ShortLeaveDefinedTimeMode: "-1"
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const response = await fetch(
      `${reqOptions}AbsenceV9/api/ShortLeaveApplication/SaveShortLeaveApplication/`,
      requestOptions
    );
    const result = await response.text();
    return result;
  } catch (error) {
    return { error: "Request failed", details: error };
  }
})
