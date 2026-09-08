(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000002"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
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

    if (subordinateQueries.length === 0) {
      return {
        status: "VALIDATION_ERROR",
        message: "subordinates is required - provide at least one direct report's name or employee number."
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

    // Step 1: fetch the existing-need master list (MainNeed) and the full subordinate
    // roster (SuborList) - confirmed live: for the Supervisor persona, GetTrainingNeedDetails'
    // SuborList lists every direct report (each already selected: 0), not just one self
    // record - matching the same "Select Employee" grid shown on the real "Add" form.
    // Note: the real page-load sequence also calls TNDV9/TrainingNeed/LoadPageData (the
    // background applications list, already covered by getSupervisorTrainingNeeds) and
    // TNDV9/Common/GetTndResource (a static UI confirmation string, "Are you sure you
    // want to submit this training need?") - neither feeds the submission payload, so
    // neither is called here; this tool's own conversational confirmation (UAC 3.8)
    // substitutes for GetTndResource's popup text.
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

    // Step 2: resolve every requested subordinate against the live roster - exact
    // employee-number match first, else a case-insensitive substring match against name
    // (same convention as supervisorEmployeeTrainingNomination's UAC 2.3/2.4 handling).
    // All problems are collected across every requested name before returning, so the
    // supervisor can fix everything in one round trip rather than one name at a time.
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

    const eligibleSubordinates = suborList.map((s) => ({ displayempno: s.displayempno, empname: s.empname, designation: s.designame }));

    if (notFound.length > 0) {
      // UAC 2.4-equivalent for training needs: at least one requested name isn't a
      // subordinate of the logged-in supervisor.
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

    // Step 3: resolve the Training Need Type selection - Existing (typecode 1, a real
    // needcode, blank needname/needdescription) or New (typecode 0, needcode "000000",
    // free-text needname/needdescription) - the Existing path is confirmed live for this
    // Supervisor flow directly; the New path mirrors selfEmployeeTrainingNeedApplication's
    // confirmed New Need shape against the same SaveNeedApplication endpoint (not yet
    // independently captured for a Supervisor submission - see description.md).
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

    // Step 4: build the outgoing EmpList - the FULL subordinate roster, not just the
    // selected ones. Confirmed live: a real 3-of-many-subordinate submission sent every
    // entry from SuborList (same field subset as the self-application tool - it omits
    // reqtypecode/editable, which SuborList itself carries), with selected: 1 only on the
    // chosen three and selected: 0 on everyone else; the server's own Results array then
    // echoed back exactly those three. Sending only the selected subset (as the
    // self-application tool does, since it only ever has one entry) has not been tested
    // for this multi-employee flow and is not what the real capture shows.
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

    // Step 5: build the submission payload - every fixed field below is confirmed
    // identical to the real captured Supervisor submission, including reqtypecode
    // "000002" (confirmed as the Supervisor marker, matching the App=000002 menu
    // convention) and IsGoalObject/ExistingGoals/SelectedGoalCode staying false/[]/""
    // (confirmed live: goal-linking is not exercised for multi-subordinate submissions -
    // see the objective argument's own description). newneed is always 1 here (it marks
    // this as a new application RECORD, unrelated to the Existing/New Need Type choice,
    // which is typecode). File attachments are not supported by this tool (Attach stays
    // "0"/no file), matching every other drafts/* tool's scope.
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
      AttchList: [],
      IsGoalObject: false,
      ExistingGoals: [],
      SelectedGoalCode: ""
    };

    // Step 6: validate, then save - confirmed live two-step flow
    // (New_PeoplesHR_Feature/supervisorSubordinateTrainingNeedApplication/supervisor-subordinate
    // application/{ValidateNeedApplication,SaveNeedApplication}.txt), same
    // validate-then-save convention as every other write tool in this build.
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

    // Confirmed live: Results[] has one entry per selected subordinate, keyed by their
    // own displayempno - same {success, empno, status} shape as every other write tool.
    const results = Array.isArray(saveResult.Results) ? saveResult.Results : [];

    return {
      status: "SUCCESS",
      message: saveResult.Message || "Training need application submitted.",
      needSelectionType: existingNeedName ? "Existing" : "New",
      needCode: needcode,
      needName: existingNeedName ? mainNeed.find((n) => n.needcode === needcode).needname : newNeedName,
      submissions: results.map((r) => ({ employeeNumber: r.empno, success: r.success, status: r.status }))
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
