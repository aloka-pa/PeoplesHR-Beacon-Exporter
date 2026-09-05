(async function (args, reqOptions) {
  const baseUrl = await BeaconBar.executeFunction("reqOptions")();

  if (!args?.PayGrpCode || !args?.PayStartDate || !args?.PayEndDate || !args?.PayGrpNum) {
    throw new Error("Missing required payslip parameters");
  }

  return {
    url: `${baseUrl}GPAdding/Api/widgets/ExternalSlipApi/ViewPaySlip`,
    method: "POST",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      PayGrpCode: args.PayGrpCode,
      PayStartDate: args.PayStartDate,
      PayEndDate: args.PayEndDate,
      PayGrpNum: args.PayGrpNum
    })
  };
})