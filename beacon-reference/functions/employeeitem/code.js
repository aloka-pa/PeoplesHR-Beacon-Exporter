(async function (args) {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept-Language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("Priority", "u=1, i");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const digest = await BeaconBar.executeFunction("getDigest")(
      `mvc=1&WFMainID=${args.WFMainID}&Allowedit=${args.Allowedit}&CATID=${args.CATID}`
    );

    const url = `${reqOptions}TNAV9/ManualInOut/ManualInOutApproval?mvc=1&WFMainID=${args.WFMainID}&Allowedit=${args.Allowedit}&CATID=${args.CATID}&digest=${digest.digest}&_=${Date.now()}`;

    const response = await fetch(url, requestOptions);
    const data = await response.text();
    return data;

  } catch (error) {
    return null;
  }
});
