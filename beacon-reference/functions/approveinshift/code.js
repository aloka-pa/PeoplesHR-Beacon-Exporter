(async function (ApprovalComment) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");

  const dataObj = BeaconBar.getSharedData('ShiftAdjustmentApprovalDataList');
  const ARGS = BeaconBar.getSharedData('ARGS');
  const dataList = dataObj.map((entry, index) => {
    const updated = JSON.parse(JSON.stringify(entry)); 

    updated.IsSelected = index === 0;
    if (index === 0) {
      updated.ApprovalComment = ApprovalComment;
    }

    return updated;
  });

  const raw = JSON.stringify({
    ShiftAdjustmentApprovalDataList: dataList,
    LoggedEmployeeNumber: ARGS.emp,
    LoggedEmployeeUserId: ARGS.number,
    ApprovalComment 
  });

  const reqOptions = await BeaconBar.executeFunction('reqOptions')();
  const response = await fetch(
    `${reqOptions}tnavue/service/api/WorkflowApproval/ApproveShiftAdjustmentData`,
    { method: "POST", headers: myHeaders, body: raw, redirect: "follow" }
  );

  const data = await response.text();
  return data;
});
