(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/Participation/Index?mvc=1&bs=4&App=000001"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const scheduleId = args.scheduleId !== undefined && args.scheduleId !== null ? String(args.scheduleId).trim() : "";
    const courseNameQuery = args.courseName ? String(args.courseName).trim() : "";
    const decision = args.decision ? String(args.decision).trim().toLowerCase() : "";
    const expectedLearning = args.expectedLearning ? String(args.expectedLearning).trim() : "";
    const remarks = args.remarks ? String(args.remarks).trim() : "";

    if (!scheduleId && !courseNameQuery) {
      return {
        status: "VALIDATION_ERROR",
        message: "Either scheduleId or courseName is required to identify which pending confirmation to act on - call getSelfEmployeeParticipationConfirmation first if neither is already known."
      };
    }
    if (decision !== "confirm" && decision !== "reject") {
      return { status: "VALIDATION_ERROR", message: "decision must be either \"confirm\" (to approve participation) or \"reject\"." };
    }
    // Confirmed live (2026-09-09, direct UI test by the product owner): Expected Learning
    // is required to confirm/approve, but a rejection can be submitted with it left blank -
    // the user is not asked for anything before a reject goes through. The GetTndResource
    // "TndErrorELearningValidation" capture that once lived in the self-reject folder was
    // misleading, not proof of a reject-side requirement - a second capture from the same
    // folder (GetTndResource with resource:"TndRejection") turned out to be just the
    // generic "Are you sure you want to reject the participation for this training?"
    // confirmation-dialog string, unrelated to field validation. Only require it for confirm.
    if (decision === "confirm" && !expectedLearning) {
      return { status: "VALIDATION_ERROR", message: "Please specify expected learnings." };
    }

    const headers = new Headers();
    headers.append("Accept", "application/json, text/javascript, */*; q=0.01");
    headers.append("Content-Type", "application/json; charset=utf-8");
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
        const detail = (parsed && parsed.Message) || rawText.slice(0, 200);
        throw new Error(`${path} failed with HTTP ${response.status}: ${detail}`);
      }
      return parsed;
    }

    // Step 1: re-fetch the full, raw pending record fresh from the session - never trust
    // caller-supplied raw fields for this. The real SaveConfirmation_Applicant payload
    // (confirmed from New_PeoplesHR_Feature/selfEmployeeParticipationConfirmation/self-approve/
    // and self-reject/SaveConfirmation_Applicant.txt) round-trips almost the entire original
    // GetEnrollmentEmployees record verbatim, including long opaque per-session tokens
    // (EmployeeNumber/empNo/resempno) - those must come straight from a fresh fetch, not be
    // asked of the LLM/user or reconstructed from getSelfEmployeeParticipationConfirmation's
    // own (deliberately stripped) output.
    let enrollmentList;
    try {
      enrollmentList = await postJson("TNDV9/Participation/GetEnrollmentEmployees", undefined);
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }
    if (!Array.isArray(enrollmentList)) {
      return { status: "ERROR", message: "Participation Confirmation service returned an unexpected response shape while looking up the schedule." };
    }
    const pendingList = enrollmentList.filter((r) => String(r.prestatus || "").toLowerCase() === "pending");
    let item = null;
    if (scheduleId) {
      // Exact id takes priority when both are given - courseName is only a fallback
      // resolution path for when the caller doesn't already know the schedule id.
      item = pendingList.find((r) => String(r.ScheduleId) === scheduleId) || null;
      if (!item) {
        return {
          status: "ERROR",
          message: `No pending participation confirmation was found for scheduleId ${scheduleId}. Use getSelfEmployeeParticipationConfirmation to find a valid schedule id.`
        };
      }
    } else {
      // Resolve by courseName instead - case-insensitive substring match against
      // CourseTitle, same convention getSelfEmployeeParticipationConfirmation's own
      // keyword filter and getSelfEmployeeTrainings' courseName filter already use.
      const needle = courseNameQuery.toLowerCase();
      const matches = pendingList.filter((r) => (r.CourseTitle || "").toLowerCase().includes(needle));
      if (matches.length === 0) {
        return {
          status: "ERROR",
          message: `No pending participation confirmation was found matching courseName "${courseNameQuery}".`
        };
      }
      if (matches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one pending confirmation matches courseName "${courseNameQuery}". Please specify using scheduleId.`,
          candidates: matches.map((r) => ({
            scheduleId: String(r.ScheduleId),
            courseTitle: r.CourseTitle || "",
            courseCode: r.CourseCode || "",
            scheduleStartDate: r.ScheduleStartDate || "",
            scheduleEndDate: r.ScheduleEndDate || "",
            cutoffDate: r.CutoffDate || ""
          }))
        };
      }
      item = matches[0];
    }

    // Record-level dates ("ScheduleStartDate"/"ScheduleEndDate"/"CutoffDate") arrive as
    // "15 Sep 2026" from GetEnrollmentEmployees. Confirmed live: the outgoing
    // SaveConfirmation_Applicant payload reformats these three into "dd/mm/yyyy" at the
    // top level of "data" (e.g. "15/09/2026"), while its own "Temp" snapshot keeps the
    // original "15 Sep 2026" style untouched - both derived from this same fetched record.
    const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
    const displayDateToParts = (dateStr) => {
      const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(String(dateStr || "").trim());
      if (!match) return null;
      const month = MONTHS[match[2]];
      if (!month) return null;
      return { day: parseInt(match[1], 10), month: month, year: parseInt(match[3], 10) };
    };
    const displayDateToDDMMYYYY = (dateStr) => {
      const parts = displayDateToParts(dateStr);
      if (!parts) return dateStr || "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
    };
    const displayDateToIso = (dateStr) => {
      const parts = displayDateToParts(dateStr);
      if (!parts) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
    };

    // ASP.NET JSON dates look like "/Date(1730658600000+0530)/" - same parser used
    // throughout this build (see tools/getselfemployeetraininghistory).
    const aspNetDateToDDMMYYYY = (dateStr) => {
      if (!dateStr) return "";
      const match = /\/Date\((-?\d+)([+-]\d{4})?\)\//.exec(dateStr);
      if (!match) return "";
      const ms = parseInt(match[1], 10);
      let offsetMinutes = 0;
      if (match[2]) {
        const sign = match[2][0] === "-" ? -1 : 1;
        const hours = parseInt(match[2].slice(1, 3), 10);
        const minutes = parseInt(match[2].slice(3, 5), 10);
        offsetMinutes = sign * (hours * 60 + minutes);
      }
      const local = new Date(ms + offsetMinutes * 60000);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(local.getUTCDate())}/${pad(local.getUTCMonth() + 1)}/${local.getUTCFullYear()}`;
    };

    const todayKey = (() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    })();
    const cutoffIso = displayDateToIso(item.CutoffDate);
    const dayLeft = cutoffIso ? Math.round((new Date(cutoffIso) - new Date(todayKey)) / (1000 * 60 * 60 * 24)) : 0;

    // Per-day schedule ("grdSchedule"). Confirmed live, and replicated exactly even though
    // it looks like a quirk: at the OUTER level of each grdSchedule entry, "SchDate" gets
    // overwritten with the dd/mm/yyyy display value (not the original ASP.NET date) and a
    // sibling "StrSchDate" duplicates it - but each entry's own "Temp" snapshot keeps the
    // *original* ASP.NET "SchDate" value, with only "StrSchDate" filled in alongside it.
    // The server accepted this shape in both the confirmed self-approve and self-reject
    // captures, so it is reproduced as-is rather than "corrected".
    const grdSchedule = (item.DetailView || []).map((day) => {
      const displayDate = aspNetDateToDDMMYYYY(day.SchDate) || day.StrSchDate || null;
      const tempDay = Object.assign({}, day, { StrSchDate: displayDate });
      return Object.assign({}, day, {
        SchDate: displayDate,
        StrSchDate: displayDate,
        ResperCount: (day.ResperList || []).length,
        AttachCount: (day.AttachList || []).length,
        Temp: tempDay
      });
    });

    // Character-remaining counters shown on the real screen ("Remaining characters: X / 2000"
    // for both Expected Learnings and Remarks) - confirmed live: ExpectedLearningRemaining
    // 1988 for a 12-character ELearning value, RemarksRemaining 1984 for a 16-character
    // Remarks value (both 2000 - length), and RemarksRemaining 2000 when Remarks is blank.
    // expectedLearning can itself be blank on a reject (see the validation note above), so
    // this formula covers that the same way it already covers a blank Remarks.
    const expectedLearningRemaining = 2000 - expectedLearning.length;
    const remarksRemaining = 2000 - remarks.length;

    const dataPayload = {
      ScheduleId: item.ScheduleId,
      CourseCode: item.CourseCode,
      CourseTitle: item.CourseTitle,
      TrainingHours: item.TrainingHours,
      Venue: item.Venue,
      VenueCode: item.VenueCode,
      ScheduleStartDate: displayDateToDDMMYYYY(item.ScheduleStartDate),
      ScheduleEndDate: displayDateToDDMMYYYY(item.ScheduleEndDate),
      CutoffDate: displayDateToDDMMYYYY(item.CutoffDate),
      grdSchedule: grdSchedule,
      DayLeft: dayLeft,
      isEnabled: 1,
      Remarks: remarks || null,
      ELearning: expectedLearning || null,
      ExpectedLearningRemaining: expectedLearningRemaining,
      RemarksRemaining: remarksRemaining,
      ApplicationId: item.ApplicationId,
      // Opaque, per-session tokens - passed through verbatim exactly as fetched, never
      // altered or shortened (the server round-trips these to identify the record).
      EmployeeNumber: item.EmployeeNumber,
      EmployeeDisplayName: item.EmployeeDisplayName,
      EmployeeDisplayNo: item.EmployeeDisplayNo,
      empNo: item.empNo,
      DsgName: item.DsgName,
      DsgCode: item.DsgCode,
      ApplyMode: item.ApplyMode,
      prestatus: item.prestatus,
      tempid: item.tempid,
      RollbackCmnt: item.RollbackCmnt,
      RollbackCmChek: item.RollbackCmChek,
      CosAcptTcFlg: item.CosAcptTcFlg,
      // "Temp" is the untouched, pre-edit snapshot of the exact record just fetched from
      // GetEnrollmentEmployees - confirmed identical (field-for-field, including the
      // original DetailView key name and every opaque token) in both real captures.
      Temp: item
    };

    const submissionPayload = Object.assign(
      { data: dataPayload },
      // Confirmed live: the confirm ("approve") capture carries no "IsReject" key at all;
      // the reject capture adds "IsReject": 1. Never send IsReject: 0 for a confirm - its
      // absence, not a falsy value, is what the real client sends.
      decision === "reject" ? { IsReject: 1 } : {},
      { LogTypeId: "000001" }
    );

    let saveResult;
    try {
      saveResult = await postJson("TNDV9/Participation/SaveConfirmation_Applicant", submissionPayload);
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }

    if (!saveResult || saveResult.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (saveResult && saveResult.Message) || `Failed to ${decision === "reject" ? "reject" : "confirm"} the participation.`
      };
    }

    return {
      status: "SUCCESS",
      message: saveResult.Message || (decision === "reject" ? "Participation rejected." : "Participation confirmed."),
      scheduleId: item.ScheduleId !== undefined && item.ScheduleId !== null ? String(item.ScheduleId) : scheduleId,
      courseCode: item.CourseCode || "",
      courseTitle: item.CourseTitle || "",
      decision: decision === "reject" ? "rejected" : "confirmed"
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to submit the participation decision: ${errorMessage}`,
      error: errorMessage
    };
  }
})
