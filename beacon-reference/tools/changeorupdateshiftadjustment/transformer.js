(async function (data, args, reqOptions) {
  function transformToUpdatePayload(getApiResponse, previousShiftDetails, updateShiftDetails) {
    const result = { EmpShiftScheduleList: [] };
    getApiResponse.forEach(employee => {
      const updatedShifts = [];
      employee.EmpShiftDetailList.forEach(shift => {
        const prev = previousShiftDetails.find(p =>
          shift.PreShiftCode === p.preShiftCode &&
          shift.PreShiftAbbreviation === p.preShiftAbbreviation &&
          shift.RosterDate === p.date
        );
        if (prev) {
          const newShift = updateShiftDetails[0];
          const transformedShift = {
            EmpNumber: shift.EmpNumber,
            RosterDate: shift.RosterDate,
            HTCode: shift.HTCode,
            RosterGroup: shift.RGPId,
            RosterCode: shift.RosterCode,
            ShiftCode: newShift.newShiftCode,
            ShiftHTCode: shift.ShiftHTCode,
            ShiftAbbreviation: newShift.newShiftAbbreviation,
            ShiftColor: shift.ShiftColor,
            PreShiftCode: shift.PreShiftCode,
            PreShiftHTCode: shift.PreShiftHTCode,
            PreShiftAbbreviation: shift.PreShiftAbbreviation,
            PreShiftColor: shift.PreShiftColor,
            IsTimeAdjLocked: shift.IsTimeAdjLocked,
            IsPeriodLocked: shift.IsPeriodLocked,
            RecordType: shift.RecordType,
            ToolTip: shift.ToolTip,
            DisableToolTip: "Adjustment disabled. Record not assigned to the selected roster group.",
            IsEnabled: true,
            DisabledCSS: "Shift",
            ColumnId: shift.ColumnId,
            IsVisible: true,
            IsWarning: false,
            WarningMessage: shift.ToolTip,
            showPopover: false
          };
          updatedShifts.push(transformedShift);
        }
      });
      if (updatedShifts.length > 0) {
        result.EmpShiftScheduleList.push({
          Id: employee.Id,
          EmpNumber: employee.EmpNumber,
          EmpDisplayNumber: employee.EmpDisplayNumber,
          EmpDisplayName: employee.EmpDisplayName,
          EmpShiftDetailList: updatedShifts,
          ReasonCode: null,
          ApprovingPerson: null,
          IsSelected: true,
          Message: ""
        });
      }
    });
    return result;
  }

  const updatePayload = transformToUpdatePayload(
    window.shiftDetails.EmpShiftScheduleList,
    args.previousShiftDetails,
    args.updateShiftDetails
  );

  const updateDetails = {
    RangeId: 0,
    GridDateColumnList: window.shiftDetails.GridDateColumnList.map(x => ({
      ...x,
      IsVisible: true
    })),
    EmpShiftScheduleList: updatePayload.EmpShiftScheduleList,
    RosterGroupList: window.shiftDetails.RosterGroupList
  };

  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8,te;q=0.7");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  const shiftAuth = {
    filterMode: "1",
    fromDate: formatDate(window.dateDetails.fromDate),
    toDate: formatDate(window.dateDetails.toDate),
    rosterCode: "",
    rosterGroupId: "",
    employeeNumber: window.logDetails,
    searchKey: "",
    gridMode: "2",
    isGroupByEmployee: false
  };

  const formdata = new FormData();
  formdata.append("Attachment", "null");
  formdata.append("CommentReason", args.reason || "");
  formdata.append("Comment", args.comment || "");
  formdata.append("PageMode", "0");
  formdata.append("AllShiftGridData", JSON.stringify([updateDetails]));
  formdata.append("ShiftFilterDetailsObj", JSON.stringify(shiftAuth));

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow"
  };

  const details = await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/ValidateAndSaveAdjustmentData`, requestOptions);
  const detailsData = await details.json();

  // const requestOptions3 = {
  //   method: "POST",
  //   headers: myHeaders,
  //   redirect: "follow"
  // };
  // const processData1 = await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftAdjustmentProcessingData`, requestOptions3);

  // const requestOptions5_get = {
  //   method: "GET",
  //   headers: myHeaders,
  //   redirect: "follow"
  // };
  // const work = await fetch(`${location.origin}/${reqOptions.sl}/WorkflowV5/WebAPI/V1/Workflow/GetWorkflowConfigurationsForNotification?_=${Date.now()}`, requestOptions5_get);
  // const workFlow = await work.json();

  // const formdata1 = new FormData();
  // formdata1.append("ProcessMode", "1");

  // const requestOptions1 = {
  //   method: "POST",
  //   headers: myHeaders,
  //   body: formdata1,
  //   redirect: "follow"
  // };
  // const details1 = await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/SubmitShiftAdjustmentData`, requestOptions1);
  // const detailsData1 = await details1.json();

  // const requestOptions5_post = {
  //   method: "POST",
  //   headers: myHeaders,
  //   redirect: "follow"
  // };
  // await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftAdjustmentProcessingData`, requestOptions5_post);

  // const requestOptions6 = {
  //   method: "POST",
  //   headers: myHeaders,
  //   redirect: "follow"
  // };
  // await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftAdjustmentProcessingData`, requestOptions6);

  // const requestOptions7 = {
  //   method: "POST",
  //   headers: myHeaders,
  //   redirect: "follow"
  // };
  // const processData = await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/GetShiftAdjustmentProcessingData`, requestOptions7);
  // const procesDatas1 = await processData.json();

  // const requestOptions4 = {
  //   method: "POST",
  //   headers: myHeaders,
  //   redirect: "follow"
  // };
  // await fetch(`${location.origin}/${reqOptions.sl}/tnavue/service/api/ShiftData/DiscardShiftAdjustmentData`, requestOptions4);

  return {
    detailsData
  };
});
