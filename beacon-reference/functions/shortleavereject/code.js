(async function(comment){
    const myHeaders = new Headers();
    const tokenShortLeave = BeaconBar.getSharedData("tokenShortLeave");
myHeaders.append("__cfafvalue",tokenShortLeave );
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const Ldetails =BeaconBar.getSharedData("Ldetails")
const raw = JSON.stringify({
  "LDetail": {
    "WFMainID": Ldetails.modelApproval.SLDetail.WFMainID,
    "ApprovalEmpNumber": Ldetails.modelApproval.SLDetail.ApprovalEmpNumber,
    "Comment": comment,
    "EmpNumber": Ldetails.modelApproval.SLDetail.EmpNumber
  },
  "LeaveCategory": 0
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
 
const response = await fetch(`${reqOptions}AbsenceV9/api/LeaveApproval/SubmitLeaveApplicationReject/`, requestOptions)
  const data = await  response.text()
return data ;
})