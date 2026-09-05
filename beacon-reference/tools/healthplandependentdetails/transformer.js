(async function (data, args, reqOptions) {
  const jsonHeaders = new Headers();
  jsonHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  jsonHeaders.append("Content-Type", "application/json; charset=UTF-8");
  jsonHeaders.append("X-Requested-With", "XMLHttpRequest");


  // window.structure.applicationRowVms[3].ApplicationStructureRowVms[0].RefValue = args.dataReimbursement.yearValue;
  // window.structure.applicationRowVms[3].ApplicationStructureRowVms[1].RefValue = args.dataReimbursement.monthValue;
  // window.structure.applicationRowVms[4].ApplicationStructureRowVms[0].RefValue = args.dataReimbursement.amount;
  // window.structure.applicationRowVms[5].ApplicationStructureRowVms[0].RefValue = args.dataReimbursement.requestAmount;

  window.structure.applicationRowVms.forEach(x => {
    x.ApplicationStructureRowVms.forEach(y => {
      if (y.ApplicationGridDefVm === null) {
        y.ApplicationGridDefVm = {
          ApplicationGridRowVms: [],
          GridData: {
            RowItems: []
          }
        };
      }
    });
  });


  const raw = JSON.stringify({
    "ApplicationRowVms": window.structure.applicationRowVms.slice(0, 5),
    "CurrentBenefitStructId": window.structure.applicationRowVms[1].ApplicationStructureRowVms[0].BesId,
    "CurrentEmployeeNumber": window.Emp,
    "CurrentBenefitTypeCode": window.benCode.benCode,
    "VisibilityState": window.benefitdetails.VisibilityState,
    "ReadOnlyState": window.benefitdetails.ReadOnlyState,
    "StepId": window.benefitdetails.StepId,
    "AppId": window.benefitdetails.AppId,
    "WfMainId": window.benefitdetails.WfMainId,
    "CancelWfMainId": window.benefitdetails.CancelWfMainId,
    "IsWorkflow": window.benefitdetails.IsWorkflow,
    "IsSummary": window.benefitdetails.IsSummary,
    "BetAppYear": window.benefitdetails.BetAppYear
  });

  const requestOptions = {
    method: "POST",
    headers: jsonHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9//api/ApplicationApi/GetDependentControlValues/`, requestOptions);
  const details = await response.json();
  window.rk = details;
  return details;
})