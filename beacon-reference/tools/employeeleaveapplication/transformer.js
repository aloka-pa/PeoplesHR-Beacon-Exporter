(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("__cfafvalue", window.csrf);
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const approverResponse = await fetch(
    `${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/GetApprovalPerson/`,
    {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        EmpNumber: window.empLog,
        LeaveGroup: args.leaveGroupCode,
        LeaveYear: args.year,
        LeaveType: args.leaveTypeCode,
        ApplicationPage: 1
      }),
      redirect: "follow"
    }
  );

  const approverData = await approverResponse.json();
  const approverNumber = approverData.EmpNumber || "";

  const calculateResponse = await fetch(
    `${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/CalculateLeaveDays/`,
    {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
        EmpNumber: window.empLog,
        LeaveGroup: args.leaveGroupCode,
        LeaveYear: args.year,
        LeaveType: args.leaveType,
        FromDateText: args.fromDate,
        ToDateText: args.toDate,
        IsAllDaysEditable: true,
        BreakdownList: [],
        EarnedLeaveList: [],
        NotificationList: [],
        MedicalIssueDateText: "",
        Attachment: { AttachmentName: "-1" },
        Attachments: null,
        Date_1_Text: "",
        Date_2_Text: "",
        Date_3_Text: "",
        Date_4_Text: "",
        Date_5_Text: "",
        ApprovalEmpNumber: approverNumber,
        LoginEmpNumber: window.logKey,
        ApplicationPage: 1,
        ExtraMaternityDays: 0
      }),
      redirect: "follow"
    }
  );

  let calculateDetails = await calculateResponse.json();

  if (calculateDetails.Status === false) {
    return calculateDetails;
  }

  const leaveComment = (args.comment || args.Comment || "").trim();

  calculateDetails.BreakdownList.forEach(x => {
    args.dayModes.forEach(y => {
      if (x.LeaveDate === y.date) {
        x.DayValue = y.dayValue;
        x.DayMode = y.dayMode;
      }
    });
  });

  const sum = args.dayModes.reduce((total, x) => total + x.dayValue, 0);

  if (calculateDetails.Status) {

    // ── Resolve attachment: args.attachment (base64) takes priority, ──
    // ── then fall back to BeaconBar uploaded files.                  ──
    let file1 = null;

    // if (args.attachment?.base64Data && args.attachment?.fileName) {
    //   const byteChars = atob(args.attachment.base64Data);
    //   const byteArr = new Uint8Array(byteChars.length);
    //   for (let i = 0; i < byteChars.length; i++) {
    //     byteArr[i] = byteChars.charCodeAt(i);
    //   }
    //   const blob = new Blob([byteArr]);
    //   file1 = new File([blob], args.attachment.fileName);
    // } else {

    // }

    // ── Guard: block submission if attachment is mandatory but missing ──
    if (args.isAttachmentMandatory) {
      const baoFiles = BeaconBar.getUploadedBaoFiles();
      file1 = baoFiles[0] || null;
    } else {
      return {
        Status: false,
        Message: "This leave type requires a mandatory attachment. Please upload a file and try again."
      };
    }

    let attachmentResult;

    if (file1) {
      const formData = new FormData();
      formData.append(file1.name, file1, file1.name);

      const response = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/UploadLeaveAttachmentData/`, {
        method: "POST",
        headers: {
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: formData,
        credentials: "include",
        redirect: "follow"
      });

      attachmentResult = await response.json();
    } else {
      const saveResponse = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/SaveLeaveApplication/`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          EmpNumber: window.logKey,
          ApprovalEmpNumber: approverNumber,
          LeaveGroup: args.leaveGroupCode,
          LeaveYear: args.year,
          LeaveType: args.leaveTypeCode,
          FromDateText: args.fromDate,
          ToDateText: args.toDate,
          Comment: leaveComment,
          IsAllDaysEditable: true,
          LeaveAmount: sum,
          LeaveAmountToVldt: sum,
          BreakdownList: calculateDetails.BreakdownList,
          EarnedLeaveList: [],
          NotificationList: [],
          IsMedicalLeave: false,
          MedicalIssueDateText: "",
          Attachment: { AttachmentName: "-1" },
          Attachments: null,
          Date_1_Text: "",
          Date_2_Text: "",
          Date_3_Text: "",
          Date_4_Text: "",
          Date_5_Text: "",
          CoveringEmpNumber: args.coveringEmployeeCode,
          LoginEmpNumber: window.logKey,
          ApplicationPage: 1,
          ExtraMaternityDays: 0
        }),
        redirect: "follow"
      });

      return await saveResponse.json();
    }

    if (attachmentResult.Status === true) {
      const saveResponse = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/SaveLeaveApplication/`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({
          EmpNumber: window.logKey,
          ApprovalEmpNumber: approverNumber,
          LeaveGroup: args.leaveGroupCode,
          LeaveYear: args.year,
          LeaveType: args.leaveTypeCode,
          FromDateText: args.fromDate,
          ToDateText: args.toDate,
          Comment: leaveComment,
          IsAllDaysEditable: true,
          LeaveAmount: sum,
          LeaveAmountToVldt: sum,
          BreakdownList: calculateDetails.BreakdownList,
          EarnedLeaveList: [],
          NotificationList: [],
          IsMedicalLeave: false,
          MedicalIssueDateText: "",
          Attachments: [{ AttachmentName: file1.name }],
          Attachment: { AttachmentName: "" },
          Date_1_Text: "",
          Date_2_Text: "",
          Date_3_Text: "",
          Date_4_Text: "",
          Date_5_Text: "",
          CoveringEmpNumber: args.coveringEmployeeCode,
          LoginEmpNumber: window.logKey,
          ApplicationPage: 1,
          ExtraMaternityDays: 0
        }),
        redirect: "follow"
      });

      return await saveResponse.json();
    } else {
      return attachmentResult;
    }
  } else {
    return calculateDetails;
  }
});