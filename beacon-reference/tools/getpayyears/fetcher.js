(async function (args, reqOptions) {
  const baseUrl = await BeaconBar.executeFunction("reqOptions")();

  const finalUrl = `${baseUrl}GPAdding/Api/widgets/ExternalSlipApi/GetPayYear`;


  return {
    url: finalUrl,
    method: "POST",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      EmpNumber: "",
      PayType: args?.PayType || "",
      PaySchId: ""
    })
  };
})