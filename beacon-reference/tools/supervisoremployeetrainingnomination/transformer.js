(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/ApplyTraining/Index?mvc=1&bs=4&App=000002"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const scheduleId = args.scheduleId !== undefined && args.scheduleId !== null ? String(args.scheduleId).trim() : "";
    const courseNameQuery = args.courseName ? String(args.courseName).trim() : "";
    const subordinateQueryRaw = args.subordinate !== undefined && args.subordinate !== null ? String(args.subordinate).trim() : "";
    const objective = args.objective ? String(args.objective).trim() : "";
    const relevanceToJob = args.relevanceToJob ? String(args.relevanceToJob).trim() : "";
    const benefitToEmployee = args.benefitToEmployee ? String(args.benefitToEmployee).trim() : "";
    const benefitToCompany = args.benefitToCompany ? String(args.benefitToCompany).trim() : "";
    const expectedLearning = args.expectedLearning ? String(args.expectedLearning).trim() : "";

    if (!scheduleId && !courseNameQuery) {
      return { status: "VALIDATION_ERROR", message: "Either scheduleId or courseName is required to identify which training schedule to nominate into." };
    }
    if (!subordinateQueryRaw) {
      return { status: "VALIDATION_ERROR", message: "subordinate (employee number or name) is required." };
    }
    // Confirmed live (2026-09-07): the training system rejects a submission missing any
    // one of these four - not just objective - each with its own specific message
    // ("Please specify the objective."/"...the relevance to job."/"...the benefit to
    // you."/"...the benefit to the company."). All four are checked upfront here so the
    // agent collects them before ever calling this tool, rather than discovering the gap
    // one field at a time via repeated VALIDATION_ERROR round trips.
    if (!objective) {
      return { status: "VALIDATION_ERROR", message: "objective is required - the training system rejects nominations without it." };
    }
    if (!relevanceToJob) {
      return { status: "VALIDATION_ERROR", message: "relevanceToJob is required - the training system rejects nominations without it." };
    }
    if (!benefitToEmployee) {
      return { status: "VALIDATION_ERROR", message: "benefitToEmployee is required - the training system rejects nominations without it." };
    }
    if (!benefitToCompany) {
      return { status: "VALIDATION_ERROR", message: "benefitToCompany is required - the training system rejects nominations without it." };
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

    // Step 1: locate the full course/schedule object. Every downstream call needs this
    // exact object shape (as returned by GetScheduleCourseDetails), not just the id -
    // same endpoint used by getSelfEmployeeTrainings, confirmed to return the same
    // schedule catalog regardless of self/supervisor/admin context.
    const scheduleData = await postJson("TNDV9/ApplyTraining/GetScheduleCourseDetails", undefined);
    if (!scheduleData || !scheduleData.Status || scheduleData.Status.IsSuccessfull !== true || !Array.isArray(scheduleData.crs)) {
      return {
        status: "ERROR",
        message: (scheduleData && scheduleData.Status && scheduleData.Status.Message) || "Failed to load available training schedules"
      };
    }
    let courseItem = null;
    if (scheduleId) {
      // Exact id takes priority when both are given - courseName is only a fallback
      // resolution path for when the caller doesn't already know the schedule id.
      courseItem = scheduleData.crs.find((item) => String(item.schid) === scheduleId) || null;
      if (!courseItem) {
        return {
          status: "ERROR",
          message: `No open training schedule was found for scheduleId ${scheduleId}. Use getSelfEmployeeTrainings or getTrainingCalendarCourseDetails to find a valid schedule id.`
        };
      }
    } else {
      // Resolve by courseName instead - same case-insensitive substring match against
      // cosname that getSelfEmployeeTrainings already uses.
      const needle = courseNameQuery.toLowerCase();
      const courseMatches = scheduleData.crs.filter((item) => (item.cosname || "").toLowerCase().includes(needle));
      if (courseMatches.length === 0) {
        return {
          status: "ERROR",
          message: `No open training schedule was found matching courseName "${courseNameQuery}".`
        };
      }
      if (courseMatches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one open schedule matches courseName "${courseNameQuery}". Please specify using scheduleId.`,
          candidates: courseMatches.map((item) => ({
            scheduleId: String(item.schid),
            courseName: item.cosname || "",
            startDate: toIsoAndDisplay(item.startdate).display,
            venue: (item.SchList && item.SchList[0] && item.SchList[0].VenueName) || ""
          }))
        };
      }
      courseItem = courseMatches[0];
    }

    // ASP.NET JSON dates look like "/Date(1807986600000+0530)/". Confirmed live
    // behaviour (from a real, successful capture): before GetAppyCourseConditions /
    // ValidateApplyTraining / SaveApplyTraining are called, the real client converts
    // each top-level date field into an ISO string, and separately computes a
    // "Str<Field>" dd/mm/yyyy display string alongside it. Schedule-day-level dates
    // (inside SchList) are NOT converted this way - StrSchDate stayed null even in the
    // working capture.
    function parseAspNetDateParts(dateStr) {
      if (!dateStr) return null;
      const match = /\/Date\((-?\d+)([+-]\d{4})?\)\//.exec(dateStr);
      if (!match) return null;
      const ms = parseInt(match[1], 10);
      let offsetMinutes = 0;
      if (match[2]) {
        const sign = match[2][0] === "-" ? -1 : 1;
        const hours = parseInt(match[2].slice(1, 3), 10);
        const minutes = parseInt(match[2].slice(3, 5), 10);
        offsetMinutes = sign * (hours * 60 + minutes);
      }
      return { ms, offsetMinutes };
    }
    function toIsoAndDisplay(dateStr) {
      const parts = parseAspNetDateParts(dateStr);
      if (!parts) return { iso: dateStr, display: null };
      const local = new Date(parts.ms + parts.offsetMinutes * 60000);
      const pad = (n) => String(n).padStart(2, "0");
      const display = `${pad(local.getUTCDate())}/${pad(local.getUTCMonth() + 1)}/${local.getUTCFullYear()}`;
      return { iso: new Date(parts.ms).toISOString(), display };
    }

    const startdateConv = toIsoAndDisplay(courseItem.startdate);
    const enddateConv = toIsoAndDisplay(courseItem.enddate);
    const cutdateConv = toIsoAndDisplay(courseItem.cutdate);
    const pardateConv = toIsoAndDisplay(courseItem.pardate);

    // Step 2: fetch this course's subordinate eligibility list.
    // IMPORTANT field-name collision, confirmed from real captures: GetScheduleCourseDetails'
    // crs[].SubList is a *course* QA-subject list ({coscode, subName}) - completely
    // unrelated to GetAppyCourseConditions' response SubList, which is the *subordinate*
    // eligibility list ({empno (opaque token), displayempno, empname, designame, status,
    // appstatus, selected, ...}). The request below still carries the course's original
    // QA-subject SubList, matching the real, working capture - GetAppyCourseConditions
    // itself doesn't take AppType or any employee identifier; the supervisor's own
    // subordinates are resolved purely from the authenticated session.
    const conditionsPayload = {
      coscode: courseItem.coscode,
      cosname: courseItem.cosname,
      cosdesc: courseItem.cosdesc,
      startdate: startdateConv.iso,
      Strstartdate: startdateConv.display,
      enddate: enddateConv.iso,
      Strenddate: enddateConv.display,
      cutdate: cutdateConv.iso,
      Strcutdate: cutdateConv.display,
      pardate: pardateConv.iso,
      Strpardate: pardateConv.display,
      schmonth: courseItem.schmonth,
      ApplyMode: courseItem.ApplyMode,
      schid: courseItem.schid,
      nomination: courseItem.nomination,
      TrainType: courseItem.TrainType,
      Field: courseItem.Field,
      Ojective: "",
      JobRelavance: "",
      PotentialYou: "",
      PotentialCompany: "",
      ExpectedLearning: "",
      SchList: courseItem.SchList,
      NeedList: courseItem.NeedList,
      SponList: courseItem.SponList,
      SubList: courseItem.SubList,
      QuaList: courseItem.QuaList,
      CloseList: courseItem.CloseList,
      Attach: courseItem.Attach,
      AttachName: courseItem.AttachName,
      Capacity: courseItem.Capacity,
      Enrolled: courseItem.Enrolled,
      Applied: courseItem.Applied,
      Availability: Math.max((courseItem.Capacity || 0) - (courseItem.Enrolled || 0), 0),
      Waiting: courseItem.Waiting,
      WfmainID: courseItem.WfmainID,
      ApproveComment: courseItem.ApproveComment,
      Approved: courseItem.Approved,
      NomiList: courseItem.NomiList,
      AppType: null,
      elgcode: courseItem.elgcode
    };

    const conditionsData = await postJson("TNDV9/ApplyTraining/GetAppyCourseConditions", conditionsPayload);
    if (!conditionsData || !conditionsData.Status || conditionsData.Status.IsSuccessfull !== true || !Array.isArray(conditionsData.SubList)) {
      return {
        status: "ERROR",
        message: (conditionsData && conditionsData.Status && conditionsData.Status.Message) || "Failed to load your subordinates' eligibility for this training"
      };
    }

    // Step 3: find the requested subordinate - exact employee-number match first, else a
    // case-insensitive substring match against their name (UAC 2.3/2.4).
    const query = subordinateQueryRaw.toLowerCase();
    let matches = conditionsData.SubList.filter((s) => (s.displayempno || "").toLowerCase() === query);
    if (matches.length === 0) {
      matches = conditionsData.SubList.filter((s) => (s.empname || "").toLowerCase().includes(query));
    }

    if (matches.length === 0) {
      // UAC 2.4: not a subordinate of the logged-in supervisor (at least not one who
      // shows up as eligible/relevant for this specific schedule).
      // Temporary diagnostics (2026-09-08): a supervisor reported a real subordinate
      // being rejected here even on an exact employee-number match - this surfaces the
      // full list GetAppyCourseConditions actually returned for this course, so we can
      // see whether the person is missing entirely, or present under a different
      // displayempno/empname value than expected.
      return {
        status: "NOT_SUBORDINATE",
        message: `"${subordinateQueryRaw}" does not appear to be a subordinate you can nominate for this training. Please check the name or employee number and try again.`,
        diagnostics: {
          courseName: courseItem.cosname,
          scheduleId: String(courseItem.schid),
          availableSubordinates: conditionsData.SubList.map((s) => ({ displayempno: s.displayempno, empname: s.empname, appstatus: s.appstatus }))
        }
      };
    }
    if (matches.length > 1) {
      return {
        status: "AMBIGUOUS",
        message: `More than one subordinate matches "${subordinateQueryRaw}". Please specify using their exact employee number.`,
        candidates: matches.map((s) => ({ employeeNumber: s.displayempno, name: s.empname, designation: s.designame }))
      };
    }

    const target = matches[0];
    if (target.appstatus === 1) {
      // A real subordinate, but this schedule specifically rejects them (e.g. already
      // applied/attended - the confirmed live message for this was "You are not
      // eligible to apply for this training again.").
      return {
        status: "NOT_ELIGIBLE",
        message: target.status || "This employee is not eligible to be nominated for this training.",
        employeeNumber: target.displayempno,
        name: target.empname
      };
    }

    // Step 4: build the final submission payload - same shape as conditionsPayload, but
    // with NomiList populated from the eligibility list just fetched (only the target
    // subordinate marked selected - see the NomiList/SubList swap note below), narrative
    // fields filled from arguments, AppType set to "000002" (Supervisor - confirmed from
    // a real live capture), and a "Temp" sub-object mirroring the course's original
    // pre-edit state (also confirmed present in every real ValidateApplyTraining/
    // SaveApplyTraining request).
    const submissionSubList = conditionsData.SubList.map((s) => Object.assign({}, s, { selected: s === target ? 1 : 0 }));

    const tempSnapshot = {
      SchList: courseItem.SchList,
      NeedList: courseItem.NeedList,
      SponList: courseItem.SponList,
      SubList: courseItem.SubList,
      QuaList: courseItem.QuaList,
      CloseList: courseItem.CloseList,
      NomiList: courseItem.NomiList,
      AppType: null,
      empno: null,
      coscode: courseItem.coscode,
      cosname: courseItem.cosname,
      cosdesc: courseItem.cosdesc,
      ApplyMode: courseItem.ApplyMode,
      startdate: courseItem.startdate,
      Strstartdate: startdateConv.display,
      enddate: courseItem.enddate,
      Strenddate: enddateConv.display,
      schmonth: courseItem.schmonth,
      schid: courseItem.schid,
      nomination: courseItem.nomination,
      cutdate: courseItem.cutdate,
      Strcutdate: cutdateConv.display,
      pardate: courseItem.pardate,
      Strpardate: pardateConv.display,
      TrainType: courseItem.TrainType,
      Field: courseItem.Field,
      DirAppId: courseItem.DirAppId,
      ReqType: courseItem.ReqType,
      DirAppStat: courseItem.DirAppStat,
      Ojective: "",
      WfmainID: courseItem.WfmainID,
      Approved: courseItem.Approved,
      Attach: courseItem.Attach,
      AttachName: courseItem.AttachName,
      JobRelavance: "",
      PotentialYou: "",
      PotentialCompany: "",
      ExpectedLearning: "",
      Capacity: courseItem.Capacity,
      Enrolled: courseItem.Enrolled,
      Waiting: courseItem.Waiting,
      Applied: courseItem.Applied,
      ApproveComment: courseItem.ApproveComment,
      CosDuration: courseItem.CosDuration,
      elgcode: courseItem.elgcode
    };

    // Confirmed live (2026-09-08) against a real, working single-subordinate capture:
    // the outgoing SubList reverts to meaning the course QA-subject list again (i.e.
    // stays exactly as conditionsPayload.SubList already has it - do NOT overwrite it
    // here) - the subordinate eligibility list (with selections) instead goes under
    // NomiList, which is empty on the original course object until this point. This
    // was the actual bug behind the "Please select at least one employee." rejection -
    // the marked selection was being sent under the wrong key entirely.
    const submissionPayload = Object.assign({}, conditionsPayload, {
      NomiList: submissionSubList,
      Ojective: objective,
      JobRelavance: relevanceToJob,
      PotentialYou: benefitToEmployee,
      PotentialCompany: benefitToCompany,
      ExpectedLearning: expectedLearning,
      AppType: "000002",
      Temp: tempSnapshot
    });

    // Step 5: validate before saving. Confirmed live behaviour: the server itself
    // rejects an incomplete/invalid submission here (e.g. missing objective, closed
    // cut-off) before anything is written - a real safety check, not just a UI nicety.
    const validation = await postJson("TNDV9/ApplyTraining/ValidateApplyTraining", submissionPayload);
    if (!validation || validation.IsSuccessfull !== true) {
      return {
        status: "VALIDATION_ERROR",
        message: (validation && validation.Message) || "The training system rejected this nomination during validation."
      };
    }

    // Step 6: save - this is the actual write. Only reached after every check above passed.
    const saveResult = await postJson("TNDV9/ApplyTraining/SaveApplyTraining", submissionPayload);
    if (!saveResult || saveResult.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (saveResult && saveResult.Message) || "Failed to submit the nomination."
      };
    }

    const resultForTarget = Array.isArray(saveResult.Results)
      ? saveResult.Results.find((r) => r.empno === target.displayempno)
      : null;

    return {
      status: "SUCCESS",
      message: saveResult.Message || "The nomination has been successfully submitted.",
      employeeNumber: target.displayempno,
      name: target.empname,
      courseCode: courseItem.coscode,
      courseName: courseItem.cosname,
      scheduleId: String(courseItem.schid),
      submissionStatus: resultForTarget ? resultForTarget.status : null
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to submit the training nomination: ${errorMessage}`,
      error: errorMessage
    };
  }
})
