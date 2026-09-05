(async function(data, args, reqOptions) {
  const dats = await BeaconBar.executeFunction("getallSelectedGoals")(args);

  const count = dats.map(x => x.GOALS);
  const totalGoals = count.reduce((sum, group) => sum + group.length, 0);
  BeaconBar.setSharedData("totalGoals", totalGoals);

  return dats.map(x => ({
    GGRP_GOAL_TOTAL_WEIGHTAGE: x.GGRP_GOAL_TOTAL_WEIGHTAGE,
    GGRP_ID: x.GGRP_ID,
    GGRP_MAX: x.GGRP_MAX,
    GGRP_MIN: x.GGRP_MIN,
    GGRP_NAME: x.GGRP_NAME,
    GGRP_WEIGHTAGE: x.GGRP_WEIGHTAGE
  }));
})
