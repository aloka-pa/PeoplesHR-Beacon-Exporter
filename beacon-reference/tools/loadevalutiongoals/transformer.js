(async function(data, args, reqOptions) {
const datas = await BeaconBar.executeFunction("loadEvalutions")(args.evalutionID)
   BeaconBar.setSharedData("SubordinateAssessments", datas.SubordinateAssessments);
  return datas.SubordinateAssessments.map(item => ({
  EvaluationId: item.EvaluationId,
  //EmployeeNumber: item.EmployeeNumber,
  EmployeeDisplayName: item.EmployeeDisplayName,
  //AppraiserDisplayName: item.AppraiserDisplayName,
  Type: item.Type,
  EmployeeEvaluatedStatusText: item.EmployeeEvaluatedStatusText,
  AppraiserEvaluatedStatusText: item.AppraiserEvaluatedStatusText
}));;
})