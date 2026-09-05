(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("selfEmployeeApplyBenefitApplication")();
  window.Emp = details.empNumber;
  window.benEmp = {
    appId : details.appId,
    keyValue : details.keyValue,
    betAppYear : details.betAppYear
  }
  return details.benefitTypes;
})
