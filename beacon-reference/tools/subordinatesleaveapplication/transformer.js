(async function (data, args, reqOptions) {

  /* -------------------------------------------------
   * Access gate - runs before anything else. This is the Team Leave
   * Management screen (AbsenceV9/LeaveApplication/LeaveApplication,
   * isDirectSubbordiante=1) - a different menu entry from the
   * employee's own Leave Application screen.
   * ------------------------------------------------- */
  if (
    !BeaconBar.user?.metaData?.menus?.some(menu =>
      menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isDirectSubbordiante=1")
    )
  ) {
    return { error: true, message: "You do not have access to apply leave for your team. Please contact HR Admin." };
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  /* -------------------------------------------------
   * Date helpers. The on-screen/tool-facing format follows the
   * culture (matching the dateFormat tool), but the wire's *Text
   * fields for this module carry a two-digit year, e.g. "09/09/26" -
   * captured directly off CalculateLeaveDays / GetLeaveClashDetails.
   * ------------------------------------------------- */
  const culture = BeaconBar.user?.metaData?.culture || "en-GB";
  const isUsFormat = culture === "en-US";
  const dateFormatName = isUsFormat ? "MM/DD/YYYY" : "DD/MM/YYYY";

  function parseCultureDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const first = parts[0], second = parts[1];
    let yyyy = parts[2];
    const dd = isUsFormat ? second : first;
    const mm = isUsFormat ? first : second;
    const d = Number(dd), m = Number(mm);
    if (!Number.isFinite(d) || !Number.isFinite(m)) return null;
    if (d < 1 || d > 31 || m < 1 || m > 12) return null;
    // Accept a 2-digit year (as the wire itself uses) as well as 4-digit.
    if (String(yyyy).trim().length === 2) yyyy = `20${String(yyyy).trim()}`;
    if (String(yyyy).trim().length !== 4 || !Number.isFinite(Number(yyyy))) return null;
    return { dd: pad(dd), mm: pad(mm), yyyy: String(yyyy).trim() };
  }

  function formatCultureDate(parsed) {
    return isUsFormat
      ? `${parsed.mm}/${parsed.dd}/${parsed.yyyy}`
      : `${parsed.dd}/${parsed.mm}/${parsed.yyyy}`;
  }

  // Wire format for FromDateText/ToDateText - same field order as the
  // culture, but a two-digit year, exactly as captured off the page.
  function toWireDateText(parsed) {
    const yy = parsed.yyyy.slice(-2);
    return isUsFormat ? `${parsed.mm}/${parsed.dd}/${yy}` : `${parsed.dd}/${parsed.mm}/${yy}`;
  }

  function toDateKey(parsed) {
    return Number(`${parsed.yyyy}${parsed.mm}${parsed.dd}`);
  }

  /* -------------------------------------------------
   * Request helpers - same fail-soft pattern as the other Absence /
   * Attendance tools: never throw, always hand back {ok, status, body}.
   * ------------------------------------------------- */
  const sl = reqOptions.sl;
  const baseUrl = `${location.origin}/${sl}`;
  /* Every captured AbsenceV9/api/LeaveApplication/* request carried the
   * __cfafvalue anti-forgery header. window.csrf is NOT ambient - the
   * BeaconBar "application" / "employeeLeaveApplication" functions set it
   * by parsing #hdbAbsenceV9AFToken off a freshly loaded Absence page, and
   * this tool does the same below. Headers are therefore built per request,
   * not once up front, so they pick up the token after the page load rather
   * than baking in an undefined value. */
  function absenceHeaders() {
    return {
      "accept": "*/*",
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
      "__cfafvalue": window.csrf || ""
    };
  }

  async function safePostJson(url, payload) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: absenceHeaders(),
        body: JSON.stringify(payload),
        redirect: "follow"
      });
      const body = await res.json().catch(function () { return null; });
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      return { ok: false, status: 0, body: null };
    }
  }

  async function safeGetJson(url) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "x-requested-with": "XMLHttpRequest" },
        redirect: "follow"
      });
      const body = await res.json().catch(function () { return null; });
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      return { ok: false, status: 0, body: null };
    }
  }

  async function safeGetText(url) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "x-requested-with": "XMLHttpRequest" },
        redirect: "follow"
      });
      const text = await res.text().catch(function () { return ""; });
      return { ok: res.ok, status: res.status, text };
    } catch (e) {
      return { ok: false, status: 0, text: "" };
    }
  }

  /* -------------------------------------------------
   * Step 1: identify the subordinate.
   * ------------------------------------------------- */
  if (!args || (!args.employeeNumber && !args.employeeName)) {
    return {
      needsInput: true,
      message: "Please tell me which team member you want to apply leave for - their employee number or name.",
      missingFields: ["Employee"]
    };
  }

  /* -------------------------------------------------
   * Step 2: load the Team Leave Application page. The page carries a
   * `model` JSON literal with the logged-in supervisor's own encrypted
   * token (needed as LoginEmpNumber on later calls), and, in a plain
   * <script> block, the hardcoded "search my subordinate" URL used by
   * the toolbar's search icon - a pre-signed URL (own digest) that has
   * to be reused as-is, the same way updateUrlParams' digest has to be.
   * ------------------------------------------------- */
  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")(
    "AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isDirectSubbordiante=1"
  );

  /* getDigest signs the page's own params - the BeaconBar "application" /
   * "employeeLeaveApplication" functions all load Absence pages this way
   * (updateUrlParams for the route, getDigest for the signature), and the
   * route answers with an incomplete page without it. */
  let pageDigest = null;
  try {
    const digestResult = await BeaconBar.executeFunction("getDigest")(updateUrl && updateUrl.updateParams);
    pageDigest = digestResult && digestResult.digest ? digestResult.digest : null;
  } catch (e) {
    pageDigest = null;
  }

  const pagePath = updateUrl && updateUrl.updateUrl
    ? updateUrl.updateUrl
    : "AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isDirectSubbordiante=1";
  const pageUrl = pageDigest
    ? `${baseUrl}/${pagePath}&digest=${pageDigest}&_=${Date.now()}`
    : `${baseUrl}/${pagePath}`;

  const pageResult = await safeGetText(pageUrl);
  const pageHtml = pageResult.text || "";

  /* The anti-forgery token every AbsenceV9 API call needs. Same source and
   * same global the platform's own functions use, so a later tool in the
   * same session finds it already populated. */
  function parseCsrfToken(html) {
    if (!html) return null;
    try {
      const dom = new DOMParser().parseFromString(html, "text/html");
      const el = dom.querySelector("#hdbAbsenceV9AFToken");
      if (el && el.value) return el.value;
    } catch (e) {
      // fall through to the regex below
    }
    const m = html.match(/id="hdbAbsenceV9AFToken"\s+value="([^"]+)"/);
    return m ? m[1] : null;
  }

  const csrfToken = parseCsrfToken(pageHtml);
  if (csrfToken) window.csrf = csrfToken;

  function parseJsStringLiteral(html, varName) {
    if (!html) return null;
    const rx = new RegExp(`var\\s+${varName}\\s*=\\s*'([\\s\\S]*?)';`);
    const m = html.match(rx);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { return null; }
  }

  const pageModel = parseJsStringLiteral(pageHtml, "model") || {};
  const loginEmpNumber = pageModel.LoginEmpNumber || null;

  if (!loginEmpNumber) {
    return {
      error: true,
      message: "Unable to initialize the Team Leave Application page. Please try again.",
      diagnostics: {
        pageUrl,
        httpStatus: pageResult.status,
        htmlLength: pageHtml.length,
        containsModel: pageHtml.includes("var model"),
        looksLikeLoginPage: /login/i.test(pageHtml.slice(0, 500))
      }
    };
  }

  // The toolbar's "search my subordinate" URL - carries its own digest,
  // scoped with searchQueryMode=subordinatesonly. Escaped as &amp; in the
  // markup, same as the page's own SetSearchPopover() unescapes it.
  function extractQuotedUrl(html, mustContain) {
    if (!html) return null;
    const idx = html.indexOf(mustContain);
    if (idx === -1) return null;
    let start = idx;
    while (start > 0 && html[start - 1] !== "'" && html[start - 1] !== '"') start--;
    let end = idx;
    while (end < html.length && html[end] !== "'" && html[end] !== '"') end++;
    return html.slice(start, end).replace(/&amp;/g, "&");
  }

  /* Preferred: the fully-formed, already-signed subordinate search URL the
   * page bakes into SetSearchPopover(). Fallback: rebuild it from the
   * page's own pieces the way the BeaconBar "application" function does -
   * empNumber / searchToken / digest each regex'd out of the markup - so a
   * page whose toolbar markup differs still resolves. searchQueryMode and
   * searchQueryState are the captured values for this screen. */
  function buildSubordinateSearchUrl(html) {
    const embedded = extractQuotedUrl(html, "searchQueryMode=subordinatesonly");
    if (embedded) return { url: embedded, source: "embedded" };

    const empNumberMatch = html.match(/empNumber=([^&"']*)/);
    const searchTokenMatch = html.match(/searchToken=([^&"']*)/);
    const digestMatch = html.match(/digest=([A-Za-z0-9+/=]+)/);
    const elgModIdMatch = html.match(/elgmodid=([^&"']*)/);

    if (!empNumberMatch || !searchTokenMatch) return { url: null, source: "none" };

    const empNumber = decodeURIComponent(empNumberMatch[1]);
    const searchToken = decodeURIComponent(searchTokenMatch[1]);
    const elgModId = elgModIdMatch ? elgModIdMatch[1] : "14";
    const digest = digestMatch ? digestMatch[1] : (pageDigest || "");

    return {
      url: `../CommonComponents/Search/Search?empNumber=${encodeURIComponent(empNumber)}&callBack=MQA0ACwAMgA=&searchMode=2&searchQueryMode=subordinatesonly&searchQueryState=activeonly&isMultiple=0&breadCrumbEnable=0&isDivLoading=1&elgmodid=${elgModId}&searchToken=${encodeURIComponent(searchToken)}&digest=${digest}&_=${Date.now()}`,
      source: "rebuilt"
    };
  }

  const subordinateSearch = buildSubordinateSearchUrl(pageHtml);
  const subordinateSearchUrlRaw = subordinateSearch.url;

  function resolveSearchUrl(rawUrl) {
    if (!rawUrl) return null;
    const path = String(rawUrl).replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
    return `${baseUrl}/${path}`;
  }

  function parseAdvancedModel(html) {
    return parseJsStringLiteral(html, "advancedModelObj");
  }

  function displayNumberOf(r) {
    const text = String(r && r.text || "");
    const sep = text.indexOf(" - ");
    return (sep === -1 ? text : text.slice(0, sep)).trim();
  }
  function displayNameOf(r) {
    const text = String(r && r.text || "");
    const sep = text.indexOf(" - ");
    return (sep === -1 ? text : text.slice(sep + 3)).trim();
  }
  function stripZeros(value) {
    return String(value || "").replace(/^0+/, "").toLowerCase();
  }

  // Rows are normalised to {number, name, dateJoined, text, id?} by the
  // listing helpers below, whichever endpoint they came from.
  function matchEmployee(rows, wantedNumber, wantedName) {
    let matches = [];
    if (wantedNumber) {
      matches = rows.filter(r => r.number.toLowerCase() === wantedNumber);
      if (matches.length === 0) matches = rows.filter(r => stripZeros(r.number) === stripZeros(wantedNumber));
      if (matches.length === 0) matches = rows.filter(r => String(r.id || "").toLowerCase().trim() === wantedNumber);
    }
    if (matches.length === 0 && wantedName) {
      matches = rows.filter(r => r.name.toLowerCase() === wantedName);
      if (matches.length === 0) matches = rows.filter(r => String(r.text || "").toLowerCase().includes(wantedName));
    }
    return matches;
  }

  /* -------------------------------------------------
   * Loads the search widget (subordinate or, later, covering-employee)
   * and resolves a name/number to the encrypted EmpNumber token the
   * Leave Application APIs require. This is the same nonce dance as
   * the manual-in-out tools: the component issues its OWN key/EmpNumber
   * pair on render, and a fabricated pair reads as "nothing found"
   * rather than failing outright, so it must be loaded the way the
   * page loads it.
   * ------------------------------------------------- */
  async function resolveEmployeeToken(searchUrlRaw, wantedNumber, wantedName, label) {
    const searchUrl = resolveSearchUrl(searchUrlRaw);
    if (!searchUrl) {
      return {
        error: true,
        message: `Could not locate the ${label} search widget on the Team Leave Application page. This is a page-parsing problem, not a permissions or reporting-hierarchy problem.`,
        diagnostics: {
          pageUrl,
          pageHttpStatus: pageResult.status,
          htmlLength: pageHtml.length,
          searchUrlSource: subordinateSearch.source,
          pageHasSubordinatesOnly: pageHtml.includes("searchQueryMode=subordinatesonly"),
          pageHasSearchToken: pageHtml.includes("searchToken="),
          gotCsrf: !!window.csrf
        }
      };
    }
    const compResult = await safeGetText(searchUrl);
    const advModel = parseAdvancedModel(compResult.text || "");
    if (!advModel || !advModel.EmpNumber || !advModel.KeyValue) {
      return {
        error: true,
        message: `Unable to initialize the ${label} search. This is a search-widget problem, not a reporting-hierarchy problem.`,
        diagnostics: {
          searchUrl,
          searchUrlSource: subordinateSearch.source,
          httpStatus: compResult.status,
          htmlLength: (compResult.text || "").length,
          foundAdvancedModel: !!advModel
        }
      };
    }
    const componentEmpNumber = advModel.EmpNumber;
    const keyValue = advModel.KeyValue;

    /* Two ways to list candidates. GetSearchList is the one the live
     * employeeDetails tool uses and is preferred: it answers with the grid
     * rows (Col1 number, Col2 name, Col3 date), and Col3 is what
     * GetEmpNumber wants as empDateJoined - the typeahead cannot supply it.
     * GetPaginatedTypeaheadList is kept as a fallback for widgets that only
     * answer that way. */
    async function listViaSearchList(searchText) {
      const result = await safePostJson(`${baseUrl}/CommonComponents/Search/GetSearchList/`, {
        empNumber: componentEmpNumber,
        criteriaValues: [],
        key: keyValue,
        modeId: "2",
        supEmpNumber: null,
        tblPageNo: 1,
        tblSearchText: searchText || "",
        sortColumn: "2",
        sortOrder: "asc"
      });
      const data = result.body && result.body.Object && result.body.Object.data;
      const rows = Array.isArray(data) ? data : [];
      return {
        status: result.status,
        rows: rows.map(r => ({
          number: String(r.Col1 || "").trim(),
          name: String(r.Col2 || "").trim(),
          dateJoined: String(r.Col3 || "").trim(),
          text: `${String(r.Col1 || "").trim()} - ${String(r.Col2 || "").trim()}`
        }))
      };
    }

    async function listViaTypeahead() {
      const result = await safeGetJson(
        `${baseUrl}/CommonComponents/Search/GetPaginatedTypeaheadList/?empNumber=${encodeURIComponent(componentEmpNumber)}&key=${encodeURIComponent(keyValue)}&_=${Date.now()}`
      );
      const rows = (result.body && result.body.results) || [];
      return {
        status: result.status,
        rows: rows.map(r => ({
          number: displayNumberOf(r),
          name: displayNameOf(r),
          dateJoined: "",
          text: String(r.text || ""),
          id: r.id
        }))
      };
    }

    const attempts = [];
    let rows = [];

    // Search by what the user gave, then unfiltered, then the typeahead.
    const searchList = await listViaSearchList(wantedNumber || wantedName);
    attempts.push({ via: "GetSearchList(filtered)", status: searchList.status, rows: searchList.rows.length });
    rows = searchList.rows;

    if (rows.length === 0) {
      const allList = await listViaSearchList("");
      attempts.push({ via: "GetSearchList(all)", status: allList.status, rows: allList.rows.length });
      rows = allList.rows;
    }
    if (rows.length === 0) {
      const typeahead = await listViaTypeahead();
      attempts.push({ via: "GetPaginatedTypeaheadList", status: typeahead.status, rows: typeahead.rows.length });
      rows = typeahead.rows;
    }

    if (rows.length === 0) {
      return {
        error: true,
        message: `The ${label} search returned no one at all. This usually means the search widget did not accept its own session key, not that the employee is missing.`,
        diagnostics: { attempts, searchUrlSource: subordinateSearch.source, gotCsrf: !!window.csrf }
      };
    }

    const matches = matchEmployee(rows, wantedNumber, wantedName);
    if (matches.length === 0) {
      return {
        error: true,
        message: `"${wantedNumber || wantedName}" is not in your list of ${label}s. The search returned ${rows.length} candidate(s) - check the list below and the exact number/name.`,
        candidates: rows.slice(0, 50).map(r => r.text),
        diagnostics: { attempts }
      };
    }
    if (matches.length > 1) {
      return {
        needsInput: true,
        message: `"${wantedNumber || wantedName}" matches more than one ${label}. Please tell me which one.`,
        candidates: matches.map(r => ({ employeeNumber: r.number, employee: r.text }))
      };
    }

    const match = matches[0];
    const plainNumber = match.number;
    const displayName = match.name;

    /* GetEmpNumber's captured signature carries empDateJoined; the live
     * employeeLogKey fetcher fills it from the search grid's third column,
     * so pass that through when the grid supplied it. */
    const tokenResult = await safeGetJson(
      `${baseUrl}/CommonComponents/Search/GetEmpNumber/?loggedEmpNumber=${encodeURIComponent(componentEmpNumber)}&empNumber=${encodeURIComponent(plainNumber)}&empDisplayName=${encodeURIComponent(displayName)}&empDateJoined=${encodeURIComponent(match.dateJoined || "")}&key=${encodeURIComponent(keyValue)}&_=${Date.now()}`
    );
    const token = tokenResult.body && tokenResult.body.Status ? tokenResult.body.Message : null;
    if (!token) {
      return {
        error: true,
        message: `Unable to resolve ${displayName || wantedNumber || wantedName}. Please try again.`,
        diagnostics: { tokenStatus: tokenResult.status, apiMessage: (tokenResult.body && tokenResult.body.Message) || null }
      };
    }

    return { token, plainNumber, displayName };
  }

  const wantedNumber = (args.employeeNumber || "").toLowerCase().trim();
  const wantedName = (args.employeeName || "").toLowerCase().trim();

  const subordinate = await resolveEmployeeToken(subordinateSearchUrlRaw, wantedNumber, wantedName, "team member");
  if (subordinate.error || subordinate.needsInput) return subordinate;

  let empToken = subordinate.token;
  let employeeLabel = subordinate.displayName || subordinate.plainNumber;
  let employeeDisplayNumber = subordinate.plainNumber;
  let employeeDesignation = null;

  /* -------------------------------------------------
   * Step 3: load the selected employee's leave application context -
   * identity, reasons (filtered to ones visible on the supervisor
   * screen), covering-employee setup, notification info.
   * ------------------------------------------------- */
  const leaveDataResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/GetEmployeeLeaveData/`, { EmpNumber: empToken });
  const leaveData = leaveDataResult.body || {};

  if (leaveData.EmployeeData) {
    employeeLabel = leaveData.EmployeeData.EmpDisplayName || employeeLabel;
    employeeDisplayNumber = leaveData.EmployeeData.EmpDisplayNumber || employeeDisplayNumber;
    employeeDesignation = leaveData.EmployeeData.Designation || null;
  }

  const reasonList = Array.isArray(leaveData.ReasonList)
    ? leaveData.ReasonList.filter(r => r.HideSupervisorApplication !== true)
    : [];
  const recentCoveringEmployees = Array.isArray(leaveData.RecentCoveringEmployeeList) ? leaveData.RecentCoveringEmployeeList : [];
  const coveringEmployeeSearchUrlRaw = leaveData.CoveringEmployeeSearchURL || null;

  /* -------------------------------------------------
   * Step 4: leave year and leave type - both entitled-to lists are
   * scoped to this employee, not the supervisor.
   * ------------------------------------------------- */
  const yearsResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/GetEntitledLeaveYears/`, { EmpNumber: empToken });
  const yearList = Array.isArray(yearsResult.body) ? yearsResult.body : [];
  if (yearList.length === 0) {
    return { error: true, message: `No leave years are available for ${employeeLabel}. Please contact HR Admin.` };
  }

  let leaveYear = null;
  if (args.year) {
    const wantedYear = Number(args.year);
    const yearMatch = yearList.find(y => y.YearCode === wantedYear);
    if (!yearMatch) {
      return {
        error: true,
        message: `${args.year} is not an available leave year for ${employeeLabel}.`,
        availableYears: yearList.map(y => y.YearCode)
      };
    }
    leaveYear = yearMatch.YearCode;
  } else {
    const currentYear = new Date().getFullYear();
    const currentMatch = yearList.find(y => y.YearCode === currentYear);
    leaveYear = currentMatch ? currentMatch.YearCode : yearList[0].YearCode;
  }

  const typesResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/GetEntitledLeaveTypes/`, {
    EmpNumber: empToken,
    LeaveYear: leaveYear,
    ApplicationPage: 1
  });
  const leaveTypeList = (Array.isArray(typesResult.body) ? typesResult.body : [])
    .filter(t => t.HideSupervisorApplication !== true);

  if (leaveTypeList.length === 0) {
    return { error: true, message: `${employeeLabel} has no leave types available to apply for in ${leaveYear}. Please contact HR Admin.` };
  }

  function matchLeaveType(wanted) {
    const w = String(wanted || "").toLowerCase().trim();
    if (!w) return null;
    return leaveTypeList.find(t => String(t.TypeName || "").toLowerCase().trim() === w)
      || leaveTypeList.find(t => String(t.TypeCode || "").toLowerCase().trim() === w)
      || leaveTypeList.find(t => String(t.TypeName || "").toLowerCase().includes(w))
      || null;
  }

  function leaveTypeSummary(t) {
    return {
      leaveType: t.TypeName,
      typeCode: t.TypeCode,
      balance: t.Entitlement ? t.Entitlement.BalanceDV : null,
      entitlement: t.Entitlement ? t.Entitlement.EntitlementDV : null,
      allowHalfDay: t.AllowHalfDay === 1,
      coveringEmployeeRequired: t.CoveringEmployeeRequired === 1,
      attachmentRequired: t.IsAttachmentRequired === 1,
      commentMandatory: t.IsCommentMandatory === 1,
      maxDaysInSingleInstance: t.MaxDaysInSingleInstance
    };
  }

  if (!args.leaveType) {
    return {
      needsInput: true,
      message: `Which leave type would you like to apply for ${employeeLabel}? Here are the leave types available for ${leaveYear}, with the current balance.`,
      missingFields: ["Leave Type"],
      current: { employee: employeeLabel, employeeNumber: employeeDisplayNumber, leaveYear },
      leaveTypes: leaveTypeList.map(leaveTypeSummary)
    };
  }

  const leaveType = matchLeaveType(args.leaveType);
  if (!leaveType) {
    return {
      error: true,
      message: `"${args.leaveType}" is not a leave type available for ${employeeLabel} in ${leaveYear}.`,
      leaveTypes: leaveTypeList.map(leaveTypeSummary)
    };
  }

  // Additional fields (extra comment/date/dropdown controls some leave
  // types enable) are not implemented here - flag rather than silently
  // drop them.
  if (leaveType.EnableAdditionalFields === 1 && leaveType.LevTypeAdditionalField) {
    const extra = leaveType.LevTypeAdditionalField;
    const extraLabels = Object.keys(extra)
      .filter(k => k.endsWith("_Label") && extra[k])
      .map(k => extra[k]);
    if (extraLabels.length > 0) {
      return {
        error: true,
        message: `${leaveType.TypeName} requires extra fields (${extraLabels.join(", ")}) that this tool does not support yet. Please apply this leave type from the web UI.`
      };
    }
  }

  if (leaveType.IsAttachmentRequired === 1) {
    return {
      error: true,
      message: `${leaveType.TypeName} requires an attachment, which this tool cannot upload. Please apply this leave type from the web UI.`
    };
  }

  /* -------------------------------------------------
   * Step 5: dates.
   * ------------------------------------------------- */
  if (!args.fromDate) {
    return {
      needsInput: true,
      message: `Please tell me the From Date (${dateFormatName}) for ${employeeLabel}'s ${leaveType.TypeName}. Give a To Date too if it spans more than one day.`,
      missingFields: ["From Date"],
      expectedDateFormat: dateFormatName,
      current: { employee: employeeLabel, leaveType: leaveType.TypeName, leaveYear }
    };
  }

  const parsedFrom = parseCultureDate(args.fromDate);
  if (!parsedFrom) return { error: true, message: `Invalid From Date. Please provide it as ${dateFormatName}.` };
  const parsedTo = args.toDate ? parseCultureDate(args.toDate) : parsedFrom;
  if (args.toDate && !parsedTo) return { error: true, message: `Invalid To Date. Please provide it as ${dateFormatName}.` };
  if (toDateKey(parsedFrom) > toDateKey(parsedTo)) {
    return { error: true, message: `From Date (${formatCultureDate(parsedFrom)}) is after To Date (${formatCultureDate(parsedTo)}).` };
  }

  const fromDateText = toWireDateText(parsedFrom);
  const toDateText = toWireDateText(parsedTo);

  /* -------------------------------------------------
   * Step 6: approver. GetApprovalPerson's own response carries the
   * resolved default directly on EmpNumber/DisplayText - confirmed by
   * the live employeeLeaveApplication tool, which uses approverData
   * .EmpNumber as-is rather than picking out of AppPersonList. Only
   * fall back to AppPersonList when the leave type actually allows
   * choosing a different approver and more than one is offered.
   * ------------------------------------------------- */
  const approvalResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/GetApprovalPerson/`, {
    EmpNumber: empToken,
    LeaveGroup: leaveType.LGCode,
    LeaveYear: leaveYear,
    LeaveType: leaveType.TypeCode,
    ApplicationPage: 1
  });
  const approvalData = approvalResult.body || {};
  const appPersonList = Array.isArray(approvalData.AppPersonList) ? approvalData.AppPersonList : [];

  let approverNumber = approvalData.EmpNumber || null;
  let approverDisplayText = approvalData.DisplayText || null;

  if (args.approverNumber) {
    const approverMatch = appPersonList.find(p => String(p.AppEmpNumber) === String(args.approverNumber));
    if (!approverMatch) {
      return {
        error: true,
        message: `"${args.approverNumber}" is not a valid approver for ${employeeLabel}'s ${leaveType.TypeName}.`,
        availableApprovers: appPersonList.map(p => ({ number: p.AppEmpNumber, name: p.AppDisplayText }))
      };
    }
    approverNumber = approverMatch.AppEmpNumber;
    approverDisplayText = approverMatch.AppDisplayText;
  } else if (!approverNumber && leaveType.AllowSelectApprover === 1 && appPersonList.length > 1) {
    return {
      needsInput: true,
      message: `More than one approver is available for ${employeeLabel}'s ${leaveType.TypeName}. Please tell me which one.`,
      missingFields: ["Approver"],
      availableApprovers: appPersonList.map(p => ({ number: p.AppEmpNumber, name: p.AppDisplayText }))
    };
  } else if (!approverNumber && appPersonList.length > 0) {
    approverNumber = appPersonList[0].AppEmpNumber;
    approverDisplayText = appPersonList[0].AppDisplayText;
  }

  if (!approverNumber) {
    return { error: true, message: `No approver could be resolved for ${employeeLabel}'s ${leaveType.TypeName}. Please contact HR Admin.` };
  }

  /* -------------------------------------------------
   * Step 7: covering employee, only when the leave type requires one.
   * Checks the recently-used list first (no extra network call),
   * then falls back to the same search-and-resolve dance used for the
   * subordinate, scoped by the employee's own CoveringEmployeeSearchURL.
   * ------------------------------------------------- */
  let coveringEmployeeNumber = null;
  if (leaveType.CoveringEmployeeRequired === 1) {
    const wantedCoverNumber = (args.coveringEmployeeNumber || "").toLowerCase().trim();
    const wantedCoverName = (args.coveringEmployeeName || "").toLowerCase().trim();

    if (!wantedCoverNumber && !wantedCoverName) {
      return {
        needsInput: true,
        message: `${leaveType.TypeName} requires a covering employee for ${employeeLabel}. Please pick one, or give a name/number to search.`,
        missingFields: ["Covering Employee"],
        recentCoveringEmployees: recentCoveringEmployees.map(e => ({ number: e.EmpDisplayNumber, name: e.EmpDisplayName }))
      };
    }

    const recentMatch = recentCoveringEmployees.find(e =>
      (wantedCoverNumber && String(e.EmpDisplayNumber || "").toLowerCase().trim() === wantedCoverNumber) ||
      (wantedCoverName && String(e.EmpDisplayName || "").toLowerCase().trim() === wantedCoverName)
    );

    if (recentMatch) {
      coveringEmployeeNumber = recentMatch.EmpDisplayNumber;
    } else {
      const coveringResolved = await resolveEmployeeToken(coveringEmployeeSearchUrlRaw, wantedCoverNumber, wantedCoverName, "covering employee");
      if (coveringResolved.error || coveringResolved.needsInput) return coveringResolved;
      coveringEmployeeNumber = coveringResolved.plainNumber;
    }
  }

  /* -------------------------------------------------
   * Step 8: reason and comment.
   * ------------------------------------------------- */
  let reasonCode = null;
  if (leaveType.ShowLeaveReason === 1 && reasonList.length > 0) {
    if (!args.reason) {
      return {
        needsInput: true,
        message: `Please give a reason for ${employeeLabel}'s ${leaveType.TypeName}.`,
        missingFields: ["Reason"],
        reasons: reasonList.map(r => ({ code: r.ReasonCode, description: decodeURIComponent(r.Description || "").replace(/%20/g, " ") }))
      };
    }
    const wantedReason = String(args.reason).toLowerCase().trim();
    const reasonMatch = reasonList.find(r => decodeURIComponent(r.Description || "").replace(/%20/g, " ").toLowerCase().trim() === wantedReason)
      || reasonList.find(r => String(r.ReasonCode) === String(args.reason));
    if (!reasonMatch) {
      return {
        error: true,
        message: `"${args.reason}" is not a valid reason for ${leaveType.TypeName}.`,
        reasons: reasonList.map(r => ({ code: r.ReasonCode, description: decodeURIComponent(r.Description || "").replace(/%20/g, " ") }))
      };
    }
    reasonCode = reasonMatch.ReasonCode;
  }

  if (leaveType.IsCommentMandatory === 1 && !args.comment) {
    return {
      needsInput: true,
      message: `A comment is required for ${employeeLabel}'s ${leaveType.TypeName}.`,
      missingFields: ["Comment"]
    };
  }

  /* -------------------------------------------------
   * Step 9: let the server compute the day breakdown and validate the
   * range - the same call the page makes as soon as both dates and a
   * leave type are set. BreakdownList/EarnedLeaveList/NotificationList
   * go out empty so the server derives the day-type breakdown itself,
   * same as an untouched new application.
   * ------------------------------------------------- */
  function buildLeavePayload() {
    return {
      EmpNumber: empToken,
      LeaveGroup: leaveType.LGCode,
      LeaveYear: leaveYear,
      LeaveType: leaveType.TypeCode,
      FromDateText: fromDateText,
      ToDateText: toDateText,
      IsAllDaysEditable: true,
      BreakdownList: [],
      EarnedLeaveList: [],
      NotificationList: [],
      MedicalIssueDateText: "",
      Attachment: { AttachmentName: "" },
      Attachments: [],
      Date_1_Text: "",
      Date_2_Text: "",
      Date_3_Text: "",
      Date_4_Text: "",
      Date_5_Text: "",
      ApprovalEmpNumber: approverNumber,
      LoginEmpNumber: loginEmpNumber,
      ApplicationPage: 1,
      ExtraMaternityDays: 0
    };
  }

  const calcResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/CalculateLeaveDays/`, buildLeavePayload());
  const calc = calcResult.body || {};

  if (calc.Status !== true) {
    return {
      error: true,
      message: calc.Message || `Could not calculate leave days for ${employeeLabel}'s ${leaveType.TypeName} on the given dates.`,
      diagnostics: { httpStatus: calcResult.status, fromDateText, toDateText }
    };
  }

  // Clash details are informational, matching the UI's own "Leave
  // Clashes" popover - never block on them.
  const clashResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/GetLeaveClashDetails/`, buildLeavePayload());
  const clashes = Array.isArray(clashResult.body) ? clashResult.body : [];

  const warnings = [];
  if (calc.Warning) warnings.push(calc.Warning);
  if (leaveType.IsMedicalRequired === 1 && calc.IsMedicalDetailsRequired) {
    warnings.push(`${leaveType.TypeName} may require medical details for this duration - these cannot be attached by this tool.`);
  }

  const previewData = {
    employee: employeeLabel,
    employeeNumber: employeeDisplayNumber,
    designation: employeeDesignation,
    leaveType: leaveType.TypeName,
    leaveYear,
    fromDate: formatCultureDate(parsedFrom),
    toDate: formatCultureDate(parsedTo),
    leaveDays: calc.LeaveAmountText,
    balanceBeforeThisApplication: leaveType.Entitlement ? leaveType.Entitlement.BalanceDV : null,
    approver: approverDisplayText || approverNumber,
    coveringEmployee: coveringEmployeeNumber,
    reason: reasonCode ? decodeURIComponent(reasonList.find(r => r.ReasonCode === reasonCode).Description || "").replace(/%20/g, " ") : null,
    comment: args.comment || null,
    leaveClashes: clashes.map(c => ({
      date: c.ClashDate,
      countOnLeave: c.LeaveCount,
      percentageOnLeave: c.LeavePercentage,
      employees: (c.LeaveClashEmployees || []).map(e => e.EmpName)
    })),
    warnings
  };

  /* -------------------------------------------------
   * Step 10: confirm before writing anything.
   * ------------------------------------------------- */
  if (!args.confirmed) {
    return {
      needsConfirmation: true,
      preview: previewData,
      message: warnings.length > 0
        ? `Please review ${employeeLabel}'s leave application below - note the warnings - and confirm before I submit it.`
        : `Please review ${employeeLabel}'s leave application below and confirm before I submit it.`,
      confirmationPrompt: `Are you sure you want to submit this ${leaveType.TypeName} application for ${employeeLabel}? Reply yes to submit, or no to make further changes.`
    };
  }

  /* -------------------------------------------------
   * Step 11: submit via SaveLeaveApplication.
   *
   * This endpoint and payload shape are not from a capture of this
   * screen - they are lifted from the live "employeeLeaveApplication"
   * tool (AbsenceManagement agent), which submits leave the same way
   * for the admin/self "apply for a specific employee" screen. Both
   * screens share the same GetApprovalPerson/CalculateLeaveDays/
   * GetLeaveClashDetails calls this tool already confirmed by capture,
   * so SaveLeaveApplication is treated as the same write for this
   * screen too - EmpNumber is the subject employee (the subordinate,
   * via empToken), while LoginEmpNumber stays the supervisor's own
   * token, matching the EmpNumber/LoginEmpNumber split already
   * confirmed on CalculateLeaveDays and GetLeaveClashDetails.
   *
   * Per-day day-mode (whole/half/off) selection is not supported here
   * (unlike employeeLeaveApplication's dayModes argument) - the
   * BreakdownList/LeaveAmount computed by CalculateLeaveDays above are
   * sent back unmodified. Attachments are refused earlier (leave types
   * requiring one return an error before reaching this point), so
   * Attachment/Attachments are always sent as "no attachment".
   * ------------------------------------------------- */
  const saveResult = await safePostJson(`${baseUrl}/AbsenceV9/api/LeaveApplication/SaveLeaveApplication/`, {
    EmpNumber: empToken,
    ApprovalEmpNumber: approverNumber,
    LeaveGroup: leaveType.LGCode,
    LeaveYear: leaveYear,
    LeaveType: leaveType.TypeCode,
    FromDateText: fromDateText,
    ToDateText: toDateText,
    Comment: (args.comment || "").trim(),
    IsAllDaysEditable: true,
    LeaveAmount: calc.LeaveAmount,
    LeaveAmountToVldt: calc.LeaveAmountToVldt,
    BreakdownList: calc.BreakdownList,
    EarnedLeaveList: [],
    NotificationList: [],
    IsMedicalLeave: false,
    MedicalIssueDateText: "",
    Attachment: { AttachmentName: "-1" },
    Attachments: null,
    Date_1_Text: "",
    Date_2_Text: "",
    Date_3_Text: "",
    Date_4_Text: "",
    Date_5_Text: "",
    CoveringEmpNumber: coveringEmployeeNumber || "",
    LoginEmpNumber: loginEmpNumber,
    ApplicationPage: 1,
    ExtraMaternityDays: 0
  });
  const saveData = saveResult.body || {};

  if (saveData.Status !== true) {
    return {
      error: true,
      message: saveData.Message || `Failed to submit ${leaveType.TypeName} for ${employeeLabel}. Please verify in the UI.`,
      preview: previewData,
      apiResponse: saveData,
      diagnostics: { httpStatus: saveResult.status }
    };
  }

  return {
    success: true,
    message: `${leaveType.TypeName} for ${employeeLabel} (${formatCultureDate(parsedFrom)} - ${formatCultureDate(parsedTo)}) has been submitted for approval.`,
    submitted: previewData,
    apiResponse: saveData
  };
});
