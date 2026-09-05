(async function(args){
    const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const digest = await BeaconBar.executeFunction("getDigest")(`bs=4&mvc=1&WFMainID=${args.WFMainID}&Allowedit=${args.Allowedit}&CATID=${args.CATID}`)
const response = await fetch(`${reqOptions}AbsenceV9/LeaveApproval/LeaveApproval?bs=4&mvc=1&WFMainID=${args.WFMainID}&Allowedit=${args.Allowedit}&CATID=${args.CATID}&digest=${digest.digest}`, requestOptions)
  const data = await  response.text()
  return data ;
})