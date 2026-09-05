(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.some(x => x.includes("Benefitv9/History/BenefitHistory/?mvc=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const details = await BeaconBar.executeFunction("selfBenefitHistoryApplication")();

  const params = JSON.stringify({ "EmpNumber": details, "filterMode": 1, "filterValue1": args.year, "filterValue2": "" })

  const requestOptions2 = {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "x-requested-with" : "XMLHttpRequest"
    },
    body: params,
    redirect: "follow"
  };

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/HistoryApi/GetHistoryWithFilteration`, requestOptions2);
  const details2 = await response3.json();

  return details2.HistoryDataTableVm.DataTableRowVms;
})