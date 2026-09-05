(async function(data, args, reqOptions) {
  const createGoal = await BeaconBar.executeFunction("savegoal")(args);

  setTimeout(() => {
    BeaconBar.executeFunction("executeCommand")("../PerfV8/GoalPlanning/IndividualGoalPlanningSelect");
  }, 4000);

  return { message: "Successfully created. Refreshing the page in 4 secs" };
})
