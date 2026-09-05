(async function (ApprovalComment) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");

  const objectss = BeaconBar.getSharedData("PriorOTDetailList");
  const objects = objectss.PriorOTDetailList;

  const processedData = objects.map((entry, index) => {
    const updatedEntry = JSON.parse(JSON.stringify(entry));

    if (index === 0) {
      updatedEntry.IsSelected = true;
      updatedEntry.PriorDetail.AppComment = ApprovalComment;
    }

    return updatedEntry;
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ PriorOTDetailList: processedData }), 
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}tnav9/api/PriorOT/RejectPriorOTApplications/`, requestOptions);
  const data = await response.text();
  return data;
})
