(async function(args) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");

  const evalId = encodeURIComponent(args.Eval_id || "");    
  const appPage = encodeURIComponent(args.Apppage || "1");   

  const raw = `Eval_id=${evalId}&Apppage=${appPage}`;

  const reqOptions = await BeaconBar.executeFunction("reqOptions")(); 

  const response = await fetch(`${reqOptions}PerfV8/GoalPlanning/LoadEvaluationDetails`, {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.text();
  return data;
});
