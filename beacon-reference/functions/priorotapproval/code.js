(async function (args , item) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const digest = await BeaconBar.executeFunction("getDigest")(`mvc=1&bs=4&WFMainID=${item.WorkflowMainId}&Allowedit=${args.Allowedit}&CATID=${args.CATID}`)
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}TNAV9/PriorOT/PriorOTApproval/?mvc=1&bs=4&WFMainID=${item.WorkflowMainId}&Allowedit=${args.Allowedit}&CATID=${args.CATID}&digest=${digest.digest}&_=${Date.now()}`, requestOptions)
  const data = await response.text()
  return data;
})