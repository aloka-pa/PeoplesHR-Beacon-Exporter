(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as drafts/gettrainingcalendarcoursedetails and drafts/getselfemployeetraininghistory).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/ApplyTraining/Index?mvc=1&bs=4&App=000001"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    // Optional filters to narrow down to one (or a few) training's full details (UAC 1.3).
    // courseName is the filter a user actually has in hand - they typically know the course
    // name, not its schedule ID - so it's a case-insensitive substring match against cosname.
    const scheduleIdFilter = args.scheduleId !== undefined && args.scheduleId !== null ? String(args.scheduleId) : "";
    const courseNameFilter = args.courseName ? String(args.courseName).trim().toLowerCase() : "";

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    const url = `${window.origin}/${reqOptions.sl}/TNDV9/ApplyTraining/GetScheduleCourseDetails`;

    let response;
    try {
      // Confirmed from a real capture: this endpoint takes no request body at all
      // (Content-Length: 0) - the employee is resolved from the session, not a
      // token in the payload (unlike TNDV9/TrainingProfile's endpoints).
      response = await fetch(url, {
        method: "POST",
        headers: headers
      });
    } catch (networkError) {
      return {
        status: "ERROR",
        message: `Could not reach the Apply for Training service (${url}): ${networkError.message}`
      };
    }

    const rawText = await response.text();
    let responseData = null;
    try {
      responseData = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      return {
        status: "ERROR",
        message: `Apply for Training service returned a non-JSON response (HTTP ${response.status} from ${url}).`,
        rawResponsePreview: rawText.slice(0, 300)
      };
    }

    if (!response.ok) {
      return {
        status: "ERROR",
        message: `API request to ${url} failed with status ${response.status}`,
        details: (responseData && responseData.Status && responseData.Status.Message) || rawText.slice(0, 300)
      };
    }

    // Wrapper shape (confirmed from a real capture):
    // { Status: { IsSuccessfull, Message, ... }, crs: [ <course/schedule entries> ], CosElgs: [ { ElgCode, ElgName } ], ... }
    // `crs` is the list of open course schedules this employee can view/apply for.
    const statusInfo = responseData && responseData.Status;
    if (!statusInfo || statusInfo.IsSuccessfull !== true || !Array.isArray(responseData.crs)) {
      return {
        status: "ERROR",
        message: (statusInfo && statusInfo.Message) || "Failed to retrieve training details"
      };
    }

    const elgLookup = {};
    (responseData.CosElgs || []).forEach((elg) => {
      if (elg && elg.ElgCode) elgLookup[elg.ElgCode] = elg.ElgName || "";
    });

    // ASP.NET JSON dates look like "/Date(1730658600000+0530)/" - see
    // drafts/gettrainingcalendarcoursedetails for the same helper and rationale.
    const parseAspNetDate = (dateStr) => {
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

      const local = new Date(ms + offsetMinutes * 60000);
      const pad = (n) => String(n).padStart(2, "0");
      return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
    };

    let trainings = responseData.crs.map((item) => {
      const schedule = (item.SchList || []).map((sch) => ({
        date: parseAspNetDate(sch.SchDate) || "",
        startTime: sch.StartTime || "",
        endTime: sch.EndTime || "",
        venue: sch.VenueName || "",
        resourcePersons: (sch.ResperList || []).map((resper) => ({
          name: resper.resname || "",
          category: resper.rescat || "",
          type: resper.typename || ""
        }))
      }));

      const capacity = item.Capacity || 0;
      const enrolled = item.Enrolled || 0;

      return {
        scheduleId: item.schid !== undefined && item.schid !== null ? String(item.schid) : "",
        courseCode: item.coscode || "",
        courseName: item.cosname || "",
        // Confirmed live (2026-09-07): the "Apply for Training" screen's own "Description
        // and Target Group" field renders this same cosdesc value with no separate target
        // group text visible alongside it - so `description` IS that combined UI field.
        description: item.cosdesc || "",
        // elgcode/CosElgs is the only eligibility-group-style field found on this endpoint,
        // but it was null on every schedule seen so far (including the one behind the live
        // screenshot above) and the live screen showed no distinct "target group" value to
        // confirm it against. Left in as a still-unconfirmed secondary candidate, separate
        // from `description`, in case a populated sample ever turns up.
        eligibilityGroup: item.elgcode ? { code: item.elgcode, name: elgLookup[item.elgcode] || "" } : null,
        trainingType: item.TrainType || "",
        field: item.Field || "",
        startDate: parseAspNetDate(item.startdate) || "",
        endDate: parseAspNetDate(item.enddate) || "",
        durationLabel: item.CosDuration || "",
        applicationCutoffDate: parseAspNetDate(item.cutdate) || "",
        // Confirmed live (2026-09-07): pardate is labeled "Participation Confirm Cut-off
        // Date" on the real screen, not a plain "participation date".
        participationConfirmationCutoffDate: parseAspNetDate(item.pardate) || "",
        // Confirmed live (2026-09-07): these four fields are real and visible (blank in the
        // captured sample, but present as editable fields on the live screen) - Objectives,
        // Relevance to Job, Benefit to you, Benefit to Company.
        objective: item.Ojective || "",
        relevanceToJob: item.JobRelavance || "",
        benefitToEmployee: item.PotentialYou || "",
        benefitToCompany: item.PotentialCompany || "",
        // Confirmed live (2026-09-07): these five collapsible sections are real and visible
        // on the Apply for Training detail screen, each backed by the matching per-course
        // lookup list already present in the raw response.
        courseSubjects: (item.SubList || []).map((s) => s.subName).filter(Boolean),
        courseQualifications: (item.QuaList || []).map((q) => q.QuaName).filter(Boolean),
        relatedCourseNeeds: (item.NeedList || []).map((n) => n.needname).filter(Boolean),
        courseClosureSteps: (item.CloseList || []).map((c) => c.CloseStep).filter(Boolean),
        courseSponsors: (item.SponList || []).map((s) => s.sponName).filter(Boolean),
        // Gap: the live screen also shows a "Training Evaluations" section (e.g. "3 Months"),
        // but no field in this endpoint's response matches that value - the top-level
        // `Evaluations` array was empty in every capture taken so far. Left empty with a
        // TODO rather than guessed; if a capture ever shows this section populated alongside
        // a non-empty response field, wire it up then.
        trainingEvaluations: [], // TODO: To Be Confirmed - see gap note above
        nominationStatus: item.nomination || "",
        schedule: schedule,
        seatAvailability: {
          capacity: capacity,
          enrolled: enrolled,
          waiting: item.Waiting || 0,
          applied: item.Applied || 0,
          availableSeats: Math.max(capacity - enrolled, 0)
        },
        hasAttachment: item.Attach === "1",
        attachmentName: item.AttachName || ""
      };
    });

    if (courseNameFilter) {
      trainings = trainings.filter((t) => t.courseName.toLowerCase().includes(courseNameFilter));
    }
    if (scheduleIdFilter) {
      trainings = trainings.filter((t) => t.scheduleId === scheduleIdFilter);
    }

    if (trainings.length === 0) {
      return {
        status: "SUCCESS",
        message: "No matching training programs are currently available.",
        totalCount: 0,
        trainings: []
      };
    }

    return {
      status: "SUCCESS",
      message: `Found ${trainings.length} training program(s).`,
      totalCount: trainings.length,
      trainings: trainings
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve training details: ${errorMessage}`,
      error: errorMessage
    };
  }
})
