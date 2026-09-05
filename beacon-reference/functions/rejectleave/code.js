(async function(rejectcomment){
  const token = BeaconBar.getSharedData("leaveToken");
  const leaveData = BeaconBar.getSharedData("approvers");
  const myHeaders = new Headers();
myHeaders.append("__cfafvalue", token);
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const raw = JSON.stringify({
  "LDetail": {
    "WFMainID": leaveData.LDetail.WFMainID,
    "ApprovalEmpNumber": leaveData.LDetail.ApprovalEmpNumber,
    "Comment": rejectcomment,
    "EmpNumber":  leaveData.EmpNumber
  },
  "LeaveCategory": 1
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};
 const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response= await fetch(`${reqOptions}AbsenceV9/api/LeaveApproval/SubmitLeaveApplicationReject/`, requestOptions)
  const data = await  response.json();
  return data ;
})