(async function (benCode) {

  const sl = await BeaconBar.getSharedData("sl");
  const jsonHeaders = new Headers();
  jsonHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  jsonHeaders.append("Content-Type", "application/json; charset=UTF-8");
  jsonHeaders.append("X-Requested-With", "XMLHttpRequest");

  let raw;

  if(!BeaconBar.user.metaData.menus.includes("Benefitv9/Application/Application/?mode=2&mvc=1&bs=4")) {
    raw = JSON.stringify({
      betCode: benCode,
      empNumber: window.Emp,
      visibilityState: "1",
      isWorkflow: "0",
      appId: window?.benEmp?.appId || null,
      wfMainId: null,
      cancelWfMainId: null,
      keyValue: window?.benEmp?.keyValue || null,
      BetAppYear: window?.benEmp?.betAppYear
    });
  } else {
    raw = JSON.stringify({
      betCode: benCode,
      empNumber: window.Emp,
      visibilityState: window.benefitdetails?.VisibilityState,
      isWorkflow: window.benefitdetails?.IsWorkflow,
      appId: window.benefitdetails?.AppId,
      wfMainId: window.benefitdetails?.WfMainId,
      cancelWfMainId: window.benefitdetails?.CancelWfMainId,
      keyValue: window.benefitdetails?.KeyValue,
      BetAppYear: window.benefitdetails?.BetAppYear
    });
  }

  const requestOptions = {
    method: "POST",
    headers: jsonHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${sl}/BenefitV9/api/ApplicationApi/GetApplicationStructure/`, requestOptions);
  const details = await response.json();

  window.structure = details;

  const effectYears = details.applicationRowVms?.[3]?.ApplicationStructureRowVms?.[0]?.RefObjectValue?.map(x => ({
    years: x.Id,
    yearValue: x.Value
  }));

  const effectMonths = details.applicationRowVms?.[3]?.ApplicationStructureRowVms?.[1]?.RefObjectValue?.map(x => ({
    months: x.Id,
    monthsValue: x.Value
  }));

  return {
    // applicationRows: details.applicationRowVms,
    effectYears: effectYears,
    effectMonths: effectMonths
  };
})
