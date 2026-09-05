(async function(){
    const myHeaders = new Headers();
myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
const response = await fetch(`${reqOptions}PerfV8/api/GoalPlanning/AddEmptyGoal?Eval_id=${args.evalid}&Emp_number=${args.employeenumber}&GoalGroup=1&aptype=1&GoalVersion=1&_=${Date.now()}`, requestOptions)
  const data = await response.text();
 return data ; 
 })