(async function (data, args, reqOptions) {
  if (
    !BeaconBar.user?.metaData?.menus?.some(menu =>
      menu.includes("GrievanceV9/GrievanceHistorySummary")
    )
  ) {
    return { error: true, message: "You do not have access to view grievance history. Please contact HR Admin." };
  }

  async function readJson(response, label) {
    const text = await response.text();
    try {
      return { data: JSON.parse(text) };
    } catch (e) {
      return { error: `${label} did not return JSON (HTTP ${response.status}). First 300 chars of response: ${text.slice(0, 300)}` };
    }
  }

  if (!args.originalRecHeadCode) return "Error: originalRecHeadCode is required - the recHeadCode of the grievance being appealed, from getMyGrievanceHistory.";
  if (!args.originalEmpNumber) return "Error: originalEmpNumber is required - the empNumber of that grievance, from the same getMyGrievanceHistory result.";
  if (!args.originalTempHeadCode) return "Error: originalTempHeadCode is required - the tempHeadCode of that grievance, from the same getMyGrievanceHistory result.";
  if (!args.comment) return "Error: comment is required - the employee's comment/reason for appealing this grievance.";

  const jsonHeaders = new Headers();
  jsonHeaders.append("accept", "application/json, text/plain, */*");
  jsonHeaders.append("content-type", "application/json;charset=UTF-8");

  const indexParams = `oriHeadCode=${args.originalRecHeadCode}&oriEmpNumber=${encodeURIComponent(args.originalEmpNumber)}`;
  const digestKey = await BeaconBar.executeFunction("getDigest")(indexParams);
  const indexRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/AppealGrievance/Index?${indexParams}&digest=${digestKey.digest}`, {
    method: "GET",
    headers: { "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    redirect: "follow"
  });
  const indexHtml = await indexRes.text();
  const doc = new DOMParser().parseFromString(indexHtml, "text/html");
  const newRecHeadCode = doc.querySelector("#hdnRecHeadCode")?.value;

  if (!newRecHeadCode) {
    return `Could not read a new appeal recHeadCode from the Appeal page load (HTTP ${indexRes.status}). AppealGrievance/Index's markup may differ from RecordGrievance/Index's #hdnRecHeadCode field - this needs a real capture of that page's response to confirm. First 300 chars of response: ${indexHtml.slice(0, 300)}`;
  }

  const recHeadCode = `${newRecHeadCode}-${args.originalRecHeadCode}-${args.originalRecHeadCode}`;

  const channelRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/Common/GetTemplateChannelDetails`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      tempCode: args.originalTempHeadCode,
      recHeadCode: args.originalRecHeadCode,
      pageName: "Appeal",
      grievanceEmpNumber: args.originalEmpNumber
    }),
    redirect: "follow"
  });
  const channelResult = await readJson(channelRes, "GetTemplateChannelDetails");
  if (channelResult.error) return channelResult.error;
  const channelMembers = channelResult.data;

  const bypassWanted = (args.bypassChannelMembers || []).map(n => String(n).toLowerCase());
  (channelMembers || []).forEach(m => {
    const name = (m.empDisplayName || "").trim().toLowerCase();
    const shouldBypass = bypassWanted.some(w => name === w || name.includes(w) || m.empDisplayNumber === w);
    if (shouldBypass) {
      m.status_old = m.status;
      m.statusCSS_old = m.statusCSS;
      m.status = "Bypassed";
      m.statusCSS = "label label-bypassed";
      m.chkstatus = 1;
    }
  });

  const previewChannelMembers = (channelMembers || []).map(m => ({
    empDisplayName: (m.empDisplayName || "").trim(),
    designation: m.designation,
    priorityOrder: m.tempPriorityOrder,
    status: m.status
  }));

  if (!args.confirmed) {
    return {
      preview: true,
      message: "Review this appeal with the user before submitting. Call this tool again with confirmed:true (and the same arguments) once they agree.",
      originalRecHeadCode: args.originalRecHeadCode,
      comment: args.comment,
      hideIdentity: !!args.hideIdentity,
      channelMembers: previewChannelMembers
    };
  }

  // appealrefcode: "1" is the exact literal value seen in the one captured Submit call.
  // It may actually need to be the sequential appeal-attempt number (getMyAppealHistory
  // exposes attemptsUsed for an existing appeal) rather than always "1" - kept as the
  // captured value rather than guessing a formula with no second example to check it against.
  const submitRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/AppealGrievance/Submit`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      recModel: {
        recHeadCode: recHeadCode,
        tempCode: args.originalTempHeadCode,
        recDesc: args.comment,
        recSummary: "",
        recHideIdentity: !!args.hideIdentity,
        createdEmpNumber: args.originalEmpNumber,
        appealrefcode: "1",
        channelmems: channelMembers
      }
    }),
    redirect: "follow"
  });

  // Submit does not return JSON - confirmed by the capture: a successful call returns the
  // plain text OK (HTTP 200), same as GrievanceV9/RecordGrievance/Submit.
  const submitText = (await submitRes.text()).trim().replace(/^['"]|['"]$/g, "");
  if (!submitRes.ok || submitText.toLowerCase() !== "ok") {
    return `Appeal submission did not succeed (HTTP ${submitRes.status}): ${submitText || "(empty response)"}`;
  }

  return {
    submitted: true,
    originalRecHeadCode: args.originalRecHeadCode,
    comment: args.comment,
    hideIdentity: !!args.hideIdentity,
    channelMembers: previewChannelMembers
  };
})
