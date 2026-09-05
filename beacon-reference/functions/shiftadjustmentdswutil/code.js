(async function(args){
    const myHeaders = new Headers();
myHeaders.append("accept", "application/json, text/plain, */*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const raw = JSON.stringify({
  "FilterMode": "6",
  "PageIndex": 1,
  "PageSize": 5,
  "SearchString": null,
  "LoggedEmployeeNumber": args.LoggedEmpNumber,
  "LoggedEmployeeUserId": args.LoggedUserId,
  "WfTypeCode": "65004",
  "WFMainId": args.WFMainId,
  "fromDate": "",
  "toDate": ""
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}tnavue/service/api/Employee/GetEmployeeListForWorkflowApproval`, requestOptions)
const data = await response.json()
 return { emp : args.LoggedEmpNumber, number : args.LoggedUserId, mainid : args.WFMainId, data} ;;
})