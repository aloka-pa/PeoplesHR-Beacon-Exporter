(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    // Confirmed live (New_PeoplesHR_Feature/DONE/getSelfEmployeeTrainingHistory/PeoplesHR.html):
    // three persona menu variants share this literal prefix - "TNDV9/TraineeEvaluation/Index?mvc=1&bs=4"
    // (Employee/self), "...&isSupervisor=1", "...&isSupervisor=2" - so a single substring check
    // already grants access under any of the three, same effective behaviour as the
    // multi-string .some() gate other self-tools use, just shorter given the shared prefix.
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TraineeEvaluation/Index?mvc=1&bs=4"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    // Optional filter: a course name/description fragment, so a query like "database
    // course" narrows the list down. Case-insensitive substring match, same style as
    // getSelfEmployeeTrainings' courseName filter.
    const courseNameFilter = args.courseName ? String(args.courseName).trim().toLowerCase() : "";

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    const url = `${window.origin}/${reqOptions.sl}/TNDV9/TraineeEvaluation/GetTraineeEvalSummaryDetails`;

    let response;
    try {
      // Confirmed from a real capture (New_PeoplesHR_Feature/getSelfEmployeeTraineeEvaluations/
      // GetTraineeEvalSummaryDetails.txt): "islogedSupervisor":"0" is what the Employee
      // (self) persona sends - never derived from session data, always this literal value
      // for this self-only tool. A Supervisor/Admin variant of this screen would send "1",
      // but that's a different persona/tool, not something this tool ever needs to vary.
      response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ islogedSupervisor: "0" })
      });
    } catch (networkError) {
      return {
        status: "ERROR",
        message: `Could not reach the Trainee Evaluation service (${url}): ${networkError.message}`
      };
    }

    const rawText = await response.text();
    let responseData = null;
    try {
      responseData = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      return {
        status: "ERROR",
        message: `Trainee Evaluation service returned a non-JSON response (HTTP ${response.status} from ${url}).`,
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

    // Confirmed shape: { Status: { IsSuccessfull, Message, ... }, SummaryList: [...],
    // ValidateNextEvaluation, isSupervisor }. Unlike GetTraineeEvalStages (see
    // getSelfEmployeeTraineeEvaluationDetails), this endpoint's Status.IsSuccessfull IS a
    // reliable success gate - confirmed true in the real capture.
    const statusInfo = responseData && responseData.Status;
    if (!statusInfo || statusInfo.IsSuccessfull !== true || !Array.isArray(responseData.SummaryList)) {
      return {
        status: "ERROR",
        message: (statusInfo && statusInfo.Message) || "Failed to retrieve trainee evaluations."
      };
    }

    // ASP.NET JSON dates look like "/Date(1743532200000+0530)/" - same parser used
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

    let evaluations = responseData.SummaryList.map((item) => {
      const employeeSubmitted = item.empSubmissionStatusFlg === 1;
      const supervisorSubmitted = item.supSubmissionStatusFlg === 1;
      // Derived, not returned directly by the API: from the Employee persona's own point
      // of view (UAC 4.2 - "pending training evaluations"), the evaluation is still this
      // employee's own pending action whenever they haven't submitted yet, regardless of
      // the supervisor's own status.
      let evaluationStatus;
      if (employeeSubmitted && supervisorSubmitted) evaluationStatus = "Completed";
      else if (employeeSubmitted) evaluationStatus = "Awaiting Supervisor";
      else evaluationStatus = "Pending";

      return {
        appId: item.appId !== undefined && item.appId !== null ? String(item.appId) : "",
        scheduleId: item.SheduleId || "",
        courseCode: item.courseCode || "",
        courseName: item.courseDesc || "",
        scheduleStartDate: parseAspNetDate(item.SheduleStartdate),
        scheduleEndDate: parseAspNetDate(item.SheduleEnddate),
        trainingHours: item.SheduleTotalHours || "0",
        evaluationMonth: item.evaluationMonth || "",
        evaluationStatus: evaluationStatus,
        employeeSubmitted: employeeSubmitted,
        supervisorSubmitted: supervisorSubmitted,
        designation: item.DsgName || "",
        // Always 0/[] in every captured sample, but a real field the screen tracks
        // (pre-training materials attached to the course) - passed through as-is.
        preTrainingMaterialsCount: item.PreTraMaterialsCount || 0,
        materials: Array.isArray(item.MaterialList) ? item.MaterialList : []
      };
    });

    if (courseNameFilter) {
      evaluations = evaluations.filter((e) => e.courseName.toLowerCase().includes(courseNameFilter));
    }

    if (evaluations.length === 0) {
      return {
        status: "SUCCESS",
        message: courseNameFilter
          ? `No training evaluations match "${args.courseName}".`
          : "No training evaluations were found.",
        totalCount: 0,
        evaluations: []
      };
    }

    return {
      status: "SUCCESS",
      message: `Found ${evaluations.length} training evaluation(s).`,
      totalCount: evaluations.length,
      evaluations: evaluations
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve trainee evaluations: ${errorMessage}`,
      error: errorMessage
    };
  }
})
