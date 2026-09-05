(async function (data, args, reqOptions) {
  const ApprovalEmpNumber = await BeaconBar.executeFunction("approvalList")(args.employeeId)
  return ApprovalEmpNumber;
})