(async function (data, args, reqOptions) {
  try {
    // Defensive: guard every step so a missing/malformed BeaconBar context resolves to
    // a clean NO_ACCESS response instead of an opaque synchronous exception (same
    // pattern as every other drafts/* tool in this build).
    const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
    const hasAccess = Array.isArray(menus) && menus.some((menu) => typeof menu === "string" && menu.includes("TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007"));
    if (!hasAccess) {
      return {
        status: "NO_ACCESS",
        message: "It seems you don't have access. Please check with the HR Admin"
      };
    }

    const employeeQueries = (Array.isArray(args.employees) ? args.employees : [])
      .map((e) => (e !== undefined && e !== null ? String(e).trim() : ""))
      .filter((e) => e);
    const existingNeedName = args.existingNeedName ? String(args.existingNeedName).trim() : "";
    const newNeedName = args.newNeedName ? String(args.newNeedName).trim() : "";
    const newNeedDescription = args.newNeedDescription ? String(args.newNeedDescription).trim() : "";
    const objective = args.objective ? String(args.objective).trim() : "";
    const relevanceToJob = args.relevanceToJob ? String(args.relevanceToJob).trim() : "";
    const benefitToEmployee = args.benefitToEmployee ? String(args.benefitToEmployee).trim() : "";
    const benefitToCompany = args.benefitToCompany ? String(args.benefitToCompany).trim() : "";

    if (employeeQueries.length === 0) {
      return {
        status: "VALIDATION_ERROR",
        message: "employees is required - provide at least one employee's name or employee number, company-wide (no reporting-line restriction)."
      };
    }
    if (!existingNeedName && !newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName (to attach this application to an existing training need - see getAdminTrainingNeeds) or newNeedName (to submit a brand new one), not neither."
      };
    }
    if (existingNeedName && newNeedName) {
      return {
        status: "VALIDATION_ERROR",
        message: "Provide either existingNeedName or newNeedName, not both - the real form's Training Need Type is either 'Existing Need' or 'New Need', never both at once."
      };
    }
    if (!objective) {
      return { status: "VALIDATION_ERROR", message: "objective is required - the training system rejects submissions without it." };
    }
    if (!relevanceToJob) {
      return { status: "VALIDATION_ERROR", message: "relevanceToJob is required - the training system rejects submissions without it." };
    }
    if (!benefitToEmployee) {
      return { status: "VALIDATION_ERROR", message: "benefitToEmployee is required - the training system rejects submissions without it." };
    }
    if (!benefitToCompany) {
      return { status: "VALIDATION_ERROR", message: "benefitToCompany is required - the training system rejects submissions without it." };
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

    // Step 1: fetch the existing-need master list (MainNeed) - confirmed live and
    // identical regardless of persona (same six categories seen for Applicant/
    // Supervisor/Admin captures). Confirmed live from
    // New_PeoplesHR_Feature/getExistingTrainingNeeds/admin/GetTrainingNeedDetails.txt:
    // for the Admin persona (requestType "000007"), SuborList comes back EMPTY - unlike
    // the Supervisor persona, Admin has no pre-loaded roster to pick from at all, which
    // is exactly why this tool (unlike supervisorSubordinateTrainingNeedApplication) has
    // to run the real org-wide "Select Employee" search modal's own network flow below
    // instead of just filtering an already-returned list.
    const detailsData = await postJson("TNDV9/TrainingNeed/GetTrainingNeedDetails", { requestType: "000007", WFMainID: "", PerfEmpNo: "" });
    if (!detailsData || !detailsData.Status || detailsData.Status.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (detailsData && detailsData.Status && detailsData.Status.Message) || "Failed to load the training need application form"
      };
    }
    const mainNeed = Array.isArray(detailsData.MainNeed) ? detailsData.MainNeed : [];

    // Step 2: resolve the Admin's own opaque identity token, the same
    // #tndHdnEmpNumber hidden-input convention confirmed live for the Admin "Nominate
    // for Training" page (adminEmployeeTrainingNomination) - ASSUMED here to be the same
    // shared TND-module partial on the Admin "Add Training Need" page
    // (TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007), since the hidden field is named
    // generically ("tnd..." not "tndApply...") and every other TND module page embeds
    // its own identity the same way. Not yet independently captured for THIS page - if
    // this comes back empty, that's the first thing to re-examine live.
    const indexUrl = `${window.origin}/${reqOptions.sl}/TNDV9/TrainingNeed/Index?mvc=1&bs=4&App=000007`;
    const indexHtml = await getText(indexUrl);
    const indexDoc = new DOMParser().parseFromString(indexHtml, "text/html");
    const ownEmpNumber = indexDoc.querySelector("#tndHdnEmpNumber")?.value || "";
    if (!ownEmpNumber) {
      return {
        status: "ERROR",
        message: "Could not resolve the logged-in Admin's own identity token (#tndHdnEmpNumber) from the Add Training Need page - cannot search for employees without it."
      };
    }

    // Step 3: establish one shared employee-search session for this whole submission
    // (matches the real "Select Employee" modal: one search session, potentially many
    // employees checked before submitting) - same CommonComponents/Search/* shared
    // infrastructure confirmed live end-to-end for adminEmployeeTrainingNomination
    // (a different TND module screen), reused here since GetEmployeeSearch/
    // CommonComponents/Search/Search are shared components, not ApplyTraining-specific.
    // Unlike that confirmed tool, `callBack` is NOT hardcoded here - it is extracted
    // dynamically from this call's own response (same way `searchToken` already is),
    // because the confirmed-live constant "MQAyADkALAAgADMA" (elgmodid 129) was decoded
    // specifically from the ApplyTraining module's own page script and ties to that
    // module's course-eligibility group; the Training Need module has no course/
    // eligibility-group concept at all, so its own GetEmployeeSearch response may well
    // embed a different (or blank) callBack constant - safer to read whatever this
    // module's own response actually says than to reuse a value proven only for a
    // different module. `id`/`callback` below are inert display metadata (they only
    // echo into the returned modal HTML's div id / a client-side JS callback name that
    // this headless flow never invokes) - not something the server uses to shape the
    // search session itself.
    const employeeSearchHtml = await (async () => {
      const url = `${window.origin}/${reqOptions.sl}/TNDV9/Common/GetEmployeeSearch`;
      const response = await fetch(url, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          id: "tndNeedEmployeeSearch",
          title: "Select Employee",
          empNumber: ownEmpNumber,
          callback: "TndTrainingNeedAdmin.OnEmployeeSearchSelect",
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
    const callBackMatch = /"&callBack="\s*\+\s*'([^']+)'/.exec(employeeSearchHtml);
    const callBackConst = callBackMatch ? callBackMatch[1] : "";

    const searchUrl = `${window.origin}/${reqOptions.sl}/CommonComponents/Search/Search?` +
      new URLSearchParams({
        empNumber: ownEmpNumber,
        callBack: callBackConst,
        searchMode: "2",
        searchQueryMode: "all",
        searchQueryState: "activeonly",
        isDivLoading: "1",
        isMultiple: "1",
        searchToken: searchToken,
        _: String(Date.now())
      }).toString();
    const searchHtml = await getText(searchUrl);
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
    // Same server-side token rotation confirmed live for adminEmployeeTrainingNomination -
    // advancedModelObj.EmpNumber is a ROTATED token, distinct from ownEmpNumber. Every
    // downstream call in this session must use this rotated token.
    const rotatedEmpNumber = advancedModel.EmpNumber;
    if (!rotatedEmpNumber) {
      return { status: "ERROR", message: "The employee-search session did not return a rotated EmpNumber - cannot continue." };
    }

    // Step 4: for each named employee, search this session by free text (tblSearchText)
    // and record the single matching row - same confirmed-live mechanism and endpoint
    // (CommonComponents/Search/GetSearchList/) as adminEmployeeTrainingNomination.
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

    // Step 5: mint each resolved employee's opaque per-session "empno" token via
    // CommonComponents/Search/GetEmpNumber/ - same confirmed-live-end-to-end mechanism
    // as adminEmployeeTrainingNomination (that tool's own comments document why this
    // replaced the older SaveSearchResults/GetSelectedEmployees dance). This endpoint is
    // shared CommonComponents infrastructure, not tied to any one TND module.
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

    // Same deterministic Key encoding confirmed by direct decode of a real
    // GetSearchedEmployeeDetails request (see adminEmployeeTrainingNomination) - the
    // session key GUID, UTF-16LE-encoded then base64-encoded.
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

    // Step 6: resolve each employee's full HR record (crucially designame, which
    // GetSearchList's own row never carries). CONFIRMED LIVE (2026-09-10): this endpoint
    // exists at TNDV9/TrainingNeed/GetSearchedEmployeeDetails, following the same
    // per-module-controller convention as every other TrainingNeed action in this build,
    // and the same request shape (an array of {Key, EmpNumber, DisNumber, DisName,
    // IsExcelFile}) as the confirmed-live ApplyTraining sibling. One real difference from
    // that sibling: the resolved records come back under `SuborList`, not `SubList` - the
    // same field name GetTrainingNeedDetails itself uses for its own pre-loaded roster,
    // not the ApplyTraining module's naming. A real single-employee capture (Sophia
    // Lopez/000007) already returns EmpList-ready fields directly - tna_id, raw_id,
    // empno (opaque), displayempno, empname, designame, app_approved, typecode,
    // enrollstatus, appid, schmode, course, SchList, EvalList, selected - so Step 8 below
    // copies these straight from the response instead of fabricating defaults.
    const searchedData = await postJson("TNDV9/TrainingNeed/GetSearchedEmployeeDetails", searchedEmployeesPayload);
    const resolvedList = Array.isArray(searchedData && searchedData.SuborList) ? searchedData.SuborList : null;
    if (!searchedData || !resolvedList) {
      return {
        status: "ERROR",
        message: (searchedData && searchedData.Status && searchedData.Status.Message) || "Failed to resolve the given employee(s)' full HR record via TNDV9/TrainingNeed/GetSearchedEmployeeDetails.",
        debug_searchedEmployeesPayload: searchedEmployeesPayload,
        debug_searchedDataRaw: searchedData
      };
    }
    if (resolvedList.length === 0) {
      return {
        status: "ERROR",
        message: "None of the given employees could be resolved via GetSearchedEmployeeDetails."
      };
    }

    // Step 7: resolve the Training Need Type selection - Existing (typecode 1, a real
    // needcode, blank needname/needdescription) or New (typecode 0, needcode "000000",
    // free-text needname/needdescription) - same mechanism as
    // supervisorSubordinateTrainingNeedApplication.
    let typecode;
    let needcode;
    let needname;
    let needdescription;
    if (existingNeedName) {
      const lowerNeedName = existingNeedName.toLowerCase();
      const needMatches = mainNeed.filter((n) => (n.needname || "").toLowerCase().includes(lowerNeedName));
      if (needMatches.length === 0) {
        return {
          status: "ERROR",
          message: `No existing training need matching "${args.existingNeedName}" was found. Use getAdminTrainingNeeds to see what's currently on file, or pass newNeedName to submit a new one.`
        };
      }
      if (needMatches.length > 1) {
        return {
          status: "AMBIGUOUS",
          message: `More than one existing training need matches "${args.existingNeedName}".`,
          ambiguousField: "existingNeedName",
          candidates: needMatches.map((n) => ({ needCode: n.needcode, needName: n.needname }))
        };
      }
      typecode = 1;
      needcode = needMatches[0].needcode;
      needname = "";
      needdescription = "";
    } else {
      typecode = 0;
      needcode = "000000";
      needname = newNeedName;
      needdescription = newNeedDescription;
    }

    // Step 8: build the outgoing EmpList - confirmed live from
    // New_PeoplesHR_Feature/adminEmployeeTrainingNeedApplication/SaveNeedApplication.txt:
    // unlike the Supervisor flow (which sends its FULL pre-loaded subordinate roster
    // with selected:0/1 flags), the real Admin capture's EmpList holds ONLY the
    // searched-and-selected employee(s), each with selected: 1 - there is no company-wide
    // roster to send "everyone else" from here. Every field below is copied straight from
    // GetSearchedEmployeeDetails' own SuborList entry (confirmed live to already carry
    // exactly this shape - tna_id/raw_id/app_approved/typecode/enrollstatus/appid/
    // schmode/course/SchList/EvalList all came back 0/null/[] for this brand-new record,
    // matching the real SaveNeedApplication capture's own values) - selected is forced to
    // 1 explicitly rather than trusted from the response, since that's what determines
    // inclusion in this submission.
    const empList = resolvedList.map((s) => ({
      tna_id: s.tna_id,
      raw_id: s.raw_id,
      empno: s.empno,
      displayempno: s.displayempno,
      empname: s.empname,
      designame: s.designame || "",
      app_approved: s.app_approved,
      typecode: s.typecode,
      selected: 1,
      enrollstatus: s.enrollstatus,
      appid: s.appid,
      schmode: s.schmode,
      course: s.course,
      SchList: Array.isArray(s.SchList) ? s.SchList : [],
      EvalList: Array.isArray(s.EvalList) ? s.EvalList : []
    }));

    // Step 9: build the submission payload - every fixed field below is confirmed
    // identical to the real captured Admin submission
    // (New_PeoplesHR_Feature/adminEmployeeTrainingNeedApplication/SaveNeedApplication.txt),
    // including reqtypecode "000007" (the Admin marker, matching the App=000007 menu
    // convention) and IsGoalObject/ExistingGoals/SelectedGoalCode staying false/[]/""
    // (confirmed live - goal-linking is not exercised here, same as the Supervisor
    // flow). newneed is always 1 (marks this as a new application RECORD, unrelated to
    // the Existing/New Need Type choice, which is typecode). File attachments are not
    // supported by this tool (Attach stays "0"/no file).
    const payload = {
      tna_id: -1,
      needtype: "",
      typecode: typecode,
      needname: needname,
      needdescription: needdescription,
      status: "Pending",
      appdate: null,
      Strappdate: null,
      objective: objective,
      projectcode: "",
      supcomment: "",
      app_person: "",
      app_approved: 0,
      wfmainid: "",
      wfsequence: 0,
      rejectcomment: "",
      centrecode: "",
      reltojob: relevanceToJob,
      potentialyou: benefitToEmployee,
      potentialcomp: benefitToCompany,
      needcode: needcode,
      reqtypecode: "000007",
      reqtypename: "",
      editable: 1,
      enrollstatus: "",
      appid: 0,
      newneed: 1,
      disableneeds: 0,
      Attach: "0",
      FileNameAttached: "",
      EmpList: empList,
      AttchList: [],
      IsGoalObject: false,
      ExistingGoals: [],
      SelectedGoalCode: ""
    };

    // Step 10: validate, then save - same real validate-then-save convention as every
    // other write tool in this build.
    const validation = await postJson("TNDV9/TrainingNeed/ValidateNeedApplication", payload);
    if (!validation || validation.IsSuccessfull !== true) {
      return {
        status: "VALIDATION_ERROR",
        message: (validation && validation.Message) || "The training need application was rejected during validation."
      };
    }

    const saveResult = await postJson("TNDV9/TrainingNeed/SaveNeedApplication", payload);
    if (!saveResult || saveResult.IsSuccessfull !== true) {
      return {
        status: "ERROR",
        message: (saveResult && saveResult.Message) || "Failed to submit the training need application."
      };
    }

    // Confirmed live: Results[] has one entry per submitted employee, keyed by their own
    // displayempno - same {success, empno, status} shape as every other write tool.
    const results = Array.isArray(saveResult.Results) ? saveResult.Results : [];

    return {
      status: "SUCCESS",
      message: saveResult.Message || "Training need application submitted.",
      needSelectionType: existingNeedName ? "Existing" : "New",
      needCode: needcode,
      needName: existingNeedName ? mainNeed.find((n) => n.needcode === needcode).needname : newNeedName,
      submissions: results.map((r) => ({ employeeNumber: r.empno, success: r.success, status: r.status }))
    };

  } catch (error) {
    const errorMessage = error && error.message ? error.message : String(error);
    return {
      status: "ERROR",
      message: `Failed to submit the training need application: ${errorMessage}`,
      error: errorMessage
    };
  }
})
