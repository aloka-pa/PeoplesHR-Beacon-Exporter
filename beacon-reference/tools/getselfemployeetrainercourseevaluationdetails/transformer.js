(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    // Same single confirmed menu variant as drafts/getselfemployeetrainercourseevaluations.
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainerCourseEvaluation/Index?mvc=1&bs=4"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const scheduleIdArg = args.scheduleId !== undefined && args.scheduleId !== null ? String(args.scheduleId).trim() : "";
    const courseNameQuery = args.courseName ? String(args.courseName).trim() : "";

    if (!scheduleIdArg && !courseNameQuery) {
      return {
        status: "VALIDATION_ERROR",
        message: "Either scheduleId or courseName is required to identify which trainer & course evaluation to view - call getSelfEmployeeTrainerCourseEvaluations first if neither is already known."
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
        throw new Error(`${path} failed with HTTP ${response.status}`);
      }
      return parsed;
    }

    // Step 1: resolve the target evaluation from the same list
    // getSelfEmployeeTrainerCourseEvaluations uses - never trust a caller-supplied
    // courseCode, always re-derive it fresh from a real row so GetCosTrainersDetails/
    // CommonQuestionnaire get values that are actually consistent with each other.
    // Confirmed: this endpoint takes no request body at all (same as tool 1's call).
    let summaryData;
    try {
      summaryData = await postJson("TNDV9/TrainerCourseEvaluation/GetTrainerCourseDetails", undefined);
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }
    const summaryStatus = summaryData && summaryData.Status;
    if (!summaryStatus || summaryStatus.IsSuccessfull !== true || !Array.isArray(summaryData.schList)) {
      return {
        status: "ERROR",
        message: (summaryStatus && summaryStatus.Message) || "Failed to retrieve trainer & course evaluations."
      };
    }

    let targetRow = null;
    if (scheduleIdArg) {
      targetRow = summaryData.schList.find((r) => String(r.schid) === scheduleIdArg) || null;
      if (!targetRow) {
        return {
          status: "ERROR",
          message: `No trainer & course evaluation was found for scheduleId ${scheduleIdArg}. Use getSelfEmployeeTrainerCourseEvaluations to find a valid schedule id.`
        };
      }
    } else {
      const needle = courseNameQuery.toLowerCase();
      const matches = summaryData.schList.filter((r) => (r.cosname || "").toLowerCase().includes(needle));
      if (matches.length === 0) {
        return {
          status: "ERROR",
          message: `No trainer & course evaluation was found matching courseName "${courseNameQuery}".`
        };
      }
      if (matches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one trainer & course evaluation matches courseName "${courseNameQuery}". Please specify using scheduleId.`,
          candidates: matches.map((r) => ({
            scheduleId: r.schid !== undefined && r.schid !== null ? String(r.schid) : "",
            appId: r.appid || "",
            courseCode: r.coscode || "",
            courseName: r.cosname || "",
            scheduleMonth: r.schmonth || ""
          }))
        };
      }
      targetRow = matches[0];
    }

    const appId = targetRow.appid || "";
    const scheduleId = targetRow.schid !== undefined && targetRow.schid !== null ? String(targetRow.schid) : "";
    const courseCode = targetRow.coscode || "";
    const courseName = targetRow.cosname || "";

    // Step 2: fetch the trainer(s) assigned to this schedule - confirmed shape:
    // { Status: {...}, cosTrainerList: [{ trncode, trnname, trncat, trnempno }] }. "SchID"
    // is sent as a NUMBER, not a string - confirmed from both real captures
    // (New_PeoplesHR_Feature/getSelfEmployeeTrainerCourseEvaluationDetails/
    // GetCosTrainersDetails-{1,2}.txt).
    let trainersData;
    try {
      trainersData = await postJson("TNDV9/TrainerCourseEvaluation/GetCosTrainersDetails", { SchID: Number(scheduleId) });
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }
    const trainersStatus = trainersData && trainersData.Status;
    const trainers =
      trainersStatus && trainersStatus.IsSuccessfull === true && Array.isArray(trainersData.cosTrainerList)
        ? trainersData.cosTrainerList.map((t) => ({
            code: t.trncode || "",
            // Real sample values have a trailing space (e.g. "Samuel Lopez ") - trimmed here.
            name: (t.trnname || "").trim(),
            category: t.trncat || ""
            // trnempno (an opaque per-session token, same kind as EmployeeNumber/empNo
            // elsewhere in this build) is deliberately dropped.
          }))
        : [];

    // Step 3: fetch the course evaluation questionnaire. Confirmed request shape from two
    // real captures - CommonQuestionnaire-{1,2}.txt - both using "categeoryID":"1" and
    // "trainnerCode":null (this is the COURSE evaluation, not a per-trainer one - see the
    // gap note in description.md). Note the wire-format quirks, confirmed identical in
    // both captures and preserved exactly: "appId" is sent as a STRING here (unlike
    // getSelfEmployeeTraineeEvaluationDetails's CommonQuestionnaire call, which sends a
    // number), "sheduleID" is sent as a NUMBER (the opposite of that same sibling call),
    // and there is no "isSupervisor" key in the body at all.
    let questionnaireData;
    try {
      questionnaireData = await postJson("TNDV9/Common/CommonQuestionnaire", {
        CourseCode: courseCode,
        categeoryID: "1",
        evalStageID: null,
        appId: appId,
        trainnerCode: null,
        sheduleID: Number(scheduleId),
        closurecode: null
      });
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }
    const qStatus = questionnaireData && questionnaireData.Status;
    if (!qStatus || qStatus.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (qStatus && qStatus.Message) || `Failed to retrieve the course evaluation questionnaire for "${courseName}".`
      };
    }

    // Maps one CommonQuestionnaire question entry into a clean shape. For an MCQ
    // question, the chosen answer is matched against ListRatingItems by
    // RatingItemGrade === McqQuetionAnswer (same confirmed convention as
    // getSelfEmployeeTraineeEvaluationDetails - grades are the 1-based labels shown to
    // the user, IDs are 0-based).
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

    // Merge every one of the five question-category lists - only "QuesReactList" had real
    // content in either capture, but all five are merged so nothing is silently dropped if
    // a future org ever configures the other four under categeoryID "1".
    const questions = [
      ...(questionnaireData.QuesReactList || []).map((q) => mapQuestion(q, "Reaction")),
      ...(questionnaireData.QuesLearnList || []).map((q) => mapQuestion(q, "Learning")),
      ...(questionnaireData.QuesBehavList || []).map((q) => mapQuestion(q, "Behaviour")),
      ...(questionnaireData.QuesResultList || []).map((q) => mapQuestion(q, "Result")),
      ...(questionnaireData.QuesOtherList || []).map((q) => mapQuestion(q, "Other"))
    ].sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      status: "SUCCESS",
      message: `Found the trainer & course evaluation for "${courseName}".`,
      appId: appId,
      scheduleId: scheduleId,
      courseCode: courseCode,
      courseName: courseName,
      // Informational passthrough from the summary list (tool 1) - the trainer
      // evaluation's own questionnaire is not confirmed by any capture (see gap note in
      // description.md), so only its status, not its Q&A, is surfaced here.
      trainerEvaluationStatus: targetRow.trainereval || "",
      trainers: trainers,
      courseEvaluation: {
        courseEvaluationStatus: targetRow.courseeval || "",
        employeeSubmitted: questionnaireData.EmpSubmissionStaus === 1,
        supervisorSubmitted: questionnaireData.SupSubmissionStaus === 1,
        supervisorComments: (questionnaireData.SupComments || "").trim(),
        // Deliberately NOT surfaced: CommonQuestionnaire's EffectivenessMarks/ReactionMarks/
        // etc. are always 0.0 in every capture regardless of completion status - confirmed
        // NOT the real score. The real screen shows a live "Course Effectiveness 80.00%" /
        // "Reaction 80.00%" for this exact course ("Select Supervicer course test") via a
        // Knockout computed observable whose formula isn't confirmed - a naive "average the
        // question marks" reconstruction was tried against this exact capture and does not
        // reproduce it (60% computed vs. 80% actual). Omit rather than show a number known
        // to be wrong; revisit only once the real formula or a real data source for it is
        // confirmed.
        questions: questions
      }
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve trainer & course evaluation details: ${errorMessage}`,
      error: errorMessage
    };
  }
})
