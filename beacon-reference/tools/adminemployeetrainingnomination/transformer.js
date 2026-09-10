(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/ApplyTraining/Index?mvc=1&bs=4&App=000007"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const scheduleId = args.scheduleId !== undefined && args.scheduleId !== null ? String(args.scheduleId).trim() : "";
    const courseNameQuery = args.courseName ? String(args.courseName).trim() : "";
    const employeeQueries = (Array.isArray(args.employees) ? args.employees : [])
      .map((e) => (e !== undefined && e !== null ? String(e).trim() : ""))
      .filter((e) => e);
    const objective = args.objective ? String(args.objective).trim() : "";
    const relevanceToJob = args.relevanceToJob ? String(args.relevanceToJob).trim() : "";
    const benefitToEmployee = args.benefitToEmployee ? String(args.benefitToEmployee).trim() : "";
    const benefitToCompany = args.benefitToCompany ? String(args.benefitToCompany).trim() : "";
    const expectedLearning = args.expectedLearning ? String(args.expectedLearning).trim() : "";

    if (!scheduleId && !courseNameQuery) {
      return { status: "VALIDATION_ERROR", message: "Either scheduleId or courseName is required to identify which training schedule to nominate into." };
    }
    if (employeeQueries.length === 0) {
      return { status: "VALIDATION_ERROR", message: "At least one employee (name or employee number) is required in employees." };
    }
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

    const jsonHeaders = new Headers();
    jsonHeaders.append("Accept", "*/*");
    jsonHeaders.append("Content-Type", "application/json");
    jsonHeaders.append("x-requested-with", "XMLHttpRequest");

    async function postJson(path, body) {
      const url = `${window.origin}/${reqOptions.sl}/${path}`;
      let response;
      try {
        response = await fetch(url, {
          method: "POST",
          headers: jsonHeaders,
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

    async function getText(url) {
      const textHeaders = new Headers();
      textHeaders.append("accept", "*/*");
      textHeaders.append("x-requested-with", "XMLHttpRequest");
      const response = await fetch(url, { method: "GET", headers: textHeaders });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`${url} failed with HTTP ${response.status}`);
      }
      return text;
    }

    // Step 1: locate the full course/schedule object - identical mechanism to
    // getSelfEmployeeTrainings / supervisorEmployeeTrainingNomination. Confirmed to
    // return the same schedule catalog regardless of self/supervisor/admin context.
    const scheduleData = await postJson("TNDV9/ApplyTraining/GetScheduleCourseDetails", undefined);
    if (!scheduleData || !scheduleData.Status || scheduleData.Status.IsSuccessfull !== true || !Array.isArray(scheduleData.crs)) {
      return {
        status: "ERROR",
        message: (scheduleData && scheduleData.Status && scheduleData.Status.Message) || "Failed to load available training schedules"
      };
    }

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

    let courseItem = null;
    if (scheduleId) {
      courseItem = scheduleData.crs.find((item) => String(item.schid) === scheduleId) || null;
      if (!courseItem) {
        return {
          status: "ERROR",
          message: `No open training schedule was found for scheduleId ${scheduleId}. Use getSelfEmployeeTrainings or getTrainingCalendarCourseDetails to find a valid schedule id.`
        };
      }
    } else {
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

    const startdateConv = toIsoAndDisplay(courseItem.startdate);
    const enddateConv = toIsoAndDisplay(courseItem.enddate);
    const cutdateConv = toIsoAndDisplay(courseItem.cutdate);
    const pardateConv = toIsoAndDisplay(courseItem.pardate);

    // Step 2: resolve the admin's own opaque identity token. Confirmed live: the
    // "Nominate for Training" (Admin) page embeds it as a hidden input
    // #tndHdnEmpNumber - same convention as the #EmpNumber hidden-input pattern already
    // used elsewhere in this org. UNCONFIRMED: whether this GET needs a "digest" query
    // param the way other "mvc=1" pages in this codebase do (e.g. functions/
    // employeeleaveapplication uses updateUrlParams+getDigest before fetching
    // AbsenceV9/LeaveHistory/LeaveHistory?mvc=1) - attempted here without one first since
    // GetScheduleCourseDetails/GetAppyCourseConditions/ValidateApplyTraining all work
    // without a digest; add one via BeaconBar.executeFunction("getDigest") if this fails.
    const indexUrl = `${window.origin}/${reqOptions.sl}/TNDV9/ApplyTraining/Index?mvc=1&bs=4&App=000007`;
    const indexHtml = await getText(indexUrl);
    const indexDoc = new DOMParser().parseFromString(indexHtml, "text/html");
    const ownEmpNumber = indexDoc.querySelector("#tndHdnEmpNumber")?.value || "";
    if (!ownEmpNumber) {
      return {
        status: "ERROR",
        message: "Could not resolve the logged-in Admin's own identity token (#tndHdnEmpNumber) from the Nominate for Training page - cannot search for employees without it."
      };
    }

    // Step 3: establish one shared employee-search session for this whole nomination
    // (matches the real "Select Employee" modal: one search session, potentially many
    // employees checked before submitting). Confirmed live from
    // New_PeoplesHR_Feature/adminEmployeeTrainingNomination/GetEmployeeSearch.txt +
    // CommonComponents_Search_Search_empNumber.txt: GetEmployeeSearch returns a
    // freshly-generated "searchToken" embedded in its response script, which is then fed
    // (along with the same ownEmpNumber and a FIXED "callBack" constant baked into the
    // module's own page script - decodes to "129, 3", i.e. elgmodid 129 - not something
    // that varies per request) into CommonComponents/Search/Search, whose response embeds
    // window.advancedModelObj = {EmpNumber, KeyValue} - KeyValue is the session "key" used
    // by every subsequent GetSearchList/SaveSearchResults/GetSelectedEmployees call.
    const CALLBACK_CONST = "MQAyADkALAAgADMA"; // base64(UTF-16LE("129, 3")) - fixed per this module's page script

    const employeeSearchHtml = await (async () => {
      const url = `${window.origin}/${reqOptions.sl}/TNDV9/Common/GetEmployeeSearch`;
      const response = await fetch(url, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          id: "tndNominateEmployeeSearch",
          title: "Select Employee",
          empNumber: ownEmpNumber,
          callback: "TndApplyTrainingAdmin.OnEmployeeSearchSelect",
          searchMode: "2",
          searchQueryMode: "all",
          searchQueryState: "activeonly",
          isDivLoading: "1",
          isMultiple: "1",
          elggrpid: "0",
          param: "0"
        })
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`GetEmployeeSearch failed with HTTP ${response.status}`);
      return text;
    })();

    const searchTokenMatch = /"&searchToken="\s*\+\s*'([^']+)'/.exec(employeeSearchHtml);
    const searchToken = searchTokenMatch ? searchTokenMatch[1] : "";
    if (!searchToken) {
      return {
        status: "ERROR",
        message: "Could not extract a searchToken from GetEmployeeSearch's response - the employee-search session could not be established."
      };
    }

    const searchUrl = `${window.origin}/${reqOptions.sl}/CommonComponents/Search/Search?` +
      new URLSearchParams({
        empNumber: ownEmpNumber,
        callBack: CALLBACK_CONST,
        searchMode: "2",
        searchQueryMode: "all",
        searchQueryState: "activeonly",
        isDivLoading: "1",
        isMultiple: "1",
        searchToken: searchToken,
        _: String(Date.now())
      }).toString();
    const searchHtml = await getText(searchUrl);
    // Same regex functions/getemployeeutils already uses, confirmed live for this exact
    // "window.advancedModelObj" embed pattern.
    const modelMatch = /window\.advancedModelObj\s*=\s*(['"])(.*?)\1;/s.exec(searchHtml);
    if (!modelMatch) {
      return {
        status: "ERROR",
        message: "Could not find window.advancedModelObj in the employee-search response - could not establish a session key."
      };
    }
    let advancedModel;
    try {
      advancedModel = JSON.parse(modelMatch[2]);
    } catch (parseError) {
      return { status: "ERROR", message: "Failed to parse the employee-search session data (advancedModelObj)." };
    }
    const sessionKey = advancedModel.KeyValue;
    if (!sessionKey) {
      return { status: "ERROR", message: "The employee-search session did not return a KeyValue - cannot continue." };
    }
    // CONFIRMED LIVE FIX (2026-09-10): the server ROTATES the opaque employee-identity
    // token as part of establishing the search session - advancedModelObj.EmpNumber (the
    // value returned by this Search call) is NOT the same token as ownEmpNumber (the
    // pre-session token read from #tndHdnEmpNumber on the Index page); a live debug trace
    // showed the two are completely different strings for the same real request. Every
    // downstream call in this session (GetSearchList's own `empNumber` field,
    // SaveSearchResults' `loggedEmpNumber`) must use this ROTATED token, not the original
    // one - confirmed by cross-checking two independently-built, already-live reference
    // implementations of this exact "establish session -> search -> save selection" flow
    // elsewhere in this codebase: functions/benefitapplication (extracts `EmpNumber` from
    // the Search response body via regex and feeds THAT into its own GetSearchList call,
    // never the pre-session token) and functions/getemployeeutils + functions/
    // saveemployeeselectresult (getemployeeutils returns {EmpNumber, KeyValue} from this
    // same Search response and stores it as shared "utils" data; saveemployeeselectresult
    // then sends that stored EmpNumber - not any other token - as SaveSearchResults'
    // `loggedEmpNumber`). Using the stale, pre-rotation ownEmpNumber instead is the most
    // likely reason GetSelectedEmployees kept coming back empty despite SaveSearchResults
    // reporting Status:true - the save was very likely being recorded against a token the
    // session key doesn't recognize as its own logged-in user.
    const rotatedEmpNumber = advancedModel.EmpNumber;
    if (!rotatedEmpNumber) {
      return { status: "ERROR", message: "The employee-search session did not return a rotated EmpNumber - cannot continue." };
    }

    // Step 4: for each named employee, search this session by free text (tblSearchText)
    // and record the single matching row. Confirmed live shape of GetSearchList/
    // SaveSearchResults from New_PeoplesHR_Feature/adminEmployeeTrainingNomination/
    // GetSearchList-page1.txt + SaveSearchResults.txt - UNCONFIRMED: those captures only
    // ever exercised a BLANK tblSearchText (i.e. "All Employees" mode returning all 122
    // rows) - a real free-text search (e.g. a name) has not been captured, though the
    // grid's own "searchPlaceholder": "Search  Employee" strongly implies tblSearchText
    // is exactly the field the visible search box posts to.
    const resolvedRows = [];
    for (const query of employeeQueries) {
      const searchListResult = await postJson("CommonComponents/Search/GetSearchList/", {
        empNumber: rotatedEmpNumber,
        criteriaValues: [],
        key: sessionKey,
        modeId: "2",
        supEmpNumber: null,
        tblPageNo: 1,
        tblSearchText: query,
        sortColumn: "2",
        sortOrder: "asc"
      });
      const rows = (searchListResult && searchListResult.Object && Array.isArray(searchListResult.Object.data))
        ? searchListResult.Object.data
        : [];
      if (rows.length === 0) {
        return {
          status: "NOT_FOUND",
          message: `No employee matching "${query}" was found.`,
          query
        };
      }
      if (rows.length > 1) {
        const totalCount = (searchListResult._pageData && searchListResult._pageData.TotalCount) || rows.length;
        return {
          status: "AMBIGUOUS",
          message: `More than one employee matches "${query}"${totalCount > rows.length ? ` (${totalCount} total, showing first ${rows.length})` : ""}. Please specify using their exact employee number.`,
          query,
          candidates: rows.map((r) => ({ employeeNumber: r.Col1, name: (r.Col2 || "").trim(), dateJoined: r.Col3, activeStatus: r.Col4 }))
        };
      }
      resolvedRows.push({ query, employeeNumber: rows[0].Col1, name: (rows[0].Col2 || "").trim(), dateJoined: rows[0].Col3 });
    }

    // Step 5: mint each resolved employee's opaque per-session "empno" token directly via
    // CommonComponents/Search/GetEmpNumber/, instead of the SaveSearchResults ->
    // GetSelectedEmployees save-then-readback dance. That dance failed live three times in
    // a row (per-row uniqueKey, then a shared uniqueKey, then the rotated loggedEmpNumber
    // fix above) - SaveSearchResults always reported Status:true, but GetSelectedEmployees
    // always came back empty regardless, so the actual missing piece there is still
    // unconfirmed. GetEmpNumber is a genuinely different, simpler, already-live mechanism
    // for the exact same underlying need (turning one resolved row into the encrypted
    // token GetSearchedEmployeeDetails/NomiList require) - confirmed from
    // functions/benefitapplication, a real, already-live function that resolves one
    // employee for a different module via `GET CommonComponents/Search/GetEmpNumber/
    // ?loggedEmpNumber=<rotated token>&empNumber=<plain employee number>&empDisplayName=
    // <name>&empDateJoined=<date>&key=<session key>` -> `{Message: <opaque token>}` - no
    // save/readback session state involved at all. Not yet confirmed live for THIS admin
    // nomination screen specifically (only for the Benefit Application module), but it's a
    // stronger lead than continuing to debug an already-3x-failed mechanism blindly.
    async function resolveOpaqueEmpNumber(row) {
      const url = `${window.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumber/?` +
        new URLSearchParams({
          loggedEmpNumber: rotatedEmpNumber,
          empNumber: row.employeeNumber,
          empDisplayName: row.name,
          empDateJoined: row.dateJoined,
          key: sessionKey,
          _: String(Date.now())
        }).toString();
      const text = await getText(url);
      const parsed = JSON.parse(text);
      return parsed.Message;
    }

    // Confirmed by direct decode of a real GetSearchedEmployeeDetails request's own `Key`
    // field (New_PeoplesHR_Feature/DONE/adminEmployeeTrainingNomination/employee search/
    // GetSearchedEmployeeDetails.txt): it is exactly the session key GUID, UTF-16LE-encoded
    // then base64-encoded (e.g. "8b624e7b-ec09-437d-885e-5e3f89bc75c5" -> the captured
    // "OABiADYAMgA0AGUANwBiAC0A...=" value) - not something that itself requires a network
    // call to obtain, since GetSelectedEmployees' own `Key` field was confirmed to be
    // nothing more than a deterministic re-encoding of the `key` it was queried with.
    function utf16LeBase64(str) {
      let binary = "";
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        binary += String.fromCharCode(code & 0xff, (code >> 8) & 0xff);
      }
      return btoa(binary);
    }
    const encodedSessionKey = utf16LeBase64(sessionKey);

    const searchedEmployeesPayload = [];
    for (const row of resolvedRows) {
      const opaqueEmpNumber = await resolveOpaqueEmpNumber(row);
      if (!opaqueEmpNumber) {
        return {
          status: "ERROR",
          message: `Could not resolve an encrypted identity token for "${row.name}" (${row.employeeNumber}) via GetEmpNumber.`,
          debug_rotatedEmpNumber: rotatedEmpNumber,
          debug_sessionKey: sessionKey,
          debug_row: row
        };
      }
      searchedEmployeesPayload.push({
        Key: encodedSessionKey,
        EmpNumber: opaqueEmpNumber,
        DisNumber: row.employeeNumber,
        DisName: row.name,
        IsExcelFile: 0
      });
    }

    // Step 6: resolve full nomination-ready employee records. Confirmed from
    // GetSearchedEmployeeDetails.txt: request is just an array of {Key, EmpNumber,
    // DisNumber, DisName, IsExcelFile} - no course/schedule identifier involved.
    const searchedData = await postJson("TNDV9/ApplyTraining/GetSearchedEmployeeDetails", searchedEmployeesPayload);
    if (!searchedData || !searchedData.Status || searchedData.Status.IsSuccessfull !== true || !Array.isArray(searchedData.SubList)) {
      return {
        status: "ERROR",
        message: (searchedData && searchedData.Status && searchedData.Status.Message) || "Failed to resolve the given employee(s) for this training.",
        debug_searchedEmployeesPayload: searchedEmployeesPayload,
        debug_searchedDataRaw: searchedData
      };
    }
    if (searchedData.SubList.length === 0) {
      return {
        status: "ERROR",
        message: "None of the given employees could be resolved via GetSearchedEmployeeDetails."
      };
    }

    // Split into those the training system will actually accept (appstatus === 0,
    // mirroring the Supervisor flow's eligibility check) vs. those it flags as
    // ineligible for this schedule (e.g. already applied).
    const eligible = searchedData.SubList.filter((s) => s.appstatus !== 1);
    const ineligible = searchedData.SubList.filter((s) => s.appstatus === 1);

    if (eligible.length === 0) {
      return {
        status: "NOT_ELIGIBLE",
        message: "None of the given employees are eligible to be nominated for this training or they have already been nominated for this training.",
        courseName: courseItem.cosname,
        scheduleId: String(courseItem.schid),
        ineligibleEmployees: ineligible.map((s) => ({ displayempno: s.displayempno, empname: s.empname, reason: s.status }))
      };
    }

    // Step 7: build the final submission payload. Confirmed from the real
    // ValidateApplyTraining/SaveApplyTraining captures for this Admin flow: the outgoing
    // SubList stays as the course's own QA-subject list (courseItem.SubList, e.g.
    // [{coscode, subName}]) - the resolved employees go under NomiList instead, same
    // NomiList/SubList split confirmed on the Supervisor flow. AppType "000007" is
    // confirmed directly from these captures (not inferred by analogy).
    const submissionNomiList = eligible.map((s) => Object.assign({}, s, { selected: 1 }));

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

    const submissionPayload = {
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
      Ojective: objective,
      JobRelavance: relevanceToJob,
      PotentialYou: benefitToEmployee,
      PotentialCompany: benefitToCompany,
      ExpectedLearning: expectedLearning,
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
      NomiList: submissionNomiList,
      AppType: "000007",
      elgcode: courseItem.elgcode,
      Temp: tempSnapshot
    };

    // Step 8: validate before saving - same real server-side safety check confirmed on
    // the Supervisor flow.
    const validation = await postJson("TNDV9/ApplyTraining/ValidateApplyTraining", submissionPayload);
    if (!validation || validation.IsSuccessfull !== true) {
      return {
        status: "VALIDATION_ERROR",
        message: (validation && validation.Message) || "The training system rejected this nomination during validation."
      };
    }

    // Step 9: save - the actual write. Only reached after every check above passed.
    const saveResult = await postJson("TNDV9/ApplyTraining/SaveApplyTraining", submissionPayload);
    if (!saveResult || saveResult.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (saveResult && saveResult.Message) || "Failed to submit the nomination."
      };
    }

    // Confirmed from the real capture: Results[] is keyed by each nominee's displayempno
    // (not the opaque empno token) - same convention as the Supervisor flow.
    const resultsByDisplayNo = {};
    if (Array.isArray(saveResult.Results)) {
      saveResult.Results.forEach((r) => {
        resultsByDisplayNo[r.empno] = r;
      });
    }

    return {
      status: "SUCCESS",
      message: saveResult.Message || "The nomination has been successfully submitted.",
      courseCode: courseItem.coscode,
      courseName: courseItem.cosname,
      scheduleId: String(courseItem.schid),
      nominated: eligible.map((s) => ({
        employeeNumber: s.displayempno,
        name: s.empname,
        submissionStatus: resultsByDisplayNo[s.displayempno] ? resultsByDisplayNo[s.displayempno].status : null
      })),
      skippedIneligible: ineligible.length > 0
        ? ineligible.map((s) => ({ displayempno: s.displayempno, empname: s.empname, reason: s.status }))
        : undefined
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
