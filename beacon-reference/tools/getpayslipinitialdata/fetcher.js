(async function (args, reqOptions) {
  const reqOptions1 = await BeaconBar.executeFunction("reqOptions")();
  return {
    url: `${reqOptions1}Widgets/Payslip/InitPaySlipData`,
    method: "GET",
    headers: {
      "x-requested-with": "XMLHttpRequest",
    },
    params: new URLSearchParams({
      "_": "1761809298751",
    })
  };
})