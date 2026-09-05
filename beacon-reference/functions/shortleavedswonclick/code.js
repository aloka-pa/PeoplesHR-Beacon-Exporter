(async function(emp, year , token){
  BeaconBar.setSharedData("tokenShortLeave", token)
    const myHeaders = new Headers();
myHeaders.append("__cfafvalue",token );
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("content-type", "application/json");

const raw = JSON.stringify({
  "EmpNumber": emp,
  "LeaveYear": year
});

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}AbsenceV9/api/ShortLeaveApplication/GetEntitledShortLeaveTypes/`, requestOptions)
const data = await  response.json()
  return data ;;
})