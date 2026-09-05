(async function (ApprovalComment) {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json, text/plain, */*");
  myHeaders.append("Accept-Language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("Content-Type", "application/json");

  const approved = BeaconBar.getSharedData("approved");
  const ShiftAdjustmentApprovalDataList = BeaconBar.getSharedData("ShiftAdjustmentApprovalDataList");

  if (!ShiftAdjustmentApprovalDataList?.length) {
    return;
  }

  const updatedList = ShiftAdjustmentApprovalDataList.map((entry, index) => {
    const updated = { ...entry };

    if (index === 0) {
      updated.IsSelected = true;
    } 
    return updated;
  });

  const payload = {
    ShiftAdjustmentApprovalDataList: updatedList,
    LoggedEmployeeNumber: approved?.LoggedEmpNumber,
    LoggedEmployeeUserId: approved?.LoggedUserId,
    ApprovalComment
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}tnavue/service/api/WorkflowApproval/RejectShiftAdjustmentData`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(payload),
    redirect: "follow"
  });

  const result = await response.text();
  return result;
});
