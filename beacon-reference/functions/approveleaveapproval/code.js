(async function(approverComment) {
  const token = BeaconBar.getSharedData("leaveToken");
  const leaveData = BeaconBar.getSharedData("approvers");

  const myHeaders = new Headers();
  myHeaders.append("__cfafvalue", token);
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");

  const raw = JSON.stringify({
    LDetail: {
      WFMainID: leaveData.LDetail.WFMainID,
      ApprovalEmpNumber: leaveData.LDetail.ApprovalEmpNumber,
      Comment: approverComment,
      EmpNumber: leaveData.EmpNumber,
      IsInformed: -1,
      InformedMethod: "000001",
      BreakdownList: leaveData.LDetail.BreakdownList
    },
    LeaveCategory: 1,
    IsMedicalSeen: 0,
    ApproveAttachments: null
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(
    `${reqOptions}AbsenceV9/api/LeaveApproval/SubmitLeaveApplicationApproval/`,
    requestOptions
  );
  
  const data = await response.json();
  return data;

});
