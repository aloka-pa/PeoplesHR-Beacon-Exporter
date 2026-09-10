(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    // Same shared-prefix menu gate as drafts/getselfemployeetraineeevaluations - see that
    // tool's comment for why one substring check covers all three persona variants.
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TraineeEvaluation/Index?mvc=1&bs=4"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const appIdArg = args.appId !== undefined && args.appId !== null ? String(args.appId).trim() : "";
    const scheduleIdArg = args.scheduleId !== undefined && args.scheduleId !== null ? String(args.scheduleId).trim() : "";
    const courseNameQuery = args.courseName ? String(args.courseName).trim() : "";

    if (!(appIdArg && scheduleIdArg) && !courseNameQuery) {
      return {
        status: "VALIDATION_ERROR",
        message: "Either both appId and scheduleId, or courseName, is required to identify which trainee evaluation to view - call getSelfEmployeeTraineeEvaluations first if none of these are already known."
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
          body: JSON.stringify(body)
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
        throw new Error(`${path} failed with HTTP ${response.status}`);
      }
      return parsed;
    }

    // Step 1: resolve the target evaluation from the same summary list
    // getSelfEmployeeTraineeEvaluations uses - never trust caller-supplied courseCode,
    // always re-derive it fresh from a real row so GetTraineeEvalStages/CommonQuestionnaire
    // get a courseCode that's actually consistent with the appId/scheduleId pair.
    let summaryData;
    try {
      summaryData = await postJson("TNDV9/TraineeEvaluation/GetTraineeEvalSummaryDetails", { islogedSupervisor: "0" });
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }
    const summaryStatus = summaryData && summaryData.Status;
    if (!summaryStatus || summaryStatus.IsSuccessfull !== true || !Array.isArray(summaryData.SummaryList)) {
      return {
        status: "ERROR",
        message: (summaryStatus && summaryStatus.Message) || "Failed to retrieve trainee evaluations."
      };
    }

    let targetRow = null;
    if (appIdArg && scheduleIdArg) {
      targetRow = summaryData.SummaryList.find(
        (r) => String(r.appId) === appIdArg && String(r.SheduleId) === scheduleIdArg
      ) || null;
      if (!targetRow) {
        return {
          status: "ERROR",
          message: `No trainee evaluation was found for appId ${appIdArg} / scheduleId ${scheduleIdArg}. Use getSelfEmployeeTraineeEvaluations to find a valid pair.`
        };
      }
    } else {
      const needle = courseNameQuery.toLowerCase();
      const matches = summaryData.SummaryList.filter((r) => (r.courseDesc || "").toLowerCase().includes(needle));
      if (matches.length === 0) {
        return {
          status: "ERROR",
          message: `No trainee evaluation was found matching courseName "${courseNameQuery}".`
        };
      }
      if (matches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one trainee evaluation matches courseName "${courseNameQuery}". Please specify using appId and scheduleId.`,
          candidates: matches.map((r) => ({
            appId: r.appId !== undefined && r.appId !== null ? String(r.appId) : "",
            scheduleId: r.SheduleId || "",
            courseCode: r.courseCode || "",
            courseName: r.courseDesc || "",
            evaluationMonth: r.evaluationMonth || ""
          }))
        };
      }
      targetRow = matches[0];
    }

    const appId = String(targetRow.appId);
    const scheduleId = targetRow.SheduleId;
    const courseCode = targetRow.courseCode || "";
    const courseName = targetRow.courseDesc || "";

    // Step 2: fetch the evaluation stage(s) for this appId/scheduleId. Confirmed shape:
    // a bare JSON ARRAY (not wrapped), each entry describing one evaluation stage/period
    // (e.g. "3 Months"). Every real capture (3 confirmed pairs) returned exactly one
    // entry, but the array shape is handled generically rather than assuming a single
    // element, in case a course with multiple evaluation periods ever returns more than
    // one stage at once.
    //
    // IMPORTANT, confirmed quirk: each entry's own "Status.IsSuccessfull" was FALSE in
    // every one of the 3 real captures used to build this tool, despite the call clearly
    // succeeding and returning real, correct stage data every time. Unlike almost every
    // other endpoint in this codebase, that inner Status block is NOT a reliable success
    // signal here - do not gate on it. A non-empty array is treated as success instead.
    let stagesData;
    try {
      stagesData = await postJson("TNDV9/TraineeEvaluation/GetTraineeEvalStages", {
        sheduleID: scheduleId,
        appID: Number(appId)
      });
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }
    if (!Array.isArray(stagesData) || stagesData.length === 0) {
      return {
        status: "ERROR",
        message: `No evaluation stage was found for "${courseName}" (appId ${appId}, scheduleId ${scheduleId}).`
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

    // Maps one CommonQuestionnaire question entry into a clean shape. For an MCQ
    // question, the chosen answer is matched against ListRatingItems by
    // RatingItemGrade === McqQuetionAnswer (confirmed against real data: an answer value
    // of "4" always matched the rating item with RatingItemGrade "4", not RatingItemID
    // "4" - grades are the 1-based labels shown to the user, IDs are 0-based).
    function mapQuestion(q, category) {
      const ratingOptions = (q.ListRatingItems || []).map((r) => ({
        grade: r.RatingItemGrade || "",
        marks: r.RatinItemgMarks,
        description: r.RatingItemDescription || ""
      }));
      const selectedOption = q.McqQuetionAnswer
        ? ratingOptions.find((o) => o.grade === q.McqQuetionAnswer) || null
        : null;
      return {
        questionId: q.QuetionID || "",
        category: category,
        questionText: q.Quetion || "",
        questionType: q.QuetionTypeName || "",
        displayOrder: q.QuetionDisplayOrder || 0,
        isCompleted: q.QuetionIsCompleted === 1,
        directAnswer: q.DirectQuetionAnswer || null,
        directRating: q.DirectQuetionRating || null,
        mcqAnswer: selectedOption,
        mcqComment: q.McqQuetionComment || null,
        ratingOptions: ratingOptions
      };
    }

    // Step 3: fetch the questionnaire (Q&A) for each stage. Confirmed only "categeoryID":
    // "4" (Reaction) in every real capture - QuesLearnList/QuesBehavList/QuesResultList/
    // QuesOtherList were always empty across all 3 samples. Hardcoded to "4" rather than
    // guessed at other values, since no capture confirms what those would look like; all
    // five lists are still merged into `questions` below so nothing is silently dropped
    // if a future response ever populates one of the other four.
    const evaluationStages = [];
    for (const stage of stagesData) {
      let questionnaireData;
      try {
        questionnaireData = await postJson("TNDV9/Common/CommonQuestionnaire", {
          CourseCode: courseCode,
          categeoryID: "4",
          evalStageID: stage.evaluationID,
          appId: Number(appId),
          trainnerCode: null,
          sheduleID: scheduleId,
          closurecode: null,
          isSupervisor: "0"
        });
      } catch (err) {
        return { status: "ERROR", message: err.message };
      }
      const qStatus = questionnaireData && questionnaireData.Status;
      if (!qStatus || qStatus.IsSuccessfull !== true) {
        return {
          status: "ERROR",
          message: (qStatus && qStatus.Message) || `Failed to retrieve the questionnaire for evaluation stage "${stage.evaluationDescription || stage.evaluationID}".`
        };
      }

      const questions = [
        ...(questionnaireData.QuesReactList || []).map((q) => mapQuestion(q, "Reaction")),
        ...(questionnaireData.QuesLearnList || []).map((q) => mapQuestion(q, "Learning")),
        ...(questionnaireData.QuesBehavList || []).map((q) => mapQuestion(q, "Behaviour")),
        ...(questionnaireData.QuesResultList || []).map((q) => mapQuestion(q, "Result")),
        ...(questionnaireData.QuesOtherList || []).map((q) => mapQuestion(q, "Other"))
      ].sort((a, b) => a.displayOrder - b.displayOrder);

      evaluationStages.push({
        evaluationId: stage.evaluationID || "",
        evaluationName: stage.evaluationDescription || "",
        evaluationDate: parseAspNetDate(stage.EvaluationStartDate),
        stepNumber: stage.StepNumber || "",
        currentStage: stage.EvaluationCurrentStage || "",
        status: stage.evalStatus || "",
        employeeSubmitted: questionnaireData.EmpSubmissionStaus === 1,
        supervisorSubmitted: questionnaireData.SupSubmissionStaus === 1,
        supervisorComments: (questionnaireData.SupComments || "").trim(),
        // Deliberately NOT surfaced: CommonQuestionnaire's EffectivenessMarks/ReactionMarks/
        // LearnMarks/BehaviourMarks/ResultMarks are always 0.0 in every capture regardless
        // of completion status - confirmed NOT the real score (a real, live "Effectiveness
        // 50.00%" / "Reaction 50.00%" was seen on the actual screen for a fully completed
        // evaluation where these fields were still 0.0). The real percentage is rendered by
        // a Knockout computed observable (TndQuestionnaire.Effectiveness/
        // ReactionMarksDisplay) whose formula isn't confirmed - a naive "average the
        // question marks" reconstruction was tried and does not reproduce the real values
        // (60% computed vs. 80% actual on one sample, 35% vs. 50% on another). Omit rather
        // than show a number known to be wrong; revisit only once the real formula or a
        // real data source for it is confirmed.
        questions: questions
      });
    }

    return {
      status: "SUCCESS",
      message: `Found ${evaluationStages.length} evaluation stage(s) for "${courseName}".`,
      appId: appId,
      scheduleId: scheduleId,
      courseCode: courseCode,
      courseName: courseName,
      evaluationStages: evaluationStages
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve trainee evaluation details: ${errorMessage}`,
      error: errorMessage
    };
  }
})
