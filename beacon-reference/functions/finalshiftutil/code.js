(async function (ARGS) {
  const { emp, number, mainid, data } = ARGS;
  BeaconBar.setSharedData("ARGS", ARGS)

  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/json");

  const raw = JSON.stringify({
    FilterMode: "6",
    PageIndex: 1,
    PageSize: 10,
    LoggedEmployeeNumber: emp,
    LoggedEmployeeUserId: number,
    WfTypeCode: "65004",
    WfMainId: mainid,
    FromDate: "",
    ToDate: "",
    EmpNumber: data[0]?.empNumber || ""
  });

  const reqOptionsBase = await BeaconBar.executeFunction("reqOptions")();

  const response = await fetch(
    `${reqOptionsBase}tnavue/service/api/WorkflowApproval/GetShiftAdjustmentApprovalGridData`,
    {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    }
  );

  const result = await response.json();
  return result;
})