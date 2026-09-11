(async function (data, args, reqOptions) {
  if (
    !BeaconBar.user?.metaData?.menus?.some(menu =>
      menu.includes("GrievanceV9/GrievanceHistorySummary")
    )
  ) {
    return { error: true, message: "You do not have access to view grievance history. Please contact HR Admin." };
  }
  
  if (!args.recHeadCode) return "Error: recHeadCode is required. Call getMyGrievanceHistory first and use the recHeadCode of the grievance the user wants details for.";
  if (!args.tempHeadCode) return "Error: tempHeadCode is required. Use the tempHeadCode returned for this grievance by getMyGrievanceHistory.";
  if (!args.empNumber) return "Error: empNumber is required. Use the empNumber returned for this grievance by getMyGrievanceHistory.";

  const jsonHeaders = new Headers();
  jsonHeaders.append("accept", "application/json, text/plain, */*");
  jsonHeaders.append("content-type", "application/json;charset=UTF-8");

  const detailParams = `recHeadCode=${args.recHeadCode}&isSummary=true`;
  const digestKey = await BeaconBar.executeFunction("getDigest")(detailParams);

  const detailsRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/GrievanceHandle/LoadRecordDetails?${detailParams}&digest=${digestKey.digest}`, {
    method: "GET",
    headers: { "accept": "application/json, text/plain, */*" },
    redirect: "follow"
  });
  const details = await detailsRes.json();

  const channelRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/Common/GetTemplateChannelDetails`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      tempCode: args.tempHeadCode,
      recHeadCode: args.recHeadCode,
      pageName: "Handle",
      grievanceEmpNumber: args.empNumber
    }),
    redirect: "follow"
  });
  const channelMembers = await channelRes.json();

  const feedbackRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/Common/GetChannelMemberFeedbackDetails`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ recHeadCode: args.recHeadCode }),
    redirect: "follow"
  });
  const feedback = await feedbackRes.json();

  return {
    recHeadCode: details.RECHEAD_CODE,
    name: details.RECHEAD_NAME,
    comment: details.RECHEAD_COMMENT,
    submittedDate: details.RECHEAD_SUBMIT_DATE,
    emojiRating: details.RECHEAD_EMOJI_RATING,
    isNextLevel: details.isNextLevel,
    appealed: details.APPEALED === 1,
    canAppeal: !details.cannotAppeal,
    ground: details.rootSource,
    subGround: details.subSource,
    channelMembers: (channelMembers || []).map(m => ({
      empDisplayName: (m.empDisplayName || "").trim(),
      empDisplayNumber: m.empDisplayNumber,
      designation: m.designation,
      priorityOrder: m.tempPriorityOrder,
      status: m.status,
      comment: m.comment
    })),
    feedback: (feedback || []).map(f => ({
      empDisplayName: (f.empDisplayName || "").trim(),
      empDisplayNumber: f.empDisplayNumber,
      designation: f.designation,
      comment: f.comment
    }))
  };
})
