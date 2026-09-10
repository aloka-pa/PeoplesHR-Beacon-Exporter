(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as drafts/getselfemployeetrainings and tools/getselfemployeetraininghistory).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/Participation/Index?mvc=1&bs=4&App=000001"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    // Optional filter: a course name or course code fragment, so a query like
    // "devops course" or "000115" narrows the list down. Case-insensitive substring
    // match, same style as getSelfEmployeeTrainings' courseName filter.
    const keywordFilter = args.keyword ? String(args.keyword).trim().toLowerCase() : "";

    const headers = new Headers();
    headers.append("Accept", "application/json, text/javascript, */*; q=0.01");
    headers.append("Content-Type", "application/json; charset=utf-8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const url = `${window.origin}/${reqOptions.sl}/TNDV9/Participation/GetEnrollmentEmployees`;

    let response;
    try {
      // Confirmed from a real capture (New_PeoplesHR_Feature/getSelfEmployeeParticipationConfirmation/
      // GetEnrollmentEmployees.txt): this endpoint takes no request body at all
      // (Content-Length: 0) - same session-resolved-employee shape as
      // TNDV9/ApplyTraining/GetScheduleCourseDetails, not a { id: ... } token body.
      response = await fetch(url, {
        method: "POST",
        headers: headers
      });
    } catch (networkError) {
      return {
        status: "ERROR",
        message: `Could not reach the Participation Confirmation service (${url}): ${networkError.message}`
      };
    }

    const rawText = await response.text();
    let responseData = null;
    try {
      responseData = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      return {
        status: "ERROR",
        message: `Participation Confirmation service returned a non-JSON response (HTTP ${response.status} from ${url}).`,
        rawResponsePreview: rawText.slice(0, 300)
      };
    }

    if (!response.ok) {
      return {
        status: "ERROR",
        message: `API request to ${url} failed with status ${response.status}`,
        details: rawText.slice(0, 300)
      };
    }

    // Confirmed shape: unlike TNDV9/ApplyTraining/GetScheduleCourseDetails, this endpoint
    // returns a bare JSON array of enrollment/participation records directly - no
    // { Status, crs } wrapper.
    if (!Array.isArray(responseData)) {
      return {
        status: "ERROR",
        message: "Participation Confirmation service returned an unexpected response shape.",
        rawResponsePreview: rawText.slice(0, 300)
      };
    }

    // Top-level dates ("ScheduleStartDate"/"ScheduleEndDate"/"CutoffDate") arrive already
    // formatted as "10 Sep 2026", not the ASP.NET "/Date(...)/ " shape - confirmed from
    // the same capture. Only the nested per-day DetailView[].SchDate is in that JSON-date
    // form, so two small parsers are needed.
    const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
    const parseDisplayDate = (dateStr) => {
      if (!dateStr) return "";
      const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(String(dateStr).trim());
      if (!match) return "";
      const day = match[1].padStart(2, "0");
      const month = MONTHS[match[2]];
      if (!month) return "";
      return `${match[3]}-${String(month).padStart(2, "0")}-${day}`;
    };

    // ASP.NET JSON dates look like "/Date(1730658600000+0530)/" - same parser used by
    // tools/getselfemployeetraininghistory and drafts/getselfemployeetrainings.
    const parseAspNetDate = (dateStr) => {
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
      return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
    };

    const todayKey = (() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    })();

    let confirmations = responseData
      // Defensive: this endpoint's own purpose (backing the "Pending Confirmations" tab)
      // means every captured sample already came back as prestatus "Pending" with no
      // request-side filter - this guard just keeps the tool scoped to that even if a
      // future response ever mixes in another status.
      .filter((item) => !item.prestatus || String(item.prestatus).toLowerCase() === "pending")
      .map((item) => {
        const confirmBeforeDate = parseDisplayDate(item.CutoffDate);
        const daysLeft = confirmBeforeDate
          ? Math.round((new Date(confirmBeforeDate) - new Date(todayKey)) / (1000 * 60 * 60 * 24))
          : null;

        const schedule = (item.DetailView || []).map((day) => ({
          date: parseAspNetDate(day.SchDate) || "",
          startTime: day.StartTime || "",
          endTime: day.EndTime || "",
          venue: day.VenueName || "",
          // resempno/rescode are internal session tokens like empNo/EmployeeNumber -
          // intentionally dropped, only the human-readable resource person fields kept.
          resourcePersons: (day.ResperList || []).map((resper) => ({
            name: resper.resname || "",
            category: resper.rescat || "",
            type: resper.typename || ""
          }))
        }));

        return {
          scheduleId: item.ScheduleId !== undefined && item.ScheduleId !== null ? String(item.ScheduleId) : "",
          applicationId: item.ApplicationId !== undefined && item.ApplicationId !== null ? String(item.ApplicationId) : "",
          courseCode: item.CourseCode || "",
          courseTitle: item.CourseTitle || "",
          scheduleStartDate: parseDisplayDate(item.ScheduleStartDate),
          scheduleEndDate: parseDisplayDate(item.ScheduleEndDate),
          confirmBeforeDate: confirmBeforeDate,
          daysLeft: daysLeft,
          trainingHours: item.TrainingHours || "0",
          venue: item.Venue || "",
          confirmationStatus: item.prestatus || "",
          expectedLearning: item.ELearning || "",
          remarks: item.Remarks || "",
          employeeDisplayName: (item.EmployeeDisplayName || "").trim(),
          employeeDisplayNo: item.EmployeeDisplayNo || "",
          designation: item.DsgName || "",
          schedule: schedule
        };
      });

    if (keywordFilter) {
      confirmations = confirmations.filter(
        (c) => c.courseTitle.toLowerCase().includes(keywordFilter) || c.courseCode.toLowerCase().includes(keywordFilter)
      );
    }

    // Confirmed/approved trainings - the screen's "Confirmed Trainings" tab, backed by a
    // separate endpoint (TNDV9/Participation/GetAppliedSchedules, also no request body).
    // Confirmed from a real capture (New_PeoplesHR_Feature/getSelfEmployeeParticipationConfirmation/
    // GetAppliedSchedules.txt): a bare JSON array, one entry per schedule the employee has
    // already confirmed participation for, with its own lighter field set (no per-day
    // schedule/venue/resource-person detail, no ELearning/Remarks - just the identifying
    // and date fields). Non-fatal on failure: a hiccup here shouldn't hide the pending list
    // above, which remains this tool's primary, longer-established purpose.
    let confirmedTrainings = [];
    try {
      const confirmedResponse = await fetch(`${window.origin}/${reqOptions.sl}/TNDV9/Participation/GetAppliedSchedules`, {
        method: "POST",
        headers: headers
      });
      const confirmedRawText = await confirmedResponse.text();
      const confirmedData = confirmedRawText ? JSON.parse(confirmedRawText) : null;
      if (confirmedResponse.ok && Array.isArray(confirmedData)) {
        confirmedTrainings = confirmedData.map((item) => ({
          applicationId: item.ApplicationId !== undefined && item.ApplicationId !== null ? String(item.ApplicationId) : "",
          scheduleId: item.ScheduleId !== undefined && item.ScheduleId !== null ? String(item.ScheduleId) : "",
          courseCode: item.CourseCode || "",
          courseTitle: item.CourseTitle || "",
          startDate: parseDisplayDate(item.StartDate),
          endDate: parseDisplayDate(item.EndDate),
          cutoffDate: parseDisplayDate(item.CutOffDate),
          daysLeft: item.DaysLeft !== undefined && item.DaysLeft !== null ? item.DaysLeft : null
        }));
      }
    } catch (err) {
      confirmedTrainings = [];
    }

    if (keywordFilter) {
      confirmedTrainings = confirmedTrainings.filter(
        (c) => c.courseTitle.toLowerCase().includes(keywordFilter) || c.courseCode.toLowerCase().includes(keywordFilter)
      );
    }

    if (confirmations.length === 0 && confirmedTrainings.length === 0) {
      return {
        status: "SUCCESS",
        message: keywordFilter
          ? `No pending or confirmed participation confirmations match "${args.keyword}".`
          : "No pending or confirmed participation confirmations were found.",
        totalCount: 0,
        pendingConfirmations: [],
        totalConfirmedCount: 0,
        confirmedTrainings: []
      };
    }

    return {
      status: "SUCCESS",
      message: `Found ${confirmations.length} pending and ${confirmedTrainings.length} confirmed participation confirmation(s).`,
      totalCount: confirmations.length,
      pendingConfirmations: confirmations,
      totalConfirmedCount: confirmedTrainings.length,
      confirmedTrainings: confirmedTrainings
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve pending participation confirmations: ${errorMessage}`,
      error: errorMessage
    };
  }
})
