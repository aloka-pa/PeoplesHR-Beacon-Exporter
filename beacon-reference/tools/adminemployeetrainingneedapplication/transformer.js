(async function (data, args, reqOptions) {
  try {
    if (
      !BeaconBar.user?.metaData?.menus?.some(menu =>
        menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007")
      )
    ) {
      return { error: true, message: "You do not have access to apply for grievance. Please contact HR Admin." };
    }


    const employeeQueries = (Array.isArray(args.employees) ? args.employees : [])
      .map((e) => (e !== undefined && e !== null ? String(e).trim() : ""))
      .filter((e) => e);
    const existingNeedName = args.existingNeedName ? String(args.existingNeedName).trim() : "";
    const newNeedName = args.newNeedName ? String(args.newNeedName).trim() : "";
    const newNeedDescription = args.newNeedDescription ? String(args.newNeedDescription).trim() : "";
    const objective = args.objective ? String(args.objective).trim() : "";
    const relevanceToJob = args.relevanceToJob ? String(args.relevanceToJob).trim() : "";
    const benefitToEmployee = args.benefitToEmployee ? String(args.benefitToEmployee).trim() : "";
    const benefitToCompany = args.benefitToCompany ? String(args.benefitToCompany).trim() : "";

    const jsonHeaders = new Headers();
    jsonHeaders.append("Accept", "*/*");
    jsonHeaders.append("Content-Type", "application/json");
    jsonHeaders.append("x-requested-with", "XMLHttpRequest");

    async function postJson(path, body) {
      const url = `${window.origin}/${reqOptions.sl}/${path}`;
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: jsonHeaders,
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

    async function getText(url) {
      const textHeaders = new Headers();
      textHeaders.append("accept", "*/*");
      textHeaders.append("x-requested-with", "XMLHttpRequest");
      const response = await fetch(url, { method: "GET", headers: textHeaders });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`${url} failed with HTTP ${response.status}`);
      }
      return text;
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
    // Page state (window.__peoplesHRTndAdminNeedUploads), kept until the application is saved:
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
    const attachmentState = cacheHost.__peoplesHRTndAdminNeedUploads = cacheHost.__peoplesHRTndAdminNeedUploads || {};
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
        const indexRes = await fetch(`${window.origin}/${reqOptions.sl}/TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007`, {
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
            message: `Could not upload "${fileName}"${uploadText && uploadText.toLowerCase() !== "false" ? `: ${uploadText}` : " - the server did not accept the file."} Nothing has been submitted. Ask the admin to attach the file again, then call this tool again with the same arguments.`,
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
        message: "One or more attached files can't be added to this training need application. Tell the admin which file(s) were rejected and why, including the allowed file types and maximum size below. The rejected file(s) were not uploaded and are ignored from now on - do not put them in removeAttachments, and never tell the employee to start a new chat. Files in attachmentsKept are still attached. Nothing has been submitted. Ask the admin to attach a file that meets these limits, or to continue without it, then call this tool again with the same arguments on whatever they reply.",
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

    // Checked after the attachment handling above (not before it, as it used to be), so a file
    // attached on a call that is missing employees is still uploaded on the one call where the
    // chat hands over its contents.
    if (employeeQueries.length === 0) {
      return {
        status: "VALIDATION_ERROR",
        message: "employees is required - provide at least one employee's name or employee number, company-wide (no reporting-line restriction)."
      };
    }

    const detailsData = await postJson("TNDV9/TrainingNeed/GetTrainingNeedDetails", { requestType: "000007", WFMainID: "", PerfEmpNo: "" });
    if (!detailsData || !detailsData.Status || detailsData.Status.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (detailsData && detailsData.Status && detailsData.Status.Message) || "Failed to load the training need application form"
      };
    }
    const mainNeed = Array.isArray(detailsData.MainNeed) ? detailsData.MainNeed : [];

    const indexUrl = `${window.origin}/${reqOptions.sl}/TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007`;
    const indexHtml = await getText(indexUrl);
    const indexDoc = new DOMParser().parseFromString(indexHtml, "text/html");
    const ownEmpNumber = indexDoc.querySelector("#tndHdnEmpNumber")?.value || "";
    if (!ownEmpNumber) {
      return {
        status: "ERROR",
        message: "Could not resolve the logged-in Admin's own identity token (#tndHdnEmpNumber) from the Add Training Need page - cannot search for employees without it."
      };
    }

    const employeeSearchHtml = await (async () => {
      const url = `${window.origin}/${reqOptions.sl}/TNDV9/Common/GetEmployeeSearch`;
      const response = await fetch(url, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          id: "tndNeedEmployeeSearch",
          title: "Select Employee",
          empNumber: ownEmpNumber,
          callback: "TndTrainingNeedAdmin.OnEmployeeSearchSelect",
          searchMode: "2",
          searchQueryMode: "all",
          searchQueryState: "activeonly",
          isDivLoading: "1",
          isMultiple: "1",
          elggrpid: "0",
          param: "0"
        })
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`GetEmployeeSearch failed with HTTP ${response.status}`);
      return text;
    })();

    const searchTokenMatch = /"&searchToken="\s*\+\s*'([^']+)'/.exec(employeeSearchHtml);
    const searchToken = searchTokenMatch ? searchTokenMatch[1] : "";
    if (!searchToken) {
      return {
        status: "ERROR",
        message: "Could not extract a searchToken from GetEmployeeSearch's response - the employee-search session could not be established."
      };
    }
    const callBackMatch = /"&callBack="\s*\+\s*'([^']+)'/.exec(employeeSearchHtml);
    const callBackConst = callBackMatch ? callBackMatch[1] : "";

    const searchUrl = `${window.origin}/${reqOptions.sl}/CommonComponents/Search/Search?` +
      new URLSearchParams({
        empNumber: ownEmpNumber,
        callBack: callBackConst,
        searchMode: "2",
        searchQueryMode: "all",
        searchQueryState: "activeonly",
        isDivLoading: "1",
        isMultiple: "1",
        searchToken: searchToken,
        _: String(Date.now())
      }).toString();
    const searchHtml = await getText(searchUrl);
    const modelMatch = /window\.advancedModelObj\s*=\s*(['"])(.*?)\1;/s.exec(searchHtml);
    if (!modelMatch) {
      return {
        status: "ERROR",
        message: "Could not find window.advancedModelObj in the employee-search response - could not establish a session key."
      };
    }
    let advancedModel;
    try {
      advancedModel = JSON.parse(modelMatch[2]);
    } catch (parseError) {
      return { status: "ERROR", message: "Failed to parse the employee-search session data (advancedModelObj)." };
    }
    const sessionKey = advancedModel.KeyValue;
    if (!sessionKey) {
      return { status: "ERROR", message: "The employee-search session did not return a KeyValue - cannot continue." };
    }
    const rotatedEmpNumber = advancedModel.EmpNumber;
    if (!rotatedEmpNumber) {
      return { status: "ERROR", message: "The employee-search session did not return a rotated EmpNumber - cannot continue." };
    }

    const resolvedRows = [];
    for (const query of employeeQueries) {
      const searchListResult = await postJson("CommonComponents/Search/GetSearchList/", {
        empNumber: rotatedEmpNumber,
        criteriaValues: [],
        key: sessionKey,
        modeId: "2",
        supEmpNumber: null,
        tblPageNo: 1,
        tblSearchText: query,
        sortColumn: "2",
        sortOrder: "asc"
      });
      const rows = (searchListResult && searchListResult.Object && Array.isArray(searchListResult.Object.data))
        ? searchListResult.Object.data
        : [];
      if (rows.length === 0) {
        return {
          status: "NOT_FOUND",
          message: `No employee matching "${query}" was found.`,
          query
        };
      }
      if (rows.length > 1) {
        const totalCount = (searchListResult._pageData && searchListResult._pageData.TotalCount) || rows.length;
        return {
          status: "AMBIGUOUS",
          message: `More than one employee matches "${query}"${totalCount > rows.length ? ` (${totalCount} total, showing first ${rows.length})` : ""}. Please specify using their exact employee number.`,
          query,
          candidates: rows.map((r) => ({ employeeNumber: r.Col1, name: (r.Col2 || "").trim(), dateJoined: r.Col3, activeStatus: r.Col4 }))
        };
      }
      resolvedRows.push({ query, employeeNumber: rows[0].Col1, name: (rows[0].Col2 || "").trim(), dateJoined: rows[0].Col3 });
    }

    async function resolveOpaqueEmpNumber(row) {
      const url = `${window.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumber/?` +
        new URLSearchParams({
          loggedEmpNumber: rotatedEmpNumber,
          empNumber: row.employeeNumber,
          empDisplayName: row.name,
          empDateJoined: row.dateJoined,
          key: sessionKey,
          _: String(Date.now())
        }).toString();
      const text = await getText(url);
      const parsed = JSON.parse(text);
      return parsed.Message;
    }

    function utf16LeBase64(str) {
      let binary = "";
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        binary += String.fromCharCode(code & 0xff, (code >> 8) & 0xff);
      }
      return btoa(binary);
    }
    const encodedSessionKey = utf16LeBase64(sessionKey);

    const searchedEmployeesPayload = [];
    for (const row of resolvedRows) {
      const opaqueEmpNumber = await resolveOpaqueEmpNumber(row);
      if (!opaqueEmpNumber) {
        return {
          status: "ERROR",
          message: `Could not resolve an encrypted identity token for "${row.name}" (${row.employeeNumber}) via GetEmpNumber.`,
          debug_rotatedEmpNumber: rotatedEmpNumber,
          debug_sessionKey: sessionKey,
          debug_row: row
        };
      }
      searchedEmployeesPayload.push({
        Key: encodedSessionKey,
        EmpNumber: opaqueEmpNumber,
        DisNumber: row.employeeNumber,
        DisName: row.name,
        IsExcelFile: 0
      });
    }

    const searchedData = await postJson("TNDV9/TrainingNeed/GetSearchedEmployeeDetails", searchedEmployeesPayload);
    const resolvedList = Array.isArray(searchedData && searchedData.SuborList) ? searchedData.SuborList : null;
    if (!searchedData || !resolvedList) {
      return {
        status: "ERROR",
        message: (searchedData && searchedData.Status && searchedData.Status.Message) || "Failed to resolve the given employee(s)' full HR record via TNDV9/TrainingNeed/GetSearchedEmployeeDetails.",
        debug_searchedEmployeesPayload: searchedEmployeesPayload,
        debug_searchedDataRaw: searchedData
      };
    }
    if (resolvedList.length === 0) {
      return {
        status: "ERROR",
        message: "None of the given employees could be resolved via GetSearchedEmployeeDetails."
      };
    }

    if (!existingNeedName && !newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName (to attach this application to an existing training need - see getAdminTrainingNeeds) or newNeedName (to submit a brand new one), not neither."
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
          message: `No existing training need matching "${args.existingNeedName}" was found. Use getAdminTrainingNeeds to see what's currently on file, or pass newNeedName to submit a new one.`
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

    // objective/relevanceToJob/benefitToEmployee/benefitToCompany are intentionally NOT
    // hardcoded-required here - whether each is mandatory is a per-client Training &
    // Development configuration toggle (IsObjectiveMandatory, IsRelToJobMandatory,
    // IsPotentialToYouMandatory, IsPotentialToCompMandatory) that can differ between
    // orgs, the same evidence already established for selfEmployeeTrainingNeedApplication/
    // supervisorSubordinateTrainingNeedApplication (see their description.md "Why this
    // change" sections). Each field defaults to "" below and is sent through as-is; the
    // live ValidateNeedApplication call is the real source of truth and its Message is
    // forwarded verbatim as VALIDATION_ERROR if this tenant's config actually requires it.

    // Attachments - the files uploaded by the attachment handling at the top of this call
    // (and of earlier calls for this application) are this application's attachments.
    // Entirely optional: with no files attached, Attach/FileNameAttached/AttchList stay at
    // their original "no attachment" values below. Each file was already checked against
    // the form's type/size limits before it was uploaded.
    const attchList = [];

    // Confirmation gate - same as selfEmployeeTrainingNeedApplication and
    // supervisorSubordinateTrainingNeedApplication: the real form always shows the
    // TndNeedApplicationSaveConfirm dialog ("Are you sure you want to submit this training
    // need?") right before Save, after every field has already been filled in. Nothing is
    // uploaded, validated, or saved until the admin has reviewed this exact application and
    // confirmed - placed here (after employees/need/attachment validation, before any write
    // call) so the preview reflects exactly what would be submitted. The prompt text is
    // fetched live rather than hardcoded, same as the file-type/size messages above.
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
        message: `Review this training need application with the admin before submitting, listing preview.attachments exactly - these are the only files that will be submitted. ${confirmPrompt} Call this tool again with confirmed:true (and the same arguments) once they agree. If they want to change the attachments first: a newly attached file is added (several files are allowed); to take a file off, call again with removeAttachments; to swap the earlier files for the one(s) attached in the current message, call again with replaceAttachments: true. Whenever the user attaches another file, call this tool again on that same turn (same arguments) - never just acknowledge it, since the chat hands over a file's contents only on the turn it was attached.`,
        confirmationPrompt: confirmPrompt,
        preview: {
          employees: resolvedList.map((s) => ({ employeeNumber: s.displayempno, name: s.empname })),
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
          ? [`${unavailableNames.map((n) => `"${n}"`).join(", ")} ${unavailableNames.length === 1 ? "was" : "were"} attached on an earlier turn that this tool was not called on, so ${unavailableNames.length === 1 ? "its" : "their"} contents can no longer be read and ${unavailableNames.length === 1 ? "it is" : "they are"} not on the application. Ask the admin to attach only ${unavailableNames.length === 1 ? "that file" : "those files"} again, and call this tool on the turn ${unavailableNames.length === 1 ? "it is" : "they are"} attached. The files in preview.attachments are already uploaded - never ask for them again or ask for all files to be attached together.`]
          : []),
        attachmentCheck: attachmentCheck
      };
    }

    // Attachments - only reached once the admin has confirmed above. The files were
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

    const empList = resolvedList.map((s) => ({
      tna_id: s.tna_id,
      raw_id: s.raw_id,
      empno: s.empno,
      displayempno: s.displayempno,
      empname: s.empname,
      designame: s.designame || "",
      app_approved: s.app_approved,
      typecode: s.typecode,
      selected: 1,
      enrollstatus: s.enrollstatus,
      appid: s.appid,
      schmode: s.schmode,
      course: s.course,
      SchList: Array.isArray(s.SchList) ? s.SchList : [],
      EvalList: Array.isArray(s.EvalList) ? s.EvalList : []
    }));

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
      reqtypecode: "000007",
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