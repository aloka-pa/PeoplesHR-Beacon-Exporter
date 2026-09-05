(async function(args , matched){
const matchedObjectArgs = args.EmployeeList.find(x => x.EmpDisplayName === matched);

    
    const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const raw = JSON.stringify({
  "EmpNumber": matchedObjectArgs.EmpNumber,
  "EmpDisplayNumber": matchedObjectArgs.EmpDisplayNumber,
  "EmpDisplayName": matchedObjectArgs.EmpDisplayName,
  "EmpCompleteName": matchedObjectArgs.EmpCompleteName,
  "WfTypeCode": matchedObjectArgs.WfTypeCode,
  "SearchMode": matchedObjectArgs.SearchMode,
  "InitialWfmainId": matchedObjectArgs.InitialWfmainId,
  "FromDate": matchedObjectArgs.FromDate,
  "ToDate": matchedObjectArgs.ToDate,
  "FromDateText": matchedObjectArgs.FromDateText,
  "ToDateText": matchedObjectArgs.ToDateText,
  "IsSelected": false
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}tnav9/api/ManualInOut/GetApprovalGridData/`, requestOptions)
  const data = await  response.text();
  return data ;
  })