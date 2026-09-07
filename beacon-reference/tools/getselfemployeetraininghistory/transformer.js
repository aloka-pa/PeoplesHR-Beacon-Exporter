(async function (data, args, reqOptions) {
  try {
    // Menu-access gate, following the same pattern as drafts/gettrainingcalendarcoursedetails.
    // Confirmed via a saved shell-page capture (New_PeoplesHR_Feature/getSelfEmployeeTrainingHistory/PeoplesHR.html)
    // listing this screen's menu entries for the three personas: Applicant (App=000001),
    // Supervisor (App=000002), Admin (App=000007).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const trainingProfileMenus = [
      "TNDV9/TrainingProfile/Index?mvc=1&bs=4&App=000001",
      "TNDV9/TrainingProfile/Index?mvc=1&bs=4&App=000002",
      "TNDV9/TrainingProfile/Index?mvc=1&bs=4&App=000007"
    ];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && trainingProfileMenus.some((m) => menu.includes(m)));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    // Self only - never ask the user for their employee number, resolve from session
    // metadata the same way tools/getadmininformationdetails does.
    const empNo = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.empNo) || "";
    const empDisplayNo = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.empDisplayNo) || "";
    if (!empNo) {
      return {
        status: "ERROR",
        message: "Could not resolve the logged-in employee from BeaconBar.user.metaData."
      };
    }

    // --- Step 1: obtain the per-employee encrypted "id" token every TNDV9/TrainingProfile
    // and TNDV9/ProfileWidgets endpoint requires in its POST body. Live captures of the
    // Training Profile page (New_PeoplesHR_Feature/getSelfEmployeeTrainingHistory/) show
    // every one of its ~12 XHR calls sharing one identical opaque token per page load -
    // it is not a session cookie, it travels in the JSON body.
    //
    // CONFIRMED (2026-09-07, live page capture): unlike the WebForms "encrypt client-side
    // with a page-supplied RSA public key" pattern (tools/getworkexperiencedetails), this
    // screen's server pre-computes the token and drops it straight into the page as a
    // hidden input, `<input id="EmpNumber" type="hidden" value="<token>">` - no public key
    // exists anywhere on the page (confirmed: zero hits searching 171KB of markup for
    // "publickey"/"rsa"/"-----BEGIN"/etc.), and no client-side encryption step is needed
    // at all. The token's shape matches the `empnumber` field already seen embedded in
    // GetTrainingRecords' external-training-record rows, confirming this is the same kind
    // of pre-encrypted employee identifier, just delivered a different way for this screen.
    //
    // The page itself is reached the same way tools/getworkexperiencedetails (confirmed
    // live) reaches its own WebForms screen: resolve the full, digest-bearing URL straight
    // from BeaconBar.user.metaData.menus via functions/updateurlparams (a live network
    // capture showed the app's own navigation appending a per-session `&digest=...` query
    // param that isn't something to compute or guess), then fetch that resolved path
    // directly. This is confirmed working - the page fetch itself already succeeds.
    const updateUrlData = await BeaconBar.executeFunction("updateUrlParams")("TNDV9/TrainingProfile/Index");
    const pageUrl = updateUrlData.updateUrl || "TNDV9/TrainingProfile/Index";

    let pageHtml;
    try {
      const pageResponse = await fetch(`${window.origin}/${reqOptions.sl}/${pageUrl}`, {
        method: "GET",
        headers: { "x-requested-with": "XMLHttpRequest" },
        redirect: "follow"
      });
      pageHtml = await pageResponse.text();
    } catch (networkError) {
      return {
        status: "ERROR",
        message: `Could not reach the Training Profile page (${pageUrl}): ${networkError.message}`
      };
    }

    const doc = new DOMParser().parseFromString(pageHtml, "text/html");
    const empId = doc.querySelector('#EmpNumber')?.value || doc.querySelector('#EmpNumberSearch')?.value || "";

    if (!empId) {
      return {
        status: "ERROR",
        message: "Could not locate the employee identity token (#EmpNumber) on the Training Profile page - the page markup may have changed since this was last confirmed.",
        diagnostics: {
          pageUrl: pageUrl,
          pageHtmlLength: pageHtml.length,
          pageHtmlPreview: pageHtml.slice(0, 4000)
        }
      };
    }

    // --- Shared TNDV9 JSON fetch helper, matching the plain-fetch pattern already used
    // by drafts/gettrainingcalendarcoursedetails and tools/gettrainingbudgetallocation for
    // this same module (Accept/Content-Type/x-requested-with headers, text-then-JSON-parse
    // so a session-timeout HTML page or a non-2xx response surfaces as a clear error
    // instead of an opaque JSON-parse exception).
    async function postJson(path, body) {
      const url = `${window.origin}/${reqOptions.sl}/${path}`;
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/json; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
          },
          body: JSON.stringify(body)
        });
      } catch (networkError) {
        throw new Error(`Could not reach ${url}: ${networkError.message}`);
      }
      const rawText = await response.text();
      let parsed = null;
      try {
        parsed = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        throw new Error(`${path} returned a non-JSON response (HTTP ${response.status}).`);
      }
      if (!response.ok) {
        throw new Error((parsed && parsed.Status && parsed.Status.Message) || `${path} failed with status ${response.status}`);
      }
      return parsed || {};
    }

    // ASP.NET JSON dates look like "/Date(1730658600000+0530)/" - same parser used by
    // drafts/gettrainingcalendarcoursedetails, copied verbatim for consistency. The offset
    // is the server's local offset the wall-clock date was recorded in, so it has to be
    // applied to the epoch ms before reading the date parts back out.
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

    // --- Attended trainings (UAC 5.1) - confirmed via
    // TNDV9/TrainingEnrollment/GetPastCourseDetails -> PastList[].
    let pastCourseData;
    try {
      pastCourseData = await postJson("TNDV9/TrainingEnrollment/GetPastCourseDetails", { id: empId });
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }

    const attended = (pastCourseData.PastList || []).map((item) => ({
      scheduleId: item.schid || "",
      courseCode: item.coscode || "",
      courseName: item.cosname || "",
      startDate: parseAspNetDate(item.stratdate),
      endDate: parseAspNetDate(item.enddate),
      totalHours: item.tothrs || 0,
      cost: item.coscost || 0,
      effectivenessPercent: item.effective || 0,
      cpd: item.cpd || null
    }));

    // --- Applied / registered / direct-enrolled / upcoming (UAC 5.2-5.4) - all
    // confirmed live via TNDV9/TrainingProfile/TrainingProgramDetails, called repeatedly
    // with different `apptype` values that each populate a different top-level field on
    // the same shared response envelope. Confirmed codes (2026-09-07):
    //   "RT" -> registered[]   (Registered Trainings - has a confirmed schedule)
    //   "T"  -> applied[]      (Applied Trainings - the actual UAC 5.2 "applied" list)
    //   "D"  -> directenroll[] (Direct Enrolled Trainings - enrolled without applying)
    //   "N"  -> needs[]        (Training Needs - see below)
    // "nominated" (UAC 5.3) has no confirmed apptype code yet - every capture's
    // top-level "nominate" field has been empty so far, including under these four
    // confirmed codes. Given the pattern above, it almost certainly has its own code
    // too; left as [] with a TODO rather than guessed, since a wrong code risks silently
    // returning the wrong category's data under the "nominated" label.
    const todayKey = parseAspNetDate(`/Date(${Date.now()})/`);

    // Item shape is identical across "RT"/"T"/"D" - one shared mapper.
    function mapProgramItem(item) {
      const lastWfDetail = (item.WFList || [])
        .map((wf) => (wf.WFDetail || [])[0])
        .filter(Boolean)
        .pop();
      // RBTList tags a course as a Role-Based Training (RBT) assignment - confirmed
      // shape from a live TrainingRoleBasedDetails capture:
      // { rbtid, rbtname, rbtcoscode, rbtcategorycode }. Every earlier capture of
      // "applied"/"registered"/"directenroll" items had this field present but always
      // empty; a live test (2026-09-07) confirmed it populates here too when the course
      // is actually a role-based one (matching the "Role Based Trainings (RBT)" tab on
      // the Training Profile screen) - it just wasn't being read out before.
      const roleBasedTraining =
        item.RBTList && item.RBTList.length > 0
          ? item.RBTList.map((rbt) => ({
              id: rbt.rbtid || "",
              name: rbt.rbtname || "",
              categoryCode: rbt.rbtcategorycode || ""
            }))
          : null;
      return {
        scheduleId: item.schid || "",
        applicationId: item.appid || "",
        courseCode: item.coscode || "",
        courseName: item.cosname || "",
        startDate: parseAspNetDate(item.stratdate),
        endDate: parseAspNetDate(item.enddate),
        totalHours: item.tothrs || 0,
        cost: item.coscost || 0,
        enrollmentStatus: item.enroll || "",
        participationConfirmationStatus: item.confirm || "",
        evaluationStatus: item.evalstat || null,
        completionStatus: item.complete || null,
        lastWorkflowStep: lastWfDetail ? lastWfDetail.appdesc : "",
        lastWorkflowStatus: lastWfDetail ? lastWfDetail.wfapproval : "",
        needName: item.needname || null,
        roleBasedTraining: roleBasedTraining
      };
    }

    async function fetchProgramList(apptype, fieldName) {
      let programData;
      try {
        programData = await postJson("TNDV9/TrainingProfile/TrainingProgramDetails", { id: empId, apptype: apptype });
      } catch (err) {
        throw new Error(`${fieldName} (apptype:"${apptype}") - ${err.message}`);
      }
      return (programData[fieldName] || []).map(mapProgramItem);
    }

    let registered, applied, directEnrolled;
    try {
      registered = await fetchProgramList("RT", "registered");
      applied = await fetchProgramList("T", "applied");
      directEnrolled = await fetchProgramList("D", "directenroll");
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }

    // Upcoming: union of every schedule-bearing category (registered/applied/direct
    // enrolled), filtered to a future start date and deduplicated by scheduleId - the
    // same course can legitimately appear in more than one of those three lists.
    const upcomingMap = new Map();
    [...registered, ...applied, ...directEnrolled].forEach((item) => {
      if (item.startDate && item.startDate >= todayKey && !upcomingMap.has(item.scheduleId)) {
        upcomingMap.set(item.scheduleId, item);
      }
    });
    const upcoming = Array.from(upcomingMap.values());

    // TODO: To Be Confirmed - see note above; no confirmed apptype code yet distinguishes
    // a nominated-for application from a self-applied one.
    const nominated = [];

    // --- Training needs (UAC 5.5) - CONFIRMED via a live capture: the same
    // TrainingProgramDetails endpoint populates "needs[]" instead of "registered[]" when
    // called with apptype:"N" (Needs), rather than "RT" (Registered Trainings). Field
    // shape confirmed from that capture: needid/needtype/needdesc identify the need,
    // approve is the approval status, enroll is the enrollment status ("Not Applicable"
    // when the need isn't tied to a schedule yet), coscode/cosname/schid (when non-null)
    // are the related schedule, and jobrel/potenyou/potencomp/objective are the same four
    // narrative fields used by UAC 2.6/3.7 (Job Relevance / Benefit to employee / Benefit
    // to company / Objective).
    let needsData;
    try {
      needsData = await postJson("TNDV9/TrainingProfile/TrainingProgramDetails", { id: empId, apptype: "N" });
    } catch (err) {
      return { status: "ERROR", message: err.message };
    }

    const trainingNeeds = (needsData.needs || []).map((item) => ({
      needId: item.needid || "",
      needType: item.needtype || "",
      needDescription: item.needdesc || "",
      needName: item.needname || "",
      approvalStatus: item.approve || "",
      enrollmentStatus: item.enroll || "",
      relatedSchedule: item.schid
        ? { scheduleId: item.schid, courseCode: item.coscode || "", courseName: item.cosname || "" }
        : null,
      jobRelevance: item.jobrel || "",
      benefitToEmployee: item.potenyou || "",
      benefitToCompany: item.potencomp || "",
      objective: item.objective || "",
      requestedBy: item.request || "",
      applyDate: parseAspNetDate(item.applydate)
    }));

    // --- External training records (self-reported courses taken outside PeoplesHR,
    // e.g. an external certification submitted for approval/reimbursement) - confirmed
    // via TNDV9/TrainingProfile/GetTrainingRecords -> trnrecds[]. Not one of UAC 5.1-5.6's
    // named categories, but real employee training data worth surfacing (same pattern as
    // the bonus "registered"/"directEnrolled" fields above).
    //
    // IMPORTANT: each record's AttchList[] entries carry an "attchfile" field containing
    // the full attachment as base64 (a captured sample response was 5.4MB, almost
    // entirely this field, across just a handful of records with PDF attachments) - that
    // is binary file content, not something a chat answer should ever include. Only
    // lightweight attachment metadata (name/type) is kept below; the file content itself
    // is intentionally dropped. Non-fatal: a failure here doesn't block the UAC
    // 5.1-5.6 lists above, which are the source of truth.
    let externalTrainingRecords = [];
    try {
      const recordsData = await postJson("TNDV9/TrainingProfile/GetTrainingRecords", { id: empId });
      externalTrainingRecords = (recordsData.trnrecds || []).map((item) => ({
        id: item.dirid || "",
        courseName: item.cosname || "",
        location: item.location || "",
        durationDays: item.duration || 0,
        startDate: parseAspNetDate(item.fromdate),
        endDate: parseAspNetDate(item.todate),
        cost: item.cosamount || 0,
        currencyCode: item.currid || "",
        approvalStatus: item.approved || "",
        submissionStatus: item.submit || "",
        comments: item.comments || "",
        attachments: (item.AttchList || []).map((a) => ({
          name: a.attchname || "",
          type: a.attchtype || ""
        }))
      }));
    } catch (err) {
      externalTrainingRecords = [];
    }

    // --- Optional, supplementary only (matches the solution doc's own note that the
    // aggregate trainingWidgetData-style summary doesn't substitute for the itemized
    // lists above): this-year/last-year hours/cost rollup, confirmed via
    // TNDV9/ProfileWidgets/LoadRegisteredTraining. Failures here are non-fatal - the
    // itemized lists above are the source of truth for UAC 5.1-5.5.
    let summary = null;
    try {
      const widgetData = await postJson("TNDV9/ProfileWidgets/LoadRegisteredTraining", { id: empId });
      summary = {
        thisYearPeriod: widgetData.thisYrPeriod || "",
        thisYearCount: widgetData.thisYrCount || 0,
        thisYearHours: widgetData.thisYrHours || "0",
        thisYearCost: widgetData.thisYrCost || "0",
        lastYearPeriod: widgetData.lastYrPeriod || "",
        lastYearCount: widgetData.lastYrCount || 0,
        lastYearHours: widgetData.lastYrHours || "0",
        lastYearCost: widgetData.lastYrCost || "0"
      };
    } catch (err) {
      summary = null;
    }

    const isEmpty =
      attended.length === 0 &&
      applied.length === 0 &&
      registered.length === 0 &&
      directEnrolled.length === 0 &&
      nominated.length === 0 &&
      upcoming.length === 0 &&
      trainingNeeds.length === 0 &&
      externalTrainingRecords.length === 0;

    return {
      status: "SUCCESS",
      message: isEmpty
        ? "No relevant training information was found."
        : `Found training history for employee ${empDisplayNo || empNo}.`,
      attended: attended,
      applied: applied,
      registered: registered,
      directEnrolled: directEnrolled,
      externalTrainingRecords: externalTrainingRecords,
      nominated: nominated,
      upcoming: upcoming,
      trainingNeeds: trainingNeeds,
      summary: summary
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to retrieve training history: ${errorMessage}`,
      error: errorMessage
    };
  }
})
