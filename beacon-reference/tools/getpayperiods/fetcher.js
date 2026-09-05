(async function (args, reqOptions) {
  const baseUrl = await BeaconBar.executeFunction("reqOptions")();

  const finalUrl = `${baseUrl}GPAdding/Api/widgets/ExternalSlipApi/GetPayPeriod`;


  if (!args?.PayType || !args?.PayYear) {
    throw new Error("PayType and PayYear are required");
  }

  return {
    url: finalUrl,
    method: "POST",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      EmpNumber: args?.EmpNumber || "",
      PayType: args?.PayType,
      PayYear: args?.PayYear,
      PaySchId: args?.PaySchId || "",
      PayPeriod: "",
      PayStartDate: "",
      PayEndDate: ""
    })
  };
})