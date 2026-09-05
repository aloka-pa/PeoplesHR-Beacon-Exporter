(async function (goal) {
  const employeeNo = BeaconBar.getSharedData("employeeNo");
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json; charset=UTF-8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");
  const totalGoals = BeaconBar.getSharedData("totalGoals");
  const payload = {
    EVAL_ID: goal.EVAL_ID,
    EMP_NUMBER: employeeNo,
    GOAL_ID: totalGoals +1,
    GOAL_VERSION_NO: "1",
    TARGET_DATE: goal.targetDate,//"2025-08-04T00:00:00",
    GOAL_DESC: goal.goalDesc,
    GOAL_TYPEID: goal.GGRP_ID,
    GOAL_WEIGHTAGE: "0",
    GOAL_IMPORTANCE: "0",
    GOAL_MANDATORY_FLG: "0",
    GOAL_INITIATOR_FLG: "2",
    SUP_REJECTED: false,
    SUP_REJECT_COMMENT: "",
    REV_REJECTED: false,
    REV_REJECT_COMMENT: null,
    ACTIONS: {
      GOAL_ACTION: "",
      GOAL_MEASURE: "",
      ISEDIT: "",
      STEP_ID: ""
    },
    IS_EMPTY: "1",
    IS_SAVE: 0,
    GOAL_TITLE: goal.goalTitle,
    GOAL_KPI_TYPE_ID: "-1",
    GOAL_KPI_ACTUAL_CURR_ID: "000001",
    GOAL_CLASSIFICATION: null,
    GOAL_RET_METHOD_ID: null,
    GOAL_KPI_ACTUAL_CURR_VISIBLED: false,
    GOAL_KPI_FULLFILL_VISIBLED: false,
    GOAL_KPI_ACTUAL_AMOUNT: "",
    GOAL_KPI_CutOff_Value: "",
    GOAL_KPI_PRECENTAGE_VISIBLED: false,
    GOAL_MANDATORY_FLG_VAL: false,
    GOAL_MANDATORY_FLG_TEXT: "No",
    SHOW_DELETE: true,
    SUP_REJECTED_TEXT: "No",
    REV_REJECTED_TEXT: "No",
    SHOW_SUP_REJECT_CONTROLS: false,
    SHOW_REV_REJECT_CONTROLS: false,
    ACTIONS_MEASURES: [],
    Original: {
      EVAL_ID:goal.EVAL_ID ,
      EMP_NUMBER: employeeNo,
      GOAL_ID: totalGoals +1,
      GOAL_VERSION_NO: "1",
      GOAL_DESC:goal.goalDesc,
      TARGET_DATE: goal.targetDate,//"2025-08-04T00:00:00",
      GOAL_TYPEID: goal.GGRP_ID,
      GOAL_WEIGHTAGE: "0",
      GOAL_IMPORTANCE: "0",
      GOAL_MANDATORY_FLG: "0",
      GOAL_INITIATOR_FLG: "2",
      ACTIONS_MEASURES: [],
      SUP_REJECTED: false,
      SUP_REJECT_COMMENT: null,
      REV_REJECTED: false,
      REV_REJECT_COMMENT: null,
      IS_EMPTY: "1",
      IS_SAVE: 0,
      GOAL_KPI_TYPE_ID: "-1",
      GOAL_KPI_ACTUAL_AMOUNT: "",
      GOAL_KPI_ACTUAL_CURR_ID: "-1",
      GOAL_TITLE: goal.goalTitle,
      GOAL_CLASSIFICATION: null,
      GOAL_RET_METHOD_ID: null,
      KPI_REVIEW_FREQUENCY: null,
      IS_MONTHY_REVIEW: 0,
      GOAL_KPI_CutOff_Value: ""
    }
  };

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(payload),
    redirect: "follow"
  };
const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}PerfV8/GoalPlanning/SaveGoalandCheckKPIPlan`, requestOptions);
  const result = await response.text();
  return result;
});
