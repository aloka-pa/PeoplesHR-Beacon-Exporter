(async function (data, args, reqOptions) {
  try {
    if (
      !BeaconBar.user?.metaData?.menus?.some(menu =>
        menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000002")
      )
    ) {
      return { error: true, message: "You do not have access to apply for grievance. Please contact HR Admin." };
    }


    const subordinateQueries = Array.isArray(args.subordinates)
      ? args.subordinates.map((s) => String(s).trim()).filter((s) => s.length > 0)
      : [];
    const existingNeedName = args.existingNeedName ? String(args.existingNeedName).trim() : "";
    const newNeedName = args.newNeedName ? String(args.newNeedName).trim() : "";
    const newNeedDescription = args.newNeedDescription ? String(args.newNeedDescription).trim() : "";
    const objective = args.objective ? String(args.objective).trim() : "";
    const relevanceToJob = args.relevanceToJob ? String(args.relevanceToJob).trim() : "";
    const benefitToEmployee = args.benefitToEmployee ? String(args.benefitToEmployee).trim() : "";
    const benefitToCompany = args.benefitToCompany ? String(args.benefitToCompany).trim() : "";

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    async function postJson(path, body) {
      const url = `${window.origin}/${reqOptions.sl}/${path}`;
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: body !== undefined ? JSON.stringify(body) : undefined
        });
      } catch (networkError) {
        throw new Error(`Could not reach ${path}: ${networkError.message}`);
      }
      const rawText = await response.text();
      let parsed = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        throw new Error(`${path} returned a non-JSON response (HTTP ${response.status}).`);
      }
      if (!response.ok) {
        const detail = (parsed && (parsed.Message || (parsed.Status && parsed.Status.Message))) || rawText.slice(0, 200);
        throw new Error(`${path} failed with HTTP ${response.status}: ${detail}`);
      }
      return parsed;
    }

    // Attachments - mirrors the real form's attachment popup (HRM-TND45-MVC
    // TrainingNeedViewModel.js), one file at a time: each file is checked when it's picked
    // (SelectMainFile - type/size against #tndHdnFileTypes/#tndHdnFileSize), uploaded straight
    // away with TNDV9/TrainingNeed/UploadFile (UploadMainFile - one call per file, as in
    // T and D/Valid file/UploadFile.txt) and added to AttchList, and taken off with
    // TNDV9/TrainingNeed/DeleteFile (RemoveAttachment). Save then just sends AttchList.
    //
    // Runs on EVERY call, before anything can return early, so a file is never missed just
    // because the call that saw it ended at the goal list or a need question. A file is
    // uploaded on the call that first sees it - while the chat still hands over its
    // contents - so the confirming call submits what's already on the server and never
    // needs the file again.
    //
    // BeaconBar.getUploadedBaoFiles() lists every file attached in the conversation and keeps
    // listing a file after it has been dealt with (a rejected images.png came back on every
    // later call). Seen live in Lexi (attachmentCheck): the list is NEWEST first, and only
    // the files of the current message come with their contents - earlier ones are {name,
    // key} stubs. So positions shift with every attachment and can't be used to tell new
    // files from old ones. A listed file is new when either:
    //   - its name is listed more times than on the previous call (re-attaching the very
    //     same file adds another copy), or
    //   - it comes with readable contents and this tool hasn't seen that file object before
    //     (a file of the current message - this also catches a new chat in the same page
    //     whose first file has a name the previous chat already had).
    // Files already dealt with are never processed again, whatever order the chat lists
    // them in; of several copies of one name, an unseen readable copy is taken as the new
    // one. A name listed fewer times than before means a different conversation in the same
    // page, and the tracking starts over; uploaded files whose name the chat no longer lists
    // at all belong to another conversation and are dropped from this application.
    //
    // Page state (window.__peoplesHRTndSupervisorNeedUploads), kept until the application is saved:
    //   chatCounts  - lower-cased name -> how many times the chat listed it on the last call
    //   seenObjects - every file object this tool has already looked at (WeakSet)
    //   staged      - files uploaded for this application: { key, name, type, size, filepath }
    //   leftOut     - lower-cased name -> { name, reason: "removed" | "replaced" | "rejected" }
    //   unavailable - lower-cased name -> name: listed as new, but without readable contents
    const lc = (n) => String(n || "").trim().toLowerCase();

    async function chatEntries() {
      try {
        if (typeof BeaconBar !== "undefined" && typeof BeaconBar.getUploadedBaoFiles === "function") {
          // Awaited like collectChatAttachment does - harmless if it returns a plain value.
          const bao = await BeaconBar.getUploadedBaoFiles();
          return (Array.isArray(bao) ? bao : (bao ? [bao] : [])).filter((f) => f && typeof f === "object" && f.name);
        }
      } catch (e) {
        // Degrade to "no files" rather than throw.
      }
      return [];
    }

    // The chat doesn't always hand over a Blob (the benefit tools saw a wrapper describing
    // the file instead), so whatever arrives - a File, a wrapper holding one, raw bytes,
    // base64, a data: URL or a link - is turned into a Blob, or null if it has no contents.
    function base64ToBlob(text, type) {
      const clean = String(text).replace(/^data:[^,]*,/, "").replace(/\s/g, "");
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], type ? { type: type } : undefined);
    }

    async function fileBlobOf(entry) {
      const type = entry.type || entry.mimeType || entry.contentType || "";
      if (typeof Blob !== "undefined" && entry instanceof Blob) return entry;
      const nested = entry.file || entry.blob || entry.rawFile || entry.originFileObj || entry.fileObject || entry.baoFile;
      if (nested && typeof Blob !== "undefined" && nested instanceof Blob) return nested;
      if (typeof entry.arrayBuffer === "function") {
        return new Blob([await entry.arrayBuffer()], type ? { type: type } : undefined);
      }
      const raw = entry.base64 || entry.base64Data || entry.Base64Data || entry.content || entry.fileData
        || entry.data || entry.bytes || entry.buffer || entry.url || entry.src || entry.fileUrl || entry.downloadUrl;
      if (raw && (raw instanceof ArrayBuffer || ArrayBuffer.isView(raw))) {
        return new Blob([raw], type ? { type: type } : undefined);
      }
      if (typeof raw === "string" && raw) {
        if (/^https?:\/\//i.test(raw) || raw.charAt(0) === "/") {
          const res = await fetch(raw, { redirect: "follow" });
          return await res.blob();
        }
        try { return base64ToBlob(raw, type); } catch (e) { return null; }
      }
      return null;
    }

    const cacheHost = typeof window !== "undefined" ? window : globalThis;
    const attachmentState = cacheHost.__peoplesHRTndSupervisorNeedUploads = cacheHost.__peoplesHRTndSupervisorNeedUploads || {};
    attachmentState.chatCounts = attachmentState.chatCounts || {};
    attachmentState.seenObjects = attachmentState.seenObjects || new WeakSet();
    attachmentState.staged = attachmentState.staged || [];
    attachmentState.leftOut = attachmentState.leftOut || {};
    attachmentState.unavailable = attachmentState.unavailable || {};

    // Each listed file with its contents resolved (null for a {name, key} stub).
    const listed = [];
    for (const entry of await chatEntries()) {
      let blob = null;
      try {
        blob = await fileBlobOf(entry);
      } catch (readError) {
        blob = null;
      }
      listed.push({
        entry: entry,
        name: String(entry.name),
        key: lc(entry.name),
        blob: blob && blob.size ? blob : null,
        unseen: !attachmentState.seenObjects.has(entry)
      });
    }
    listed.forEach((f) => attachmentState.seenObjects.add(f.entry));

    const chatCounts = {};
    listed.forEach((f) => { chatCounts[f.key] = (chatCounts[f.key] || 0) + 1; });
    let previousCounts = attachmentState.chatCounts;
    if (Object.keys(previousCounts).some((k) => (chatCounts[k] || 0) < previousCounts[k])) {
      attachmentState.staged = [];
      attachmentState.leftOut = {};
      attachmentState.unavailable = {};
      previousCounts = {};
    }
    attachmentState.chatCounts = chatCounts;
    attachmentState.staged = attachmentState.staged.filter((s) => chatCounts[s.key]);
    Object.keys(attachmentState.leftOut).forEach((k) => { if (!chatCounts[k]) delete attachmentState.leftOut[k]; });
    Object.keys(attachmentState.unavailable).forEach((k) => { if (!chatCounts[k]) delete attachmentState.unavailable[k]; });

    // The chat lists newest first, so this is reversed to upload oldest first and keep the
    // files in the order they were attached.
    const freshness = (f) => (f.blob && f.unseen ? 2 : (f.blob ? 1 : 0));
    const newEntries = [];
    Object.keys(chatCounts).forEach((k) => {
      const copies = listed.filter((f) => f.key === k);
      const addedCopies = chatCounts[k] - (previousCounts[k] || 0);
      const currentMessageCopies = copies.filter((f) => freshness(f) === 2).length;
      const count = Math.max(addedCopies, currentMessageCopies);
      if (count <= 0) return;
      copies.sort((a, b) => freshness(b) - freshness(a));
      newEntries.push(...copies.slice(0, count));
    });
    newEntries.sort((a, b) => listed.indexOf(b) - listed.indexOf(a));

    const removeNames = (Array.isArray(args.removeAttachments)
      ? args.removeAttachments
      : (args.removeAttachments ? [args.removeAttachments] : []))
      .map(lc)
      .filter(Boolean);
    const replaceAttachments = args.replaceAttachments === true || String(args.replaceAttachments).toLowerCase() === "true";

    // Same resource keys the form alerts with, fetched live like every other GetTndResource
    // string in this tool; the fallbacks are the captured responses.
    async function tndResource(resource, fallback) {
      try {
        const text = await postJson("TNDV9/Common/GetTndResource", { resource: resource });
        if (typeof text === "string" && text.trim()) return text.trim();
      } catch (resourceError) {
        // Keep the fallback - this lookup is best-effort only.
      }
      return fallback;
    }

    // DeleteFile always answers "true" (TrainingNeedController.DeleteFile swallows errors),
    // so this is best-effort, the same as the form's RemoveAttachment.
    async function deleteStaged(entry) {
      try {
        await postJson("TNDV9/TrainingNeed/DeleteFile", { filepath: entry.filepath });
      } catch (deleteError) {
        // Leaves a stray file server-side at worst; it's no longer on the application.
      }
    }

    const attachmentNotes = [];
    const rejectedNow = [];
    const stagedNow = [];
    let attachmentLimits = null;

    if (newEntries.length) {
      // TNDLibrary.GetMaxFileSize()/GetfileTypes()'s own defaults - only used if the page
      // can't be read. The form compares the extension with indexOf against the raw
      // comma-separated string, which would also accept a fragment like "df" (inside "pdf") -
      // compared against the split list here instead. Size is checked before type, the same
      // order as the form.
      attachmentLimits = { maxFileSizeMb: 3, allowedFileTypes: ["doc", "docx", "pdf", "xls", "xlsx", "jpeg", "jpg", "txt", "bmp", "rtf"] };
      try {
        const indexRes = await fetch(`${window.origin}/${reqOptions.sl}/TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000002`, {
          method: "GET",
          headers: { "Accept": "*/*", "x-requested-with": "XMLHttpRequest" }
        });
        if (indexRes.ok) {
          const indexDoc = new DOMParser().parseFromString(await indexRes.text(), "text/html");
          const pageMaxSize = parseFloat(indexDoc.querySelector("#tndHdnFileSize")?.value || "");
          const pageFileTypes = (indexDoc.querySelector("#tndHdnFileTypes")?.value || "")
            .split(",")
            .map((t) => t.trim().replace(/^\./, "").toLowerCase())
            .filter(Boolean);
          if (pageMaxSize > 0) attachmentLimits.maxFileSizeMb = pageMaxSize;
          if (pageFileTypes.length) attachmentLimits.allowedFileTypes = pageFileTypes;
        }
      } catch (settingsError) {
        // Keep the defaults above.
      }

      for (const newFile of newEntries) {
        const fileName = newFile.name;
        const key = newFile.key;
        const blob = newFile.blob;
        if (removeNames.includes(key)) {
          continue; // Attached and removed in the same breath - never uploaded.
        }
        if (!blob) {
          attachmentState.unavailable[key] = fileName;
          continue;
        }

        const dotIndex = fileName.lastIndexOf(".");
        const fileType = dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : "";
        if (blob.size > attachmentLimits.maxFileSizeMb * 1024 * 1024) {
          rejectedNow.push({ fileName: fileName, reason: "size", sizeMb: +(blob.size / (1024 * 1024)).toFixed(2) });
          attachmentState.leftOut[key] = { name: fileName, reason: "rejected" };
          continue;
        }
        if (!attachmentLimits.allowedFileTypes.includes(fileType)) {
          rejectedNow.push({ fileName: fileName, reason: "type", fileType: fileType });
          attachmentState.leftOut[key] = { name: fileName, reason: "rejected" };
          continue;
        }

        // Confirmed live (T and D/Valid file/UploadFile.txt, and Dev in progress Features/
        // T&D/UploadFile, UploadFile-2, UploadFile-3 for three files in one application):
        // multipart/form-data with "fname" (a ddMMyyyyHHmmss_ timestamp prefix plus the
        // original file name, which becomes the server-side filepath AttchList references)
        // and "file" (the binary itself); the endpoint answers with the plain text "True".
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const timestamp = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const serverFileName = `${timestamp}_${fileName}`;
        const uploadFormData = new FormData();
        uploadFormData.append("fname", serverFileName);
        uploadFormData.append("file", blob, fileName);

        let uploadText = "";
        try {
          const uploadRes = await fetch(`${window.origin}/${reqOptions.sl}/TNDV9/TrainingNeed/UploadFile`, {
            method: "POST",
            headers: { "Accept": "*/*", "x-requested-with": "XMLHttpRequest" },
            body: uploadFormData
          });
          uploadText = (await uploadRes.text()).trim();
        } catch (networkError) {
          uploadText = "";
        }
        if (uploadText.toLowerCase() !== "true") {
          // UploadFile does no type/size checking of its own (TrainingNeedController.
          // UploadFile saves whatever it receives and returns true, or false when no file
          // arrived), so this means the upload itself failed. Files already uploaded stay
          // on the application.
          return {
            status: "ERROR",
            message: `Could not upload "${fileName}"${uploadText && uploadText.toLowerCase() !== "false" ? `: ${uploadText}` : " - the server did not accept the file."} Nothing has been submitted. Ask the supervisor to attach the file again, then call this tool again with the same arguments.`,
            attachments: attachmentState.staged.map((s) => s.name)
          };
        }

        // Attaching a file under a name already on the application replaces that one file.
        const sameName = attachmentState.staged.findIndex((s) => s.key === key);
        const stagedEntry = { key: key, name: fileName, type: fileType, size: blob.size, filepath: serverFileName };
        if (sameName >= 0) {
          await deleteStaged(attachmentState.staged[sameName]);
          attachmentState.staged[sameName] = stagedEntry;
        } else {
          attachmentState.staged.push(stagedEntry);
        }
        delete attachmentState.leftOut[key];
        delete attachmentState.unavailable[key];
        stagedNow.push(key);
      }
    }

    // replaceAttachments: the file(s) uploaded on this call replace every earlier one.
    if (replaceAttachments) {
      if (stagedNow.length) {
        const replaced = attachmentState.staged.filter((s) => !stagedNow.includes(s.key));
        for (const s of replaced) {
          await deleteStaged(s);
          attachmentState.leftOut[s.key] = { name: s.name, reason: "replaced" };
        }
        attachmentState.staged = attachmentState.staged.filter((s) => stagedNow.includes(s.key));
        if (replaced.length) {
          attachmentNotes.push(`${replaced.map((s) => `"${s.name}"`).join(", ")} ${replaced.length === 1 ? "was" : "were"} replaced and will not be submitted.`);
        }
      } else {
        attachmentNotes.push("replaceAttachments was set, but no new file was attached in this message, so nothing was replaced. To take an earlier file off, pass its name in removeAttachments instead.");
      }
    }

    // removeAttachments: off the application and deleted from the server, like the form's
    // RemoveAttachment. Attaching the file again brings it back.
    const notAttached = [];
    for (const key of removeNames) {
      const stagedIndex = attachmentState.staged.findIndex((s) => s.key === key);
      if (stagedIndex >= 0) {
        const s = attachmentState.staged[stagedIndex];
        await deleteStaged(s);
        attachmentState.staged.splice(stagedIndex, 1);
        attachmentState.leftOut[key] = { name: s.name, reason: "removed" };
      } else if (attachmentState.unavailable[key]) {
        attachmentState.leftOut[key] = { name: attachmentState.unavailable[key], reason: "removed" };
        delete attachmentState.unavailable[key];
      } else if (!attachmentState.leftOut[key]) {
        notAttached.push(key);
      }
    }
    if (notAttached.length) {
      attachmentNotes.push(`${notAttached.map((n) => `"${n}"`).join(", ")} ${notAttached.length === 1 ? "is" : "are"} not on this application, so nothing was removed for ${notAttached.length === 1 ? "it" : "them"}. Use the file names exactly as shown in preview.attachments.`);
    }

    // What the chat handed over on this call - lets a live test see whether a newly attached
    // file actually reached the tool.
    const attachmentCheck = {
      filesListedByChat: listed.map((f) => f.name),
      withContentsOnThisCall: listed.filter((f) => f.blob).map((f) => f.name),
      newOnThisCall: newEntries.map((f) => f.name)
    };

    if (rejectedNow.length) {
      const sizeMessage = rejectedNow.some((r) => r.reason === "size")
        ? await tndResource("TndFileSizeExceeded", "Maximum file size exceeded.")
        : "";
      const typeMessage = rejectedNow.some((r) => r.reason === "type")
        ? await tndResource("TndFileTypeNotAllowed", "File type not allowed")
        : "";
      return {
        status: "VALIDATION_ERROR",
        message: "One or more attached files can't be added to this training need application. Tell the supervisor which file(s) were rejected and why, including the allowed file types and maximum size below. The rejected file(s) were not uploaded and are ignored from now on - do not put them in removeAttachments, and never tell the employee to start a new chat. Files in attachmentsKept are still attached. Nothing has been submitted. Ask the supervisor to attach a file that meets these limits, or to continue without it, then call this tool again with the same arguments on whatever they reply.",
        rejectedAttachments: rejectedNow.map((r) => ({
          fileName: r.fileName,
          reason: r.reason === "size"
            ? `${sizeMessage} The file is ${r.sizeMb} MB; the maximum is ${attachmentLimits.maxFileSizeMb} MB per file.`
            : `${typeMessage} (${r.fileType ? "." + r.fileType : "no file extension"}).`
        })),
        attachmentsKept: attachmentState.staged.map((s) => s.name),
        allowedFileTypes: attachmentLimits.allowedFileTypes,
        maxFileSizeMb: attachmentLimits.maxFileSizeMb,
        attachmentCheck: attachmentCheck
      };
    }

    const detailsData = await postJson("TNDV9/TrainingNeed/GetTrainingNeedDetails", { requestType: "000002", WFMainID: "", PerfEmpNo: "" });
    if (!detailsData || !detailsData.Status || detailsData.Status.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (detailsData && detailsData.Status && detailsData.Status.Message) || "Failed to load the training need application form"
      };
    }
    const mainNeed = Array.isArray(detailsData.MainNeed) ? detailsData.MainNeed : [];
    const suborList = Array.isArray(detailsData.SuborList) ? detailsData.SuborList : [];
    if (suborList.length === 0) {
      return {
        status: "ERROR",
        message: "Could not load your subordinate list from the training need application form."
      };
    }

    const eligibleSubordinates = suborList.map((s) => ({ displayempno: s.displayempno, empname: s.empname, designation: s.designame }));

    // subordinates is optional on this call specifically so "who are my subordinates?"
    // can be answered without already knowing a name - GetTrainingNeedDetails' SuborList
    // (fetched above) already contains the full direct-report roster regardless of what
    // was passed in, so there is nothing to gain by requiring a name just to look it up.
    // Nothing is submitted on this listing path; call this tool again with subordinates
    // set (plus the need/narrative fields) once the supervisor has picked who it's for.
    if (subordinateQueries.length === 0) {
      return {
        status: "LISTED",
        message: "Here are your direct reports. Ask which one(s) this training need application is for, then call this tool again with subordinates set to their exact name(s) or employee number(s) (along with existingNeedName/newNeedName and the other required fields).",
        eligibleSubordinates: eligibleSubordinates
      };
    }

    const notFound = [];
    const ambiguous = [];
    const resolvedRecords = [];
    subordinateQueries.forEach((query) => {
      const lowerQuery = query.toLowerCase();
      let matches = suborList.filter((s) => (s.displayempno || "").toLowerCase() === lowerQuery);
      if (matches.length === 0) {
        matches = suborList.filter((s) => (s.empname || "").toLowerCase().includes(lowerQuery));
      }
      if (matches.length === 0) {
        notFound.push(query);
      } else if (matches.length > 1) {
        ambiguous.push({
          query: query,
          candidates: matches.map((s) => ({ employeeNumber: s.displayempno, name: s.empname, designation: s.designame }))
        });
      } else {
        resolvedRecords.push(matches[0]);
      }
    });

    if (notFound.length > 0) {
      return {
        status: "NOT_SUBORDINATE",
        message: `${notFound.map((q) => `"${q}"`).join(", ")} ${notFound.length === 1 ? "does" : "do"} not appear to be a subordinate you can submit a training need for. Please check the name(s) or employee number(s) and try again.`,
        eligibleSubordinates: eligibleSubordinates
      };
    }
    if (ambiguous.length > 0) {
      return {
        status: "AMBIGUOUS",
        message: `More than one subordinate matches ${ambiguous.map((a) => `"${a.query}"`).join(", ")}. Please specify using their exact employee number.`,
        candidates: ambiguous
      };
    }

    if (!existingNeedName && !newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName (to attach this application to an existing training need - see getSupervisorTrainingNeeds) or newNeedName (to submit a brand new one), not neither."
      };
    }
    if (existingNeedName && newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName or newNeedName, not both - the real form's Training Need Type is either 'Existing Need' or 'New Need', never both at once."
      };
    }

    let typecode;
    let needcode;
    let needname;
    let needdescription;
    if (existingNeedName) {
      const lowerNeedName = existingNeedName.toLowerCase();
      const needMatches = mainNeed.filter((n) => (n.needname || "").toLowerCase().includes(lowerNeedName));
      if (needMatches.length === 0) {
        return {
          status: "ERROR",
          message: `No existing training need matching "${args.existingNeedName}" was found. Use getSupervisorTrainingNeeds to see what's currently on file, or pass newNeedName to submit a new one.`
        };
      }
      if (needMatches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one existing training need matches "${args.existingNeedName}".`,
          ambiguousField: "existingNeedName",
          candidates: needMatches.map((n) => ({ needCode: n.needcode, needName: n.needname }))
        };
      }
      typecode = 1;
      needcode = needMatches[0].needcode;
      needname = "";
      needdescription = "";
    } else {
      typecode = 0;
      needcode = "000000";
      needname = newNeedName;
      needdescription = newNeedDescription;
    }

    // Attachments - the files uploaded by the attachment handling at the top of this call
    // (and of earlier calls for this application) are this application's attachments.
    // Entirely optional: with no files attached, Attach/FileNameAttached/AttchList stay at
    // their original "no attachment" values below. Each file was already checked against
    // the form's type/size limits before it was uploaded.
    const attchList = [];

    // Confirmation gate - confirmed live via TNDV9/Common/GetTndResource ({resource:
    // "TndNeedApplicationSaveConfirm"} -> "Are you sure you want to submit this training
    // need?"): the real form always shows this confirm dialog right before Save, after
    // every field has already been filled in. Nothing is uploaded, validated, or saved
    // until the supervisor has reviewed this exact application and confirmed - placed
    // here (after subordinates/need/attachment-detection, before any write call) so the
    // preview reflects exactly what would be submitted. The prompt text is fetched live
    // rather than hardcoded, same reasoning as the file-type/size messages below.
    if (!args.confirmed) {
      const unavailableNames = Object.keys(attachmentState.unavailable).map((k) => attachmentState.unavailable[k]);
      let confirmPrompt = "Are you sure you want to submit this training need?";
      try {
        const promptResource = await postJson("TNDV9/Common/GetTndResource", { resource: "TndNeedApplicationSaveConfirm" });
        if (typeof promptResource === "string" && promptResource.trim()) {
          confirmPrompt = promptResource.trim();
        }
      } catch (resourceError) {
        // Keep the fallback text above - this lookup is best-effort only.
      }

      return {
        status: "CONFIRMATION_REQUIRED",
        message: `Review this training need application with the supervisor before submitting, listing preview.attachments exactly - these are the only files that will be submitted. ${confirmPrompt} Call this tool again with confirmed:true (and the same arguments) once they agree. If they want to change the attachments first: a newly attached file is added (several files are allowed); to take a file off, call again with removeAttachments; to swap the earlier files for the one(s) attached in the current message, call again with replaceAttachments: true. Whenever the user attaches another file, call this tool again on that same turn (same arguments) - never just acknowledge it, since the chat hands over a file's contents only on the turn it was attached.`,
        confirmationPrompt: confirmPrompt,
        preview: {
          subordinates: resolvedRecords.map((r) => ({ employeeNumber: r.displayempno, name: r.empname })),
          needSelectionType: existingNeedName ? "Existing" : "New",
          needName: existingNeedName ? mainNeed.find((n) => n.needcode === needcode).needname : newNeedName,
          objective: objective,
          relevanceToJob: relevanceToJob,
          benefitToEmployee: benefitToEmployee,
          benefitToCompany: benefitToCompany,
          attachments: attachmentState.staged.map((a) => ({ fileName: a.name })),
          attachmentsLeftOut: Object.keys(attachmentState.leftOut).map((k) => ({ fileName: attachmentState.leftOut[k].name, reason: attachmentState.leftOut[k].reason })),
          attachmentsUnavailable: unavailableNames
        },
        attachmentNotes: attachmentNotes.concat(unavailableNames.length
          ? [`${unavailableNames.map((n) => `"${n}"`).join(", ")} ${unavailableNames.length === 1 ? "was" : "were"} attached on an earlier turn that this tool was not called on, so ${unavailableNames.length === 1 ? "its" : "their"} contents can no longer be read and ${unavailableNames.length === 1 ? "it is" : "they are"} not on the application. Ask the supervisor to attach only ${unavailableNames.length === 1 ? "that file" : "those files"} again, and call this tool on the turn ${unavailableNames.length === 1 ? "it is" : "they are"} attached. The files in preview.attachments are already uploaded - never ask for them again or ask for all files to be attached together.`]
          : []),
        attachmentCheck: attachmentCheck
      };
    }

    // Attachments - only reached once the supervisor has confirmed above. The files were
    // uploaded when they were attached (see the attachment handling at the top), so
    // AttchList just references them by their server-side filepath - the same entries the
    // form pushes in UploadMainFile ({attchid, attchname, attchtype, attchfile: "",
    // filepath}). Confirmed live that multiple entries are accepted
    // (SaveNeedApplication-round2's 3-entry AttchList).
    attachmentState.staged.forEach((a, i) => {
      attchList.push({
        attchid: i + 1,
        attchname: a.name,
        attchtype: a.type,
        attchfile: "",
        filepath: a.filepath
      });
    });

    const resolvedDisplayEmpNos = new Set(resolvedRecords.map((r) => r.displayempno));
    const empList = suborList.map((s) => ({
      tna_id: s.tna_id,
      raw_id: s.raw_id,
      empno: s.empno,
      displayempno: s.displayempno,
      empname: s.empname,
      designame: s.designame,
      app_approved: s.app_approved,
      typecode: s.typecode,
      selected: resolvedDisplayEmpNos.has(s.displayempno) ? 1 : 0,
      enrollstatus: s.enrollstatus,
      appid: s.appid,
      schmode: s.schmode,
      course: s.course,
      SchList: Array.isArray(s.SchList) ? s.SchList : [],
      EvalList: Array.isArray(s.EvalList) ? s.EvalList : []
    }));

    // Attach stays "0" and FileNameAttached stays "" even when files ARE attached -
    // confirmed live for the self-application tool against the same TNDV9 module (Dev in
    // progress Features/T&D/ValidateNeedApplication, SaveNeedApplication with a real
    // attachment): the module links attachments purely through AttchList, populated above.
    const payload = {
      tna_id: -1,
      needtype: "",
      typecode: typecode,
      needname: needname,
      needdescription: needdescription,
      status: "Pending",
      appdate: null,
      Strappdate: null,
      objective: objective,
      projectcode: "",
      supcomment: "",
      app_person: "",
      app_approved: 0,
      wfmainid: "",
      wfsequence: 0,
      rejectcomment: "",
      centrecode: "",
      reltojob: relevanceToJob,
      potentialyou: benefitToEmployee,
      potentialcomp: benefitToCompany,
      needcode: needcode,
      reqtypecode: "000002",
      reqtypename: "",
      editable: 1,
      enrollstatus: "",
      appid: 0,
      newneed: 1,
      disableneeds: 0,
      Attach: "0",
      FileNameAttached: "",
      EmpList: empList,
      AttchList: attchList,
      IsGoalObject: false,
      ExistingGoals: [],
      SelectedGoalCode: ""
    };

    const validation = await postJson("TNDV9/TrainingNeed/ValidateNeedApplication", payload);
    if (!validation || validation.IsSuccessfull !== true) {
      return {
        status: "VALIDATION_ERROR",
        message: (validation && validation.Message) || "The training need application was rejected during validation."
      };
    }

    const saveResult = await postJson("TNDV9/TrainingNeed/SaveNeedApplication", payload);
    if (!saveResult || saveResult.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (saveResult && saveResult.Message) || "Failed to submit the training need application."
      };
    }

    const results = Array.isArray(saveResult.Results) ? saveResult.Results : [];

    // The files are now part of the submitted application - they must not be deleted, and
    // the next application in this conversation starts with none. chatCounts is kept, so
    // the files already in the chat are not taken as new attachments again.
    attachmentState.staged = [];
    attachmentState.leftOut = {};
    attachmentState.unavailable = {};

    return {
      status: "SUCCESS",
      message: saveResult.Message || "Training need application submitted.",
      needSelectionType: existingNeedName ? "Existing" : "New",
      needCode: needcode,
      needName: existingNeedName ? mainNeed.find((n) => n.needcode === needcode).needname : newNeedName,
      submissions: results.map((r) => ({ employeeNumber: r.empno, success: r.success, status: r.status })),
      attachments: attchList.map((a) => ({ fileName: a.attchname, type: a.attchtype }))
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to submit the training need application: ${errorMessage}`,
      error: errorMessage
    };
  }
})