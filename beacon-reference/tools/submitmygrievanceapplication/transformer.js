(async function (data, args, reqOptions) {
  // Grounds are fetched first - a cheap, session-independent call - just to build the
  // grounds list and to fail fast if none are configured at all (ground is mandatory to
  // submit a grievance, so there is nothing else to do about it in that case).
  const sourcesRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/GetGrievanceSources`, {
    method: "GET",
    headers: { "accept": "application/json, text/plain, */*" },
    redirect: "follow"
  });
  const sources = await sourcesRes.json();

  // Grounds are single-select - exactly one node ends up isChecked. A main ground that
  // has sublevel grounds is never itself selectable; the user must pick one of its subs
  // (UAC 1.3). A main ground with no subs is a leaf and is selectable directly. Sub-ground
  // names are qualified as "MainGround.SubGround" for display/matching so they read as
  // nested under their main ground instead of a flat, undifferentiated list.
  const mainGrounds = (sources || []).map(g => ({
    code: g.srcListCode,
    name: g.srcListName,
    node: g,
    subGrounds: (g.subGrievanceSources || []).map(sub => ({
      code: sub.srcListCode,
      name: sub.srcListName,
      node: sub,
      mainName: g.srcListName
    }))
  }));
  const allSubGrounds = mainGrounds.flatMap(g => g.subGrounds);

  if (!mainGrounds.length) {
    return "No grievance grounds are currently available. Please contact your HR administrator.";
  }

  function describeGrounds() {
    return mainGrounds
      .map(g => (g.subGrounds.length ? `${g.name} (${g.subGrounds.map(s => s.name).join(", ")})` : g.name))
      .join("; ");
  }

  function qualifiedName(match) {
    return match.mainName ? `${match.mainName}.${match.name}` : match.name;
  }

  function resolveGround(wantedGroundRaw) {
    const wantedGround = wantedGroundRaw.toLowerCase();
    let groundMatch;

    // "MainGround.SubGround" lets the caller disambiguate a sub-ground directly.
    if (wantedGround.includes(".")) {
      const dotIndex = wantedGround.indexOf(".");
      const wantedMain = wantedGround.slice(0, dotIndex).trim();
      const wantedSub = wantedGround.slice(dotIndex + 1).trim();
      const mainForSub = mainGrounds.find(g => g.name.toLowerCase() === wantedMain);
      if (mainForSub) {
        groundMatch = mainForSub.subGrounds.find(s => s.name.toLowerCase() === wantedSub)
          || mainForSub.subGrounds.find(s => s.name.toLowerCase().includes(wantedSub));
      }
    }

    if (!groundMatch) {
      // Only leaf-level nodes are ever matched here: main grounds without subs, plus every
      // sub-ground. A main ground that has subs is deliberately excluded - handled below.
      const leafMains = mainGrounds.filter(g => !g.subGrounds.length);
      const candidates = [...leafMains, ...allSubGrounds];

      const exact = candidates.filter(g => g.name.toLowerCase() === wantedGround);
      const matches = exact.length ? exact : candidates.filter(g => g.name.toLowerCase().includes(wantedGround));

      if (matches.length > 1) {
        return { ambiguous: matches.map(qualifiedName) };
      }
      groundMatch = matches[0];

      if (!groundMatch) {
        const parentWithSubs = mainGrounds.find(g => g.subGrounds.length && g.name.toLowerCase() === wantedGround);
        if (parentWithSubs) {
          return { needsSub: parentWithSubs.subGrounds.map(s => s.name), parentName: parentWithSubs.name };
        }
        return { notFound: true };
      }
    }

    return { match: groundMatch };
  }

  // Session/template bootstrap - template selection comes before ground selection and
  // before any other detail is collected. This also means channel members (tied only to
  // the resolved template) can be fetched and returned as soon as a template is known,
  // without ever requiring ground/summary/description/mood - e.g. "who will handle this
  // grievance?" is answerable right after the template is picked.
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

  // Channel members depend only on the resolved template - fetched here, before ground is
  // even checked, so they are included in every response returned from this point on,
  // regardless of what else is still missing.
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

  // Confirmed via Beacon's own validation message (type "Grievance", key
  // "GrCannotByPassAllChannels": "You are not allowed to bypass all the channels in
  // grievance application.") - at least one channel member must remain un-bypassed, even
  // when every individual member named is otherwise a valid, multi-member-channel bypass.
  // Checked against the flat member list as a whole; if channels are tracked as separate
  // groups server-side (distinct from this flat list), a per-channel version of this same
  // rule may also apply and isn't modeled here - that grouping field hasn't been captured
  // from a live response yet, so this only guards against bypassing every member overall.
  if ((channelMembers || []).length && (channelMembers || []).every(m => m.status === "Bypassed")) {
    return {
      error: "You are not allowed to bypass all the channels in grievance application. At least one channel member must remain.",
      template: template.tempName,
      channelMembers: previewChannelMembers
    };
  }

  // Ground selection comes next. Channel members are already known by this point, so a
  // call that has only named a template still gets them back here even with no ground
  // given yet.
  if (!args.ground) {
    return {
      message: `ground is required. Available grounds: ${describeGrounds()}`,
      template: template.tempName,
      channelMembers: previewChannelMembers
    };
  }

  const resolved = resolveGround(args.ground);

  if (resolved.ambiguous) {
    return {
      message: `More than one grievance ground matches "${args.ground}": ${resolved.ambiguous.join(", ")}. Ask the user which one and call again with the exact name (use "MainGround.SubGround" if needed).`,
      template: template.tempName,
      channelMembers: previewChannelMembers
    };
  }
  if (resolved.needsSub) {
    return {
      message: `"${resolved.parentName}" has sublevel grounds - ask the user to pick one: ${resolved.needsSub.join(", ")}.`,
      template: template.tempName,
      channelMembers: previewChannelMembers
    };
  }
  if (!resolved.match) {
    return {
      message: `Could not find a grievance ground matching "${args.ground}". Available grounds: ${describeGrounds()}`,
      template: template.tempName,
      channelMembers: previewChannelMembers
    };
  }

  const groundMatch = resolved.match;
  groundMatch.node.isChecked = true;
  const groundDisplay = qualifiedName(groundMatch);

  // Other details are collected last: summary, then description, then mood. Template and
  // channel members are already resolved by this point, so both are still included even
  // when these are missing.
  if (!args.summary) {
    return {
      error: "summary is required - a short summary of the grievance.",
      template: template.tempName,
      ground: groundDisplay,
      channelMembers: previewChannelMembers
    };
  }
  // Confirmed live: submitting with description left blank is rejected by the real
  // Grievance Application screen (type "Grievance", key "GrFormError": "Please fill the
  // required fields." - a generic required-fields message, not description-specific, but
  // description was the field left blank in the capture that produced it). Description is
  // mandatory, not optional, despite being declared optional in the schema so it never
  // blocks template/ground/channel discovery.
  if (!args.description) {
    return {
      error: "description is required - the full description/details of the grievance.",
      template: template.tempName,
      ground: groundDisplay,
      channelMembers: previewChannelMembers
    };
  }
  // Confirmed via Beacon's own client-side validation message (GrEmojiError: "Please
  // specify the Current Mood.") - mood is mandatory, not optional. Checked here rather
  // than declared schema-required so it never blocks template/ground/channel discovery.
  if (!args.moodRating) {
    return {
      error: "moodRating is required - ask the user for their current mood (1-5) before submitting.",
      template: template.tempName,
      ground: groundDisplay,
      channelMembers: previewChannelMembers
    };
  }

  // Attachments are optional (UAC 1.5) and come only from the Beacon chat's own upload
  // mechanism - the same source every other tool in this org reads from. No base64/object
  // argument fallback is added here since nothing confirms the Grievance module ever
  // receives a file any other way. Guarded so a host without the helper degrades to "no
  // files" rather than throw.
  function uploadedFiles() {
    try {
      if (BeaconBar && typeof BeaconBar.getUploadedBaoFiles === "function") {
        const bao = BeaconBar.getUploadedBaoFiles();
        return Array.isArray(bao) ? bao.filter(Boolean) : (bao ? [bao] : []);
      }
    } catch (e) {
      // Degrade to "no files" rather than throw.
    }
    return [];
  }

  const attachedFiles = uploadedFiles();
  const attachmentTitles = args.attachmentTitles || {};

  // Local, immediate size check - so the employee finds out the moment they attach an
  // oversized file, not only after filling in the rest of the application and confirming.
  // This is a heuristic, not the authoritative check: 2 MB is the limit a real live
  // rejection returned ("The maximum file size allowed for the Attachment is 2 MB."), but
  // nothing confirms this is fixed rather than configurable (per file type, per tenant, or
  // changeable later) - so a file under 2MB still goes through the real AttachmentUpload
  // call at confirmed:true, which remains the actual source of truth and can still reject
  // it for a different reason. This check only ever short-circuits the obviously-too-big
  // case early; it never green-lights a file the server would otherwise reject.
  const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
  const oversizedFiles = attachedFiles.filter(f => typeof f.size === "number" && f.size > MAX_ATTACHMENT_BYTES);
  if (oversizedFiles.length) {
    return {
      message: `${oversizedFiles.map(f => `"${f.name}" is ${(f.size / (1024 * 1024)).toFixed(1)} MB`).join(", ")} - the maximum attachment size is 2 MB. Ask the user to attach a smaller file instead, or continue without it.`,
      template: template.tempName,
      ground: groundDisplay,
      channelMembers: previewChannelMembers
    };
  }

  // A title is mandatory per attachment - confirmed live (type "Grievance", key
  // "ErrorEmptyAttachmentTitleMsg": "Attachment Title cannot be empty.") - and is always
  // asked for explicitly; there is no filename-based default. Keyed by file name so
  // multiple attachments never get ambiguously matched.
  if (attachedFiles.length) {
    const missingTitles = attachedFiles
      .map(f => f.name)
      .filter(name => !attachmentTitles[name] || !String(attachmentTitles[name]).trim());

    if (missingTitles.length) {
      return {
        message: `Please provide a title for ${missingTitles.length > 1 ? "each of these attachments" : "this attachment"}: ${missingTitles.join(", ")}. Pass them in attachmentTitles, keyed by file name (e.g. {"${missingTitles[0]}": "Medical certificate"}).`,
        template: template.tempName,
        ground: groundDisplay,
        channelMembers: previewChannelMembers
      };
    }
  }

  const attachmentPreview = attachedFiles.map(f => ({ fileName: f.name, title: attachmentTitles[f.name] }));

  if (!args.confirmed) {
    return {
      preview: true,
      message: "Review this grievance with the user before submitting. Call this tool again with confirmed:true (and the same arguments) once they agree.",
      ground: groundDisplay,
      template: template.tempName,
      summary: args.summary,
      description: args.description || "",
      hideIdentity: !!args.hideIdentity,
      moodRating: args.moodRating,
      attachments: attachmentPreview,
      channelMembers: previewChannelMembers
    };
  }

  // Attachments are uploaded before Submit, one file per call - the only shape this
  // endpoint accepts (single uploadFile + fileTypedName + fileName + recHeadCode per POST,
  // plain-text "OK" on success - confirmed live, same convention as Submit's own "OK"). If
  // any single upload fails, stop here and relay its exact server message (e.g. "Chosen
  // document type is invalid. Valid document types are ..." - confirmed live) - Submit is
  // never called, so a partially-attached grievance is never created. No file type/size is
  // pre-validated client-side; whatever the server says at upload time is the only truth,
  // since both can vary and aren't enumerable here.
  for (const file of attachedFiles) {
    const uploadFormData = new FormData();
    uploadFormData.append("uploadFile", file, file.name);
    uploadFormData.append("fileTypedName", attachmentTitles[file.name]);
    uploadFormData.append("fileName", file.name);
    uploadFormData.append("recHeadCode", recHeadCode);

    // No content-type header here on purpose - FormData sets its own multipart boundary.
    const uploadRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/AttachmentUpload`, {
      method: "POST",
      headers: { "accept": "application/json, text/plain, */*" },
      body: uploadFormData,
      redirect: "follow"
    });
    const uploadText = (await uploadRes.text()).trim();
    if (uploadText.toLowerCase() !== "ok") {
      return {
        error: `Could not attach "${file.name}": ${uploadText || "(empty response)"}`,
        template: template.tempName,
        ground: groundDisplay,
        channelMembers: previewChannelMembers
      };
    }
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

  // Round-trip once against the module's own attachment list rather than trusting our own
  // upload calls did exactly what was intended - authoritative names/ids for the response.
  // Attachments are not referenced anywhere in the Submit payload above; the module links
  // them to the grievance purely via recHeadCode, independent of the Submit call.
  let attachmentsResult = attachmentPreview;
  if (attachedFiles.length) {
    try {
      const attListRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/GetAttachmentLists`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ recHeadCode: recHeadCode }),
        redirect: "follow"
      });
      const attList = await attListRes.json();
      if (Array.isArray(attList)) {
        attachmentsResult = attList.map(a => ({ attId: a.attId, fileName: a.attName, title: a.attDescription }));
      }
    } catch (e) {
      // Keep the locally-known list if this verification call itself fails - the uploads
      // already succeeded above, so this is a display-only fallback, not a submission risk.
    }
  }

  return {
    submitted: true,
    recHeadCode: recHeadCode,
    ground: groundDisplay,
    template: template.tempName,
    summary: args.summary,
    description: args.description || "",
    hideIdentity: !!args.hideIdentity,
    moodRating: args.moodRating || null,
    attachments: attachmentsResult,
    channelMembers: previewChannelMembers
  };
})
