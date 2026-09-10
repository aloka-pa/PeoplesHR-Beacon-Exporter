(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    // Confirmed live (New_PeoplesHR_Feature/DONE/getSelfEmployeeTrainingHistory/PeoplesHR.html):
    // only one menu variant found for this screen - "TNDV9/TrainerCourseEvaluation/Index?mvc=1&bs=4"
    // - unlike TraineeEvaluation, no separate isSupervisor=1/2 variants were present in that
    // same capture.
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainerCourseEvaluation/Index?mvc=1&bs=4"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    // Optional filter: a course name fragment, so a query like "database course" narrows
    // the list down. Case-insensitive substring match, same style as
    // getSelfEmployeeTraineeEvaluations' courseName filter - client-side, since the
    // underlying endpoint itself takes no filter parameters (see below).
    const courseNameFilter = args.courseName ? String(args.courseName).trim().toLowerCase() : "";

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    const url = `${window.origin}/${reqOptions.sl}/TNDV9/TrainerCourseEvaluation/GetTrainerCourseDetails`;

    let response;
    try {
      // Confirmed from a real capture (New_PeoplesHR_Feature/getSelfEmployeeTrainerCourseEvaluations/
      // GetTrainerCourseDetails.txt): this endpoint takes no request body at all
      // (Content-Length: 0, no --data-raw at all) - the employee is resolved purely from
      // the session, and there is no filter parameter to pass - it always returns every
      // trainer/course evaluation record for the logged-in employee.
      response = await fetch(url, {
        method: "POST",
        headers: headers
      });
    } catch (networkError) {
      return {
        status: "ERROR",
        message: `Could not reach the Trainer & Course Evaluation service (${url}): ${networkError.message}`
      };
    }

    const rawText = await response.text();
    let responseData = null;
    try {
      responseData = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      return {
        status: "ERROR",
        message: `Trainer & Course Evaluation service returned a non-JSON response (HTTP ${response.status} from ${url}).`,
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

    // Confirmed shape: { Status: { IsSuccessfull, Message, ... }, schList: [...] }.
    // Status.IsSuccessfull was true in the real capture and is used as the success gate
    // here (unlike GetTraineeEvalStages - see getSelfEmployeeTraineeEvaluationDetails -
    // no such quirk is confirmed for this endpoint).
    const statusInfo = responseData && responseData.Status;
    if (!statusInfo || statusInfo.IsSuccessfull !== true || !Array.isArray(responseData.schList)) {
      return {
        status: "ERROR",
        message: (statusInfo && statusInfo.Message) || "Failed to retrieve trainer & course evaluations."
      };
    }

    // ASP.NET JSON dates look like "/Date(1744741800000+0530)/" - same parser used
    // throughout this build (see tools/getselfemployeetraininghistory).
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

    let evaluations = responseData.schList.map((item) => ({
      appId: item.appid || "",
      scheduleId: item.schid !== undefined && item.schid !== null ? String(item.schid) : "",
      courseCode: item.coscode || "",
      courseName: item.cosname || "",
      startDate: parseAspNetDate(item.startdate),
      endDate: parseAspNetDate(item.enddate),
      trainingHours: item.tothrs !== undefined && item.tothrs !== null ? item.tothrs : 0,
      scheduleMonth: item.schmonth || "",
      // Two separate evaluation tracks per schedule - confirmed distinct in the real
      // capture: "trainereval" is the employee's evaluation of the trainer who delivered
      // the course, "courseeval" is the employee's evaluation of the course itself. Both
      // were "Completed" in every row of the captured sample - no "Pending"/other status
      // value has been confirmed yet, so none is assumed or normalized here.
      trainerEvaluationStatus: item.trainereval || "",
      courseEvaluationStatus: item.courseeval || ""
    }));

    if (courseNameFilter) {
      evaluations = evaluations.filter((e) => e.courseName.toLowerCase().includes(courseNameFilter));
    }

    if (evaluations.length === 0) {
      return {
        status: "SUCCESS",
        message: courseNameFilter
          ? `No trainer & course evaluations match "${args.courseName}".`
          : "No trainer & course evaluations were found.",
        totalCount: 0,
        evaluations: []
      };
    }

    return {
      status: "SUCCESS",
      message: `Found ${evaluations.length} trainer & course evaluation(s).`,
      totalCount: evaluations.length,
      evaluations: evaluations
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve trainer & course evaluations: ${errorMessage}`,
      error: errorMessage
    };
  }
})
