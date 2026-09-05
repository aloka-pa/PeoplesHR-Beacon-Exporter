(async function(args){
  const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("priority", "u=1, i");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};
  const digest = await BeaconBar.executeFunction("getDigest")(`mvc=1&WFMainID=${args.WFMainID}&Allowedit=${args.Allowedit}&CATID=${args.CATID}`)

const reqOptions = await BeaconBar.executeFunction("reqOptions")()
const response = await fetch(`${reqOptions}TNAVUE/app/ShiftAdjustmentApproval?mvc=1&WFMainID=${args.WFMainID}&Allowedit=${args.Allowedit}&CATID=${args.CATID}&digest=${digest.digest}&_=${Date.now()}`, requestOptions)
const data = await  response.text()
  return data ;
})