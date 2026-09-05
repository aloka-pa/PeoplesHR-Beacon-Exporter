(async function(req) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(`${req}PerfV8//api/FinalAssessment/LoadOngoingGoalEvaluations`, requestOptions);
  const data = await response.text();  
  return data;
});
