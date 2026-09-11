(async function (data, args, reqOptions) {
  // Grounds are fetched first, before anything else, so a call with no ground (or an
  // unmatched one) always returns the real available list immediately - no employee
  // bootstrap or session state needed to answer "what grounds are there".
  const sourcesRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/GetGrievanceSources`, {
    method: "GET",
    headers: { "accept": "application/json, text/plain, */*" },
    redirect: "follow"
  });
  const sources = await sourcesRes.json();

  const flatGrounds = [];
  (sources || []).forEach(g => {
    flatGrounds.push({ code: g.srcListCode, name: g.srcListName, node: g });
    (g.subGrievanceSources || []).forEach(sub => flatGrounds.push({ code: sub.srcListCode, name: sub.srcListName, node: sub }));
  });

  if (!args.ground) {
    return `ground is required. Available grounds: ${flatGrounds.map(g => g.name).join(", ")}`;
  }

  const wantedGround = args.ground.toLowerCase();
  const groundMatch = flatGrounds.find(g => g.name.toLowerCase() === wantedGround)
    || flatGrounds.find(g => g.name.toLowerCase().includes(wantedGround));

  if (!groundMatch) {
    return `Could not find a grievance ground matching "${args.ground}". Available grounds: ${flatGrounds.map(g => g.name).join(", ")}`;
  }
  groundMatch.node.isChecked = true;

  if (!args.summary) return "Error: summary is required - a short summary of the grievance.";
  // Confirmed via Beacon's own client-side validation message (GrEmojiError: "Please
  // specify the Current Mood.") - mood is mandatory, not optional. Checked here rather
  // than declared schema-required so it never blocks the ground-discovery call above.
  if (!args.moodRating) return "Error: moodRating is required - ask the user for their current mood (1-5) before submitting.";

  async function getNewGrievanceBootstrap() {
    const digestKey = await BeaconBar.executeFunction("getDigest")("type=0");
    const indexRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/Index?type=0&digest=${digestKey.digest}`, {
      method: "GET",
      headers: { "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      redirect: "follow"
    });
    const indexHtml = await indexRes.text();
    const doc = new DOMParser().parseFromString(indexHtml, "text/html");

    const recHeadCode = doc.querySelector("#hdnRecHeadCode")?.value;
    const selectedEmpNumber = doc.querySelector("#hdnSelectedEmpNumber")?.value;
    const commonComEmpNumber = doc.querySelector("#hdnCommonComempNumber")?.value;

    if (!recHeadCode || !selectedEmpNumber || !commonComEmpNumber) {
      return { error: "Could not load the New Grievance page - please try again." };
    }

    const empDetailsRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/Common/GetEmployeeDetails?empNumber=${encodeURIComponent(commonComEmpNumber)}`, {
      method: "GET",
      headers: { "accept": "application/json, text/plain, */*" },
      redirect: "follow"
    });
    const empDetails = await empDetailsRes.json();

    if (!empDetails?.empNumberEncrypt) {
      return { error: "Could not resolve the logged-in employee's details - please try again." };
    }

    return { recHeadCode, selectedEmpNumber, createdEmpNumber: empDetails.empNumberEncrypt };
  }

  const bootstrap = await getNewGrievanceBootstrap();
  if (bootstrap.error) return bootstrap.error;
  const { recHeadCode, selectedEmpNumber, createdEmpNumber } = bootstrap;

  const jsonHeaders = new Headers();
  jsonHeaders.append("accept", "application/json, text/plain, */*");
  jsonHeaders.append("content-type", "application/json;charset=UTF-8");

  const templatesRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/GetTemplateHeads?empNumber=${encodeURIComponent(selectedEmpNumber)}`, {
    method: "GET",
    headers: { "accept": "application/json, text/plain, */*" },
    redirect: "follow"
  });
  const templates = await templatesRes.json();

  let template;
  if (args.templateName) {
    const wantedTemplate = args.templateName.toLowerCase();
    template = (templates || []).find(t => t.tempName.toLowerCase() === wantedTemplate)
      || (templates || []).find(t => t.tempName.toLowerCase().includes(wantedTemplate));
    if (!template) {
      return `Could not find a grievance template matching "${args.templateName}". Available templates: ${(templates || []).map(t => t.tempName).join(", ")}`;
    }
  } else if ((templates || []).length === 1) {
    template = templates[0];
  } else {
    return `Multiple grievance templates are available: ${(templates || []).map(t => t.tempName).join(", ")}. Ask the user which one to use and call this tool again with templateName set.`;
  }

  const channelRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/Common/GetTemplateChannelDetails`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      tempCode: template.tempCode,
      recHeadCode: recHeadCode,
      pageName: "Application",
      grievanceEmpNumber: selectedEmpNumber
    }),
    redirect: "follow"
  });
  const channelMembers = await channelRes.json();

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
      message: "Review this grievance with the user before submitting. Call this tool again with confirmed:true (and the same arguments) once they agree.",
      ground: groundMatch.name,
      template: template.tempName,
      summary: args.summary,
      description: args.description || "",
      hideIdentity: !!args.hideIdentity,
      moodRating: args.moodRating,
      channelMembers: previewChannelMembers
    };
  }

  const submitRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/Submit`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      recModel: {
        recHeadCode: recHeadCode,
        tempCode: template.tempCode,
        recDesc: args.description || "",
        recSummary: args.summary,
        recHideIdentity: !!args.hideIdentity,
        createdEmpNumber: createdEmpNumber,
        emojiRating: args.moodRating,
        channelmems: channelMembers
      },
      sources: sources
    }),
    redirect: "follow"
  });

  const submitText = (await submitRes.text()).trim();
  if (submitText.toLowerCase() !== "ok") {
    return `Submit did not succeed: ${submitText || "(empty response)"}`;
  }

  return {
    submitted: true,
    recHeadCode: recHeadCode,
    ground: groundMatch.name,
    template: template.tempName,
    summary: args.summary,
    description: args.description || "",
    hideIdentity: !!args.hideIdentity,
    moodRating: args.moodRating || null,
    channelMembers: previewChannelMembers
  };
})
