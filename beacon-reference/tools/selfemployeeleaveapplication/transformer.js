(async function (data, args, reqOptions) {
  debugger;
  if (!BeaconBar.user.metaData.menus.some(menu =>menu.includes("AbsenceV9/LeaveHistory/LeaveHistory?mvc=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const empKey = await BeaconBar.executeFunction("employeeLeaveApplication")();

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
        EmpNumber: empKey,
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
        EmpNumber: empKey,
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
        LoginEmpNumber: window.empLog,
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

  const inputLeaveReason = (args.leaveReason || args.LeaveReason || "").trim();

  const modelScript = [...document.querySelectorAll("script")]
  .map(s => s.textContent)
  .find(t => t.includes("var model ="));

  const modelMatch = modelScript?.match(/var\s+model\s*=\s*'([\s\S]*?)';/);

  const pageModel = modelMatch ? JSON.parse(modelMatch[1]) : null;

  const reasonOptions = (pageModel?.ReasonList || []).map(x => ({
    text: decodeURIComponent(x.Description || ""),
    value: x.ReasonCode
  }));

  const matchedReason = reasonOptions.find(
  x => x.text.toLowerCase() === inputLeaveReason.toLowerCase()
);

const leaveReason = matchedReason ? matchedReason.value : "";


    calculateDetails.BreakdownList?.forEach(x => {
      args.dayModes?.forEach(y => {
        if (x.LeaveDate === y.date) {
          x.DayValue = y.dayValue;
          x.DayMode = y.dayMode;
        }
      });
    });

  const sum = args.dayModes.reduce((total, x) => total + x.dayValue, 0);

  if (!calculateDetails.Status) {
    return calculateDetails;
  }

  /* -------------------------------------------------
   * Attachments.
   *
   * Two sources, in priority order, matching subordinatesLeaveApplication:
   *   1. an explicit `attachment` argument carrying base64 + fileName, for
   *      when the chat hands the file over as data;
   *   2. BeaconBar.getUploadedBaoFiles(), the files attached in the chat -
   *      the route this tool has always used.
   * The BeaconBar read is guarded: a host without the helper has to degrade
   * to "no files" rather than throw and lose the whole application.
   * ------------------------------------------------- */
  const attachmentSources = { baoHelperPresent: false, baoCount: 0, base64Count: 0, error: null };

  function uploadedFiles() {
    const files = [];

    const rawAttachment = args.attachment || args.Attachment || args.attachments || args.Attachments;
    const attachmentList = Array.isArray(rawAttachment)
      ? rawAttachment
      : (rawAttachment ? [rawAttachment] : []);

    attachmentList.forEach(function (att) {
      if (!att || typeof att !== "object") return;
      const base64 = att.base64Data || att.base64 || att.data || att.Base64Data;
      const fileName = att.fileName || att.name || att.filename || att.FileName;
      if (!base64 || !fileName) return;
      try {
        // A data: URL prefix is stripped first - atob only takes the payload.
        const clean = String(base64).replace(/^data:[^,]*,/, "");
        const byteChars = atob(clean);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
        files.push(new File([new Blob([byteArr])], fileName));
        attachmentSources.base64Count++;
      } catch (e) {
        attachmentSources.error = "base64 decode failed for " + fileName;
      }
    });

    try {
      if (BeaconBar && typeof BeaconBar.getUploadedBaoFiles === "function") {
        attachmentSources.baoHelperPresent = true;
        const bao = BeaconBar.getUploadedBaoFiles();
        const baoList = Array.isArray(bao) ? bao.filter(Boolean) : (bao ? [bao] : []);
        attachmentSources.baoCount = baoList.length;
        baoList.forEach(function (f) { files.push(f); });
      }
    } catch (e) {
      attachmentSources.error = String((e && e.message) || e);
    }

    return files;
  }

  const attachments = uploadedFiles();

  /* This screen never loads the leave type record, so whether a document is
   * compulsory can only come from the caller - the same contract
   * employeeLeaveApplication documents as isAttachmentMandatory, read off
   * IsAttachmentRequired in the leave balance response. Stopping here keeps
   * a leave type that demands a document from being submitted bare and then
   * rejected by the server, which reads to the user as an unexplained
   * failure. */
  const attachmentMandatory = args.isAttachmentMandatory === true
    || args.isAttachmentMandatory === 1
    || args.isAttachmentMandatory === "true";

  if (attachmentMandatory && attachments.length === 0) {
    return {
      Status: false,
      Message: "This leave type needs a supporting document. Please attach the file to this chat and ask again - it will be uploaded with the application.",
      /* Says why no file was found, so a genuinely missing attachment is
       * never reported back as "attachments are not supported". */
      Diagnostics: {
        toolSupportsAttachments: true,
        beaconBarHelperPresent: attachmentSources.baoHelperPresent,
        filesFromChat: attachmentSources.baoCount,
        filesFromBase64Argument: attachmentSources.base64Count,
        attachmentArgumentSeen: !!(args.attachment || args.Attachment || args.attachments || args.Attachments),
        readError: attachmentSources.error
      }
    };
  }


  function describeSize(bytes) {
    if (!Number.isFinite(bytes)) return null;
    return (Math.round((bytes / (1024 * 1024)) * 100) / 100) + " MB";
  }

  /* -------------------------------------------------
   * Attachment upload - and with it the size check.
   *
   * There is no size limit to test against in the client. The limit is
   * configured per install and enforced by the server, which answers an
   * oversized file with HTTP 200 and a failure body naming the number:
   *   { Status: false,
   *     Message: "Selected file size exceeds the maximum file size of  3 MB",
   *     IsMsgDefinedAsKey: true, ... }
   * Captured against UploadLeaveAttachmentData. So the file is offered to
   * the server and the server's own answer is what refuses it. Nothing here
   * guesses a limit, and a limit HR changes later needs no edit to this tool.
   *
   * This runs ABOVE the confirmation gate on purpose. The screen itself
   * uploads the moment a file is picked and Save merely references the
   * stored name, so uploading first is what the host does - and it is what
   * lets a size rejection reach the user BEFORE they are asked to commit.
   * A file the user then abandons is left staged server-side exactly as the
   * screen leaves it; an upload on its own creates no leave application.
   *
   * Returning early on a failure is deliberate - a half-done attachment
   * must never leave a saved application without its document.
   *
   * No Content-Type header on the upload on purpose: FormData sets its own
   * multipart boundary, and naming the type by hand loses it.
   * ------------------------------------------------- */
  const attachmentNames = [];
  for (let i = 0; i < attachments.length; i++) {
    const file = attachments[i];
    const formData = new FormData();
    formData.append(file.name, file, file.name);

    let uploadBody = null;
    let uploadStatus = 0;
    try {
      const uploadResponse = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/UploadLeaveAttachmentData/`, {
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
      uploadStatus = uploadResponse.status;
      uploadBody = await uploadResponse.json().catch(function () { return null; });
    } catch (e) {
      uploadBody = null;
    }

    if (!uploadBody || uploadBody.Status !== true) {
      /* The server's own wording is the message the user sees - it names the
       * configured limit, which nothing on this side knows. Runs of spaces
       * are collapsed because the captured text carries a double space
       * before the number, an artefact of the message being assembled from
       * a resource key (IsMsgDefinedAsKey). */
      const serverMessage = uploadBody && uploadBody.Message
        ? String(uploadBody.Message).replace(/\s+/g, " ").trim()
        : "";

      return {
        Status: false,
        Message: serverMessage
          || `Could not upload "${file.name}". Nothing has been submitted - please try attaching the file again.`,
        ApiResponse: uploadBody,
        Diagnostics: {
          uploadHttpStatus: uploadStatus,
          fileName: file.name,
          fileSize: describeSize(file.size),
          fileCount: attachments.length
        }
      };
    }

    attachmentNames.push({ AttachmentName: file.name });
  }

  /* -------------------------------------------------
   * Confirmation gate.
   *
   * Nothing above this point has written a leave application: the approver
   * is resolved, the days are calculated, and the attachment has been
   * checked against both the mandatory rule and the server's size limit.
   * The first call therefore stops here and hands back a preview, and the
   * application is submitted only when the caller comes back with
   * confirmed:true - which it may set only once the user has agreed.
   *
   * The upload sits above this gate so that a file the server will not
   * accept is refused before the user is ever asked to confirm.
   * ------------------------------------------------- */
  const confirmed = args.confirmed === true
    || args.confirmed === 1
    || args.confirmed === "true";

  if (!confirmed) {
    // Names, never the numbers - the same mapping the day mode argument uses.
    const dayModeNames = { 2: "Whole Day", 1: "First Half", 0: "Second Half", 7: "Off Day" };

    return {
      needsConfirmation: true,
      Message: "Please check this leave application with the user and confirm before it is submitted. Nothing has been saved yet.",
      Preview: {
        fromDate: args.fromDate,
        toDate: args.toDate,
        totalDays: sum,
        days: (calculateDetails.BreakdownList || []).map(function (d) {
          return {
            date: d.LeaveDate,
            dayMode: dayModeNames[d.DayMode] || String(d.DayMode),
            dayValue: d.DayValue
          };
        }),
        comment: leaveComment,
        // The display name the user gave, never the resolved ReasonCode.
        leaveReason: inputLeaveReason,
        // A covering employee code is an encoded identifier, so only say
        // whether one was supplied.
        coveringEmployeeGiven: !!args.coveringEmployeeCode,
        // Already uploaded, so the server has accepted every one of these.
        attachments: attachments.map(function (f) {
          return { name: f.name, size: describeSize(f.size) };
        }),
        attachmentRequired: attachmentMandatory
      },
      ConfirmationPrompt: "Shall I submit this leave application? Reply yes to submit, or tell me what to change."
    };
  }

  const hasAttachment = attachmentNames.length > 0;

  /* One save serves both paths, so the with-file and without-file payloads
   * cannot drift apart. Attachment/Attachments follow
   * employeeLeaveApplication: the names go in Attachments and Attachment is
   * blanked. With no file at all Attachment carries "-1" and Attachments is
   * null, which is what every one of these tools has always sent. */
  const saveResponse = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveApplication/SaveLeaveApplication/`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      EmpNumber: empKey,
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
      Attachment: hasAttachment ? { AttachmentName: "" } : { AttachmentName: "-1" },
      Attachments: hasAttachment ? attachmentNames : null,
      Date_1_Text: "",
      Date_2_Text: "",
      Date_3_Text: "",
      Date_4_Text: "",
      Date_5_Text: "",
      CoveringEmpNumber: args.coveringEmployeeCode,
      LeaveReason: leaveReason,
      LoginEmpNumber: window.empLog,
      ApplicationPage: 1,
      ExtraMaternityDays: 0
    }),
    redirect: "follow"
  });

  return await saveResponse.json();
});