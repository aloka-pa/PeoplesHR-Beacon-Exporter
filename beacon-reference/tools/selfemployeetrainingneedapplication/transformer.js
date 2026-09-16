(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000001"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const existingNeedName = args.existingNeedName ? String(args.existingNeedName).trim() : "";
    const newNeedName = args.newNeedName ? String(args.newNeedName).trim() : "";
    const newNeedDescription = args.newNeedDescription ? String(args.newNeedDescription).trim() : "";
    const objective = args.objective ? String(args.objective).trim() : "";
    const goalTitle = args.goalTitle ? String(args.goalTitle).trim() : "";
    const enableGoalObjectives = args.enableGoalObjectives === true || String(args.enableGoalObjectives).toLowerCase() === "true";
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

    // FEATURE ADD (2026-09-14): mirrors the real form's "Enable Goal Objectives" checkbox,
    // which loads the employee's ongoing performance goals straight into the Objectives
    // dropdown (see the screenshot in the request that prompted this) - previously this
    // tool only ever fetched GetOngoingGoals internally to resolve an already-known
    // goalTitle by exact match; there was no way for the employee to browse the list
    // first. When enableGoalObjectives is true and goalTitle hasn't been chosen yet, fetch
    // and return the list directly - deliberately BEFORE existingNeedName/newNeedName is
    // required, since picking a goal is independent of picking a need on the real form.
    // GetOngoingGoals never writes anything, so this is always safe to call standalone.
    if (enableGoalObjectives && !goalTitle) {
      const goalsData = await postJson("TNDV9/TrainingNeed/GetOngoingGoals", undefined);
      const ongoingGoals = (Array.isArray(goalsData) ? goalsData : []).map((g) => ({
        goalTitle: g.GoalTitle || "",
        goalCode: g.GoalCode
      }));
      return {
        status: "GOALS_LISTED",
        message: ongoingGoals.length > 0
          ? "Here are the employee's ongoing performance goals. Present the titles and ask which one to link as this training need's objective, then call this tool again with goalTitle set to their exact choice (along with existingNeedName/newNeedName and the other required fields)."
          : "The employee has no ongoing performance goals to link right now - use the objective argument instead for a free-text objective.",
        ongoingGoals: ongoingGoals
      };
    }

    if (!existingNeedName && !newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName (to attach this application to an existing training need - see getSelfTrainingNeeds) or newNeedName (to submit a brand new one), not neither."
      };
    }
    if (existingNeedName && newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName or newNeedName, not both - the real form's Training Need Type is either 'Existing Need' or 'New Need', never both at once."
      };
    }

    // Step 1: fetch the existing-need master list (MainNeed) and the self "subordinate"
    // record (SuborList[0]) - confirmed live: for the Applicant persona, GetTrainingNeedDetails'
    // SuborList contains exactly one entry, the logged-in employee's own record with
    // selected: 1 already set, the same "self is the only entry" pattern
    // selfEmployeeTrainingApplication's SubList[0] and getSelfTrainingNeeds already rely on.
    // This record is what gets echoed back (trimmed to a specific field subset - see Step 4)
    // as the outgoing EmpList entry - confirmed live via a real submitted payload.
    const detailsData = await postJson("TNDV9/TrainingNeed/GetTrainingNeedDetails", { requestType: "000001", WFMainID: "", PerfEmpNo: "" });
    if (!detailsData || !detailsData.Status || detailsData.Status.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (detailsData && detailsData.Status && detailsData.Status.Message) || "Failed to load the training need application form"
      };
    }
    const mainNeed = Array.isArray(detailsData.MainNeed) ? detailsData.MainNeed : [];
    const selfRecord = Array.isArray(detailsData.SuborList) ? detailsData.SuborList[0] : null;
    if (!selfRecord) {
      return {
        status: "ERROR",
        message: "Could not resolve the logged-in employee's own record from the training need application form."
      };
    }

    // Step 2: fetch the employee's ongoing performance goals - confirmed live, called again
    // (fresh) every time the real "Add" button is pressed on the form, feeding both the
    // goal-picker dropdown (when 'Enable Goal Objectives' is checked) and the ExistingGoals
    // field that's echoed back verbatim in the submission payload regardless of which mode
    // is used. Also re-fetched here (not just reused from the standalone listing branch
    // above) since this call may be reached directly with goalTitle already known, without
    // ever going through the listing branch first.
    const goalsData = await postJson("TNDV9/TrainingNeed/GetOngoingGoals", undefined);
    const existingGoals = Array.isArray(goalsData) ? goalsData : [];

    // Step 3: resolve the Training Need Type selection - Existing (typecode 1, a real
    // needcode, blank needname/needdescription) or New (typecode 0, needcode "000000",
    // free-text needname/needdescription) - confirmed live from both a real "existing need"
    // and a real "new need" submission capture.
    let typecode;
    let needcode;
    let needname;
    let needdescription;
    if (existingNeedName) {
      const lowerNeedName = existingNeedName.toLowerCase();
      const matches = mainNeed.filter((n) => (n.needname || "").toLowerCase().includes(lowerNeedName));
      if (matches.length === 0) {
        return {
          status: "ERROR",
          message: `No existing training need matching "${args.existingNeedName}" was found. Use getSelfTrainingNeeds to see what's currently on file, or pass newNeedName to submit a new one.`
        };
      }
      if (matches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one existing training need matches "${args.existingNeedName}".`,
          ambiguousField: "existingNeedName",
          candidates: matches.map((n) => ({ needCode: n.needcode, needName: n.needname }))
        };
      }
      typecode = 1;
      needcode = matches[0].needcode;
      needname = "";
      needdescription = "";
    } else {
      typecode = 0;
      needcode = "000000";
      needname = newNeedName;
      needdescription = newNeedDescription;
    }

    // Step 4: resolve the objective - either free text, or (when 'Enable Goal Objectives'
    // is used) linked to one of the employee's ongoing goals. Confirmed live: when
    // IsGoalObject is true, the literal "objective" field is sent blank and
    // SelectedGoalCode carries the real value instead - the server's "Please specify the
    // objective." validation covers both cases (a blank text objective, or a blank/unset
    // SelectedGoalCode), so only one of the two needs to be populated.
    let isGoalObject = false;
    let finalObjective = objective;
    let selectedGoalCode = null;
    if (goalTitle) {
      const lowerGoalTitle = goalTitle.toLowerCase();
      const goalMatches = existingGoals.filter((g) => (g.GoalTitle || "").trim().toLowerCase() === lowerGoalTitle);
      if (goalMatches.length === 0) {
        return {
          status: "ERROR",
          message: `No ongoing goal titled "${args.goalTitle}" was found. Call this tool again with enableGoalObjectives: true (and no goalTitle) to see the current list, or provide the objective argument instead for a free-text objective.`
        };
      }
      if (goalMatches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one ongoing goal is titled "${args.goalTitle}" - they can't be told apart by title alone. Provide the objective argument instead to enter a free-text objective.`,
          ambiguousField: "goalTitle"
        };
      }
      isGoalObject = true;
      finalObjective = "";
      selectedGoalCode = goalMatches[0].GoalCode;
    }

    // Step 5: build the outgoing EmpList entry - a specific field subset of the self
    // record (not the whole SuborList object), confirmed live by direct comparison against
    // a real submitted payload (it omits reqtypecode/editable, which SuborList itself
    // carries) - selected is always 1 for the self applicant.
    const empListEntry = {
      tna_id: selfRecord.tna_id,
      raw_id: selfRecord.raw_id,
      empno: selfRecord.empno,
      displayempno: selfRecord.displayempno,
      empname: selfRecord.empname,
      designame: selfRecord.designame,
      app_approved: selfRecord.app_approved,
      typecode: selfRecord.typecode,
      selected: 1,
      enrollstatus: selfRecord.enrollstatus,
      appid: selfRecord.appid,
      schmode: selfRecord.schmode,
      course: selfRecord.course,
      SchList: Array.isArray(selfRecord.SchList) ? selfRecord.SchList : [],
      EvalList: Array.isArray(selfRecord.EvalList) ? selfRecord.EvalList : []
    };

    // Step 6: build the submission payload - every fixed field below (needtype, status,
    // appdate/Strappdate, projectcode, supcomment, app_person, app_approved, wfmainid,
    // wfsequence, rejectcomment, centrecode, reqtypename, editable, enrollstatus, appid,
    // newneed, disableneeds, Attach, FileNameAttached, AttchList) is confirmed identical
    // across both a real "existing need" and a real "new need" submission capture -
    // newneed is always 1 here (it marks this as a new application RECORD, unrelated to
    // the Existing/New Need Type choice, which is typecode). File attachments are not
    // supported by this tool (Attach stays "0"/no file), matching every other
    // drafts/* tool's scope.
    const payload = {
      tna_id: -1,
      needtype: "",
      typecode: typecode,
      needname: needname,
      needdescription: needdescription,
      status: "Pending",
      appdate: null,
      Strappdate: null,
      objective: finalObjective,
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
      reqtypecode: "000001",
      reqtypename: "",
      editable: 1,
      enrollstatus: "",
      appid: 0,
      newneed: 1,
      disableneeds: 0,
      Attach: "0",
      FileNameAttached: "",
      EmpList: [empListEntry],
      AttchList: [],
      IsGoalObject: isGoalObject,
      ExistingGoals: existingGoals,
      SelectedGoalCode: selectedGoalCode
    };

    // Step 7: validate, then save - confirmed live two-step flow
    // (New_PeoplesHR_Feature/selfEmployeeTrainingNeedApplication/applicant - {existing,new}
    // need submission.txt), same validate-then-save convention as every other write tool
    // in this build.
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

    const resultEntry = (Array.isArray(saveResult.Results) && saveResult.Results[0]) || null;

    return {
      status: "SUCCESS",
      message: saveResult.Message || "Training need application submitted.",
      needSelectionType: existingNeedName ? "Existing" : "New",
      needCode: needcode,
      needName: existingNeedName ? mainNeed.find((n) => n.needcode === needcode).needname : newNeedName,
      submissionStatus: resultEntry ? resultEntry.status : null
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