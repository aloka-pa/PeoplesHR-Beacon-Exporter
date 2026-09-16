(async function (data, args, reqOptions) {
  /* =====================================================================
   * myTeamBenefitApplication - applies for a benefit on behalf of one of the
   * signed-in supervisor's direct subordinates, via the "Apply Benefit - Team"
   * screen (mode=0). Rebuilt from full network captures; every non-obvious
   * decision below cites the evidence for it.
   *
   * Control types, confirmed by diffing GetApplicationStructure against the
   * matching SaveApplication body:
   *   "2"  numeric        (user-edited)
   *   "3"  dropdown       (user-edited, stores the option Id, not its label)
   *   "4"  yes/no         (user-edited, sent as the strings "1" / "0")
   *   "5"  date           (user-edited)
   *   "7"  read-only info (Department, Entitlement, Utilized Amount)
   *   "VL" computed Total Request - the figure Benefit History records as the
   *        applied amount
   * ===================================================================== */
  const EDITABLE_CTRL_TYPES = ["2", "3", "4", "5"];
  const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";

  const benefitHeaders = new Headers();
  benefitHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  benefitHeaders.append("Content-Type", "application/json; charset=UTF-8");
  benefitHeaders.append("X-Requested-With", "XMLHttpRequest");

  // CommonComponents/Search is a different surface from BenefitV9's own API and
  // takes the jQuery-style accept string - confirmed by capture.
  const commonComponentsHeaders = new Headers();
  commonComponentsHeaders.append("accept", "*/*");
  commonComponentsHeaders.append("content-type", "application/json; charset=UTF-8");
  commonComponentsHeaders.append("x-requested-with", "XMLHttpRequest");

  const base = `${location.origin}/${reqOptions.sl}`;

  /* ---------------------------------------------------------------------
   * Step 0: permission gate, before any request - same idiom as the other
   * MVC-screen tools. The "Apply Benefit - Team" menu entry is
   *   ../Benefitv9/Application/Application/?mode=0&mvc=1&bs=4&digest=...
   * mode=0 is what separates the team screen from the self-service one, so it
   * is part of the match; the per-session digest deliberately is not.
   * ------------------------------------------------------------------- */
  const TEAM_BENEFIT_MENU = "benefitv9/application/application/?mode=0&mvc=1";
  const menus = (typeof BeaconBar !== "undefined" && BeaconBar.user && BeaconBar.user.metaData && BeaconBar.user.metaData.menus) || [];
  const hasAccess = Array.isArray(menus) && menus.some(menu => typeof menu === "string" && menu.toLowerCase().includes(TEAM_BENEFIT_MENU));

  if (!hasAccess) {
    return {
      status: "NO_ACCESS",
      message: "It seems you don't have access to the Apply Benefit - Team screen. Please check with the HR Admin."
    };
  }

  /* ---------------------------------------------------------------------
   * Generic helpers
   * ------------------------------------------------------------------- */
  async function readJson(response, label) {
    const text = await response.text();
    try {
      return { data: JSON.parse(text) };
    } catch (e) {
      return { error: `${label} did not return usable data (HTTP ${response.status}). First 300 chars: ${text.slice(0, 300) || "(empty response)"}` };
    }
  }

  async function postJson(url, body, label) {
    const res = await fetch(url, {
      method: "POST",
      headers: benefitHeaders,
      body: JSON.stringify(body),
      redirect: "follow"
    });
    return readJson(res, label);
  }

  // Short stable fingerprint, used to bind a preview to the submit that follows.
  function digestOf(value) {
    const text = JSON.stringify(value);
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function numberOf(value) {
    const num = parseFloat(String(value == null ? "" : value).replace(/,/g, ""));
    return isNaN(num) ? null : num;
  }

  /* ---------------------------------------------------------------------
   * Step 1: bootstrap the team page and scrape window.BenefitApplicationObj.
   * Its SearchModalHeader ("Apply Benefit for Team") and SearchQueryMode
   * ("subordinatesonly") confirm this is the supervisor entry point.
   * updateUrlParams reads the same menu entry checked above, this time for its
   * live digest, which cannot be constructed locally.
   * ------------------------------------------------------------------- */
  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("Benefitv9/Application/Application/?mode=0&mvc=1");
  if (!updateUrl || !updateUrl.updateUrl) {
    return "Could not resolve the Apply Benefit - Team screen from your menu. Please try again, or check with the HR Admin.";
  }

  const pageDigest = await BeaconBar.executeFunction("getDigest")(updateUrl.updateParams);
  const pageUrl = `${base}/${updateUrl.updateUrl}&digest=${pageDigest.digest}`;

  const pageRes = await fetch(pageUrl, {
    method: "GET",
    headers: { "accept": "*/*", "accept-language": "en-US,en;q=0.9" },
    redirect: "follow"
  });
  const pageHtml = await pageRes.text();

  const blobMatch = pageHtml.match(/window\.BenefitApplicationObj\s*=\s*'([\s\S]*?)';/);
  let blob = null;
  if (blobMatch) {
    try { blob = JSON.parse(blobMatch[1]); } catch (e) { blob = null; }
  }

  if (!blob || !blob.LogEmpNumber || !blob.KeyValue) {
    return `Could not initialize the Team Benefit Application page (HTTP ${pageRes.status}) - please try again.`;
  }

  // The tenant's own date format, straight off the screen (window.$MomentDateFormat
  // = 'DD/MM/YYYY' in the capture). Assuming DD/MM/YYYY would silently accept
  // 09/16/2026 and post it as 9 September in a DD/MM tenant.
  const formatMatch = pageHtml.match(/window\.\$MomentDateFormat\s*=\s*'([^']+)'/);
  const dateFormat = (formatMatch && formatMatch[1]) || DEFAULT_DATE_FORMAT;
  const dateRegex = new RegExp("^" + dateFormat
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/DD/g, "\\d{2}")
    .replace(/MM/g, "\\d{2}")
    .replace(/YYYY/g, "\\d{4}") + "$");

  function todayFormatted() {
    const d = new Date();
    const pad = n => String(n).padStart(2, "0");
    return dateFormat
      .replace(/DD/g, pad(d.getDate()))
      .replace(/MM/g, pad(d.getMonth() + 1))
      .replace(/YYYY/g, String(d.getFullYear()));
  }

  /* ---------------------------------------------------------------------
   * Step 2: the subordinate-search widget issues its OWN EmpNumber/KeyValue
   * pair on render - NOT BenefitApplicationObj's (capture: widget key
   * "14174933-...", page key "5d6a2fe4-..."), the same gotcha documented in
   * subordinatesLeaveapplication for the Absence module.
   * ------------------------------------------------------------------- */
  function onlyEscapeEquals(s) {
    return String(s || "").replace(/=/g, "%3D");
  }

  const searchParams = `empNumber=${onlyEscapeEquals(blob.LogEmpNumber)}&callBack=${blob.CallBackMethod}&searchMode=0&searchQueryMode=subordinatesonly&searchQueryState=activeonly&breadCrumbEnable=0&isDivLoading=1&isShowDisplayName=0&divId=searchBenDiv2&searchToken=${blob.searchToken}`;
  const searchDigest = await BeaconBar.executeFunction("getDigest")(searchParams);
  const searchUrl = `${base}/CommonComponents/Search/Search?${searchParams}&digest=${searchDigest.digest}&_=${Date.now()}`;

  const searchRes = await fetch(searchUrl, {
    method: "GET",
    headers: { "accept": "text/html, */*; q=0.01", "x-requested-with": "XMLHttpRequest" },
    redirect: "follow"
  });
  const searchHtml = await searchRes.text();
  const smartMatch = searchHtml.match(/window\.smartSearchModelObj\s*=\s*'([\s\S]*?)';/);
  let smartModel = null;
  if (smartMatch) {
    try { smartModel = JSON.parse(smartMatch[1]); } catch (e) { smartModel = null; }
  }

  if (!smartModel || !smartModel.EmpNumber || !smartModel.KeyValue) {
    return `Could not initialize the team search widget (HTTP ${searchRes.status}) - please try again.`;
  }

  /* ---------------------------------------------------------------------
   * Step 3: the supervisor's direct subordinates. Scoping employee resolution
   * to this list is what enforces "subordinates only" - anyone else never
   * resolves, by construction.
   * ------------------------------------------------------------------- */
  const subordinatesRes = await fetch(`${base}/CommonComponents/Search/GetSubordinatesByEmpNumber/`, {
    method: "POST",
    headers: commonComponentsHeaders,
    body: JSON.stringify({ empNumber: smartModel.EmpNumber, key: smartModel.KeyValue }),
    redirect: "follow"
  });
  const subordinatesResult = await readJson(subordinatesRes, "GetSubordinatesByEmpNumber");
  if (subordinatesResult.error) return subordinatesResult.error;

  const team = (subordinatesResult.data || []).map(s => ({
    empNumber: s.EmpNumber,
    displayNumber: (s.EmpDisplayNumber || "").trim(),
    displayName: (s.EmpDisplayName || "").trim()
  }));

  if (team.length === 0) {
    return "You have no direct subordinates to apply a benefit for. To apply for yourself, use selfEmployeeBenefitApllication instead.";
  }

  const teamList = team.map(t => ({ employeeNumber: t.displayNumber, employee: t.displayName }));

  /* ---------------------------------------------------------------------
   * Step 4: identify the team member - only ever against the list above.
   * Name matching is word-based, not a raw substring: "includes" would resolve
   * "Liam" to "William Brown".
   * ------------------------------------------------------------------- */
  const wantedNumber = (args.employeeNumber || "").toLowerCase().trim();
  const wantedName = (args.employeeName || "").toLowerCase().trim();

  function matchByName(name) {
    const exact = team.filter(t => t.displayName.toLowerCase() === name);
    if (exact.length > 0) return exact;

    const wantedParts = name.split(/\s+/).filter(Boolean);
    const byWord = team.filter(t => {
      const parts = t.displayName.toLowerCase().split(/\s+/).filter(Boolean);
      return wantedParts.every(w => parts.some(p => p.startsWith(w)));
    });
    if (byWord.length > 0) return byWord;

    return team.filter(t => t.displayName.toLowerCase().includes(name));
  }

  let matches;
  if (!wantedNumber && !wantedName) {
    matches = team.length === 1 ? [team[0]] : null;
  } else {
    matches = [];
    if (wantedNumber) matches = team.filter(t => t.displayNumber.toLowerCase() === wantedNumber);
    if (matches.length === 0 && wantedName) matches = matchByName(wantedName);
  }

  if (matches === null) {
    return {
      needsInput: true,
      message: "Which team member is this benefit application for? Show the user the team below and ask them to pick one - ask for a name, never for an employee number or employee ID. (For the user's own application, use selfEmployeeBenefitApllication instead.)",
      teamMembers: teamList
    };
  }
  if (matches.length === 0) {
    return {
      error: true,
      message: `There is no "${args.employeeNumber || args.employeeName}" in your team, so a benefit application cannot be submitted for them. You can only apply on behalf of your own direct subordinates, listed below. Show the user this list - do not look the name up with any other employee-search tool.`,
      teamMembers: teamList
    };
  }
  if (matches.length > 1) {
    return {
      needsInput: true,
      message: `More than one of your subordinates matches "${args.employeeNumber || args.employeeName}". Ask the user which one they mean, showing ONLY the candidates below - these are the matching members of this supervisor's own team, and they are the only people this application can be for.`,
      candidates: matches.map(t => ({ employeeNumber: t.displayNumber, employee: t.displayName }))
    };
  }

  const employee = matches[0];

  /* ---------------------------------------------------------------------
   * Step 5: a fresh application-session key. Confirmed by capture: the key
   * used for the subordinate's application appears in NO server response
   * anywhere - the client mints it when the employee is switched, and the
   * server uses it as that application's cache slot. Minting our own matches
   * the UI and keeps this application isolated from the supervisor's own
   * self-load state (what blob.KeyValue is bound to).
   * ------------------------------------------------------------------- */
  const sessionKey = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });

  /* ---------------------------------------------------------------------
   * Step 6: this employee's own available benefit types. The request carries
   * the subordinate's token from the subordinates list; the response's
   * Employee.EmpNumber is a DIFFERENT re-encryption of the same person, and
   * every later call uses that one.
   * ------------------------------------------------------------------- */
  const byEmployeeResult = await postJson(
    `${base}/BenefitV9/api/ApplicationApi/GetApplicationByEmployee`,
    { empNumber: employee.empNumber, key: sessionKey, type: 0, mode: "0" },
    "GetApplicationByEmployee"
  );
  if (byEmployeeResult.error) return byEmployeeResult.error;

  const byEmployee = byEmployeeResult.data || {};
  const benefitTypes = byEmployee.benefitTypes || [];
  const appEmpNumber = (byEmployee.Employee && byEmployee.Employee.EmpNumber) || employee.empNumber;
  const employeeDetails = byEmployee.Employee || {};

  if (benefitTypes.length === 0) {
    return `${employee.displayName} has no benefit types available to apply for. Please check the benefit setup with HR Admin.`;
  }

  const availableTypes = benefitTypes.map(b => b.BetName);

  if (!args.benefitType) {
    return {
      needsInput: true,
      message: `${employee.displayName} (${employee.displayNumber}) is identified - do not ask the user for an employee number. Show the user the availableBenefitTypes list below exactly as it is and ask which one to apply for. These are the only types ${employee.displayName} can apply for; never offer benefit types from general knowledge.`,
      employee: employee.displayName,
      employeeNumber: employee.displayNumber,
      availableBenefitTypes: availableTypes
    };
  }

  /* ---------------------------------------------------------------------
   * Step 7: resolve the benefit type. An ambiguous partial name asks rather
   * than silently taking the first match - each call re-resolves from scratch,
   * so a silent pick could differ between the preview and the submit.
   * ------------------------------------------------------------------- */
  const wantedType = args.benefitType.toLowerCase().trim();
  const exactType = benefitTypes.filter(b => b.BetName.toLowerCase() === wantedType);
  const partialTypes = benefitTypes.filter(b => b.BetName.toLowerCase().includes(wantedType));
  const typeCandidates = exactType.length > 0 ? exactType : partialTypes;

  if (typeCandidates.length === 0) {
    return {
      error: true,
      message: `"${args.benefitType}" is not a benefit type ${employee.displayName} can apply for. Tell the user that, then show them the availableBenefitTypes list below exactly as it is and ask which one they meant - do not suggest any type that is not on it.`,
      employee: employee.displayName,
      employeeNumber: employee.displayNumber,
      availableBenefitTypes: availableTypes
    };
  }
  if (typeCandidates.length > 1) {
    return {
      needsInput: true,
      message: `"${args.benefitType}" matches more than one of ${employee.displayName}'s benefit types. Ask the user which one they mean, using the exact names below.`,
      employee: employee.displayName,
      candidates: typeCandidates.map(b => b.BetName)
    };
  }

  const typeMatch = typeCandidates[0];

  /* ---------------------------------------------------------------------
   * Step 8: the application structure for this employee + benefit type.
   * ------------------------------------------------------------------- */
  const structureResult = await postJson(
    `${base}/BenefitV9/api/ApplicationApi/GetApplicationStructure/`,
    {
      betCode: typeMatch.BetCode,
      empNumber: appEmpNumber,
      visibilityState: blob.VisibilityState || "1",
      isWorkflow: blob.IsWorkflow || "0",
      appId: blob.AppId,
      wfMainId: blob.WfMainId || null,
      cancelWfMainId: blob.CancelWfMainId || null,
      keyValue: sessionKey,
      BetAppYear: blob.BetAppYear
    },
    "GetApplicationStructure"
  );
  if (structureResult.error) return structureResult.error;

  const structure = structureResult.data;
  if (!structure || !structure.applicationRowVms) {
    return `Could not load the "${typeMatch.BetName}" application form for ${employee.displayName}. Please try again, or use the Benefit Management screen directly.`;
  }

  const betInfo = structure.currentBenefitType || {};

  if (betInfo.BetAttachmentMandatoryFlg === 1 || betInfo.BetAttachmentMandatoryFlg === "1") {
    return `The "${typeMatch.BetName}" benefit type requires a file attachment, which this tool cannot upload. Please use the Benefit Management screen directly for this benefit type.`;
  }

  /* ---------------------------------------------------------------------
   * Step 9: flatten. `ref` points back into `structure` itself, so every edit
   * lands in the same tree that is resent to GetDependentControlValues,
   * ValidateGridControl and SaveApplication.
   * ------------------------------------------------------------------- */
  function describeField(ctrl) {
    return {
      besId: ctrl.BesId,
      displayName: ctrl.BesDisplayName,
      mandatory: ctrl.BesIsMandatory === "mandatory",
      dataType: ctrl.BesDataType,
      ctrlType: ctrl.BesCtrlType,
      decimals: ctrl.BesDecimalCount || 0,
      ref: ctrl
    };
  }

  const fields = [];
  const infoControls = [];
  let totalControl = null;
  let gridControl = null;

  (structure.applicationRowVms || []).forEach(row => {
    (row.ApplicationStructureRowVms || []).forEach(ctrl => {
      if (ctrl.IsGridDef) {
        gridControl = ctrl;
        return;
      }
      // Total Request carries no BesDisplayName of its own; its label,
      // visibility and editability come from the structure's top-level
      // TotalRequestLabelName / TotalRequestVisible / TotalRequestEnable.
      if (ctrl.BesCtrlType === "VL") {
        totalControl = ctrl;
        return;
      }
      if (ctrl.IsVisible === false) return;
      if (EDITABLE_CTRL_TYPES.includes(ctrl.BesCtrlType) && ctrl.BesDisplayName && ctrl.IsEnable !== false) {
        fields.push(describeField(ctrl));
      } else if (ctrl.BesCtrlType === "7") {
        infoControls.push(ctrl);
      }
    });
  });

  const totalLabel = structure.TotalRequestLabelName || "Total Request";
  const totalVisible = !!totalControl && structure.TotalRequestVisible !== false;
  const totalEditable = totalVisible && structure.TotalRequestEnable === true;

  // Two controls sharing a display name would both take the same fieldValues
  // entry and silently double the computed total.
  const duplicateNames = fields
    .map(f => f.displayName.toLowerCase())
    .filter((n, i, all) => all.indexOf(n) !== i);
  if (duplicateNames.length > 0) {
    return `The "${typeMatch.BetName}" benefit type has more than one field called "${fields.find(f => f.displayName.toLowerCase() === duplicateNames[0]).displayName}", which this tool cannot tell apart. Please use the Benefit Management screen directly for this benefit type.`;
  }

  /* ---------------------------------------------------------------------
   * Step 10: recalculation. Confirmed by capture: straight after
   * GetApplicationStructure, Entitlement and Utilized Amount are "0.00"; only
   * once a changed field is posted to GetDependentControlValues does the
   * server answer with the real figures (15000.00 / 585.00 for Fuel
   * Reimbursement), and only then does the computed total update. They are
   * date-dependent: the same employee and type returned 435.00 utilized for
   * 17/09/2026 and 585.00 for 16/09/2026.
   *
   * The response is a FLAT array of {BesId, RefValue, RefObjectValue,
   * RefDisplayValue} merged back by BesId. The doubled slash in
   * "BenefitV9//api/..." is exactly what the UI sends.
   * ------------------------------------------------------------------- */
  const allControls = (structure.applicationRowVms || [])
    .flatMap(row => row.ApplicationStructureRowVms || []);

  // The value each control arrived with. The UI posts this as BaseValue on
  // every control (Entitlement goes out as RefValue "15000.00" with BaseValue
  // "0.00"; the date as RefValue "16/09/2026" with BaseValue null), so it is
  // the ORIGINAL structure value, not the previous call's.
  const baseValues = new Map(allControls.map(c => [c.BesId, c.RefValue]));

  let refreshFailed = null;

  function wireRow(ctrl, columnIndex) {
    const copy = Object.assign({}, ctrl);
    // The UI drops BesJavascript and never sends nulls for these four.
    delete copy.BesJavascript;
    copy.BaseValue = baseValues.has(ctrl.BesId) ? baseValues.get(ctrl.BesId) : null;
    copy.RefMultiValue = ctrl.RefMultiValue || [];
    copy.BesEmpElgParam = ctrl.BesEmpElgParam || [];
    copy.ApplicationGridDefVm = ctrl.ApplicationGridDefVm || {
      ApplicationGridRowVms: [],
      GridData: { RowItems: [] }
    };
    copy.divClass = ctrl.divClass || (columnIndex % 2 === 1 ? "bmLeftDiv" : "bmRightDiv");
    return copy;
  }

  function wiredRows() {
    return (structure.applicationRowVms || []).map(row => ({
      RowNum: row.RowNum,
      ApplicationStructureRowVms: (row.ApplicationStructureRowVms || [])
        .map(ctrl => wireRow(ctrl, ctrl.ColumnCount || 1))
    }));
  }

  function mergeFlatValues(list, controls) {
    list.forEach(updated => {
      const target = controls.find(c => c.BesId === updated.BesId);
      if (!target) return;
      target.RefValue = updated.RefValue;
      if (updated.RefDisplayValue !== null && updated.RefDisplayValue !== undefined) {
        target.RefDisplayValue = updated.RefDisplayValue;
      }
      // Never let a null wipe a populated option list - a dependent dropdown
      // (e.g. Designation, empty until Corporate title is chosen) is filled
      // only on the call that actually resolves it.
      if (updated.RefObjectValue) target.RefObjectValue = updated.RefObjectValue;
    });
  }

  async function refreshDependents(changedBesId, controlsToMerge) {
    const depResult = await postJson(
      `${base}/BenefitV9//api/ApplicationApi/GetDependentControlValues/`,
      {
        ApplicationRowVms: wiredRows(),
        CurrentBenefitStructId: changedBesId,
        CurrentEmployeeNumber: appEmpNumber,
        CurrentBenefitTypeCode: typeMatch.BetCode,
        VisibilityState: blob.VisibilityState || "1",
        ReadOnlyState: blob.ReadOnlyState || "0",
        StepId: blob.StepId || "0",
        AppId: blob.AppId,
        WfMainId: blob.WfMainId || null,
        CancelWfMainId: blob.CancelWfMainId || null,
        IsWorkflow: blob.IsWorkflow || "0",
        IsSummary: blob.IsSummary || "0",
        BetAppYear: blob.BetAppYear
      },
      "GetDependentControlValues"
    );

    // A failed recalculation is NOT survivable: entitlement would stay 0.00 and
    // the computed total would stay 0, which is exactly how application 161 was
    // filed with an applied amount of 0.00. Record it and block submission.
    if (depResult.error || !Array.isArray(depResult.data)) {
      refreshFailed = depResult.error || "GetDependentControlValues returned an unexpected response.";
      return false;
    }

    mergeFlatValues(depResult.data, controlsToMerge || allControls);
    return true;
  }

  // Values we put in, so a recalculation that drops or rewrites one is caught
  // rather than silently submitted.
  const intended = new Map();

  function sameValue(ctrlType, a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (ctrlType === "2") {
      const na = numberOf(a), nb = numberOf(b);
      return na !== null && nb !== null && na === nb;
    }
    return String(a).trim() === String(b).trim();
  }

  async function assertIntactAfterRefresh() {
    for (const [besId, expected] of intended.entries()) {
      const ctrl = allControls.find(c => c.BesId === besId);
      if (!ctrl) continue;
      if (sameValue(ctrl.BesCtrlType, ctrl.RefValue, expected)) continue;

      // Re-assert once - then treat a second disagreement as the server
      // rejecting the value, and refuse rather than submit something else.
      ctrl.RefValue = expected;
      await refreshDependents(besId);
      if (refreshFailed) return `"${ctrl.BesDisplayName}" could not be set: ${refreshFailed}`;
      if (!sameValue(ctrl.BesCtrlType, ctrl.RefValue, expected)) {
        return `PeoplesHR would not accept "${expected}" for "${ctrl.BesDisplayName}" - it came back as "${ctrl.RefValue}". Check that value with the supervisor before submitting.`;
      }
    }
    return null;
  }

  // For a grid benefit type the read-only figures (Entitlement, Utilized
  // Amount, Department) live on the grid's own row, not on the outer form -
  // the outer form holds only the computed total and the grid itself.
  function readOnlyControls() {
    if (gridControl && workingRowControls.length > 0) {
      return workingRowControls.filter(c => c.BesCtrlType === "7" && c.BesDisplayName);
    }
    return infoControls;
  }

  function infoSnapshot() {
    return readOnlyControls()
      .filter(c => c.BesDisplayName)
      .map(c => ({ displayName: c.BesDisplayName, value: c.RefDisplayValue || c.RefValue }));
  }

  function numericInfo(pattern) {
    const hit = readOnlyControls().find(c => c.BesDisplayName && pattern.test(c.BesDisplayName));
    if (!hit) return null;
    return numberOf(hit.RefValue != null ? hit.RefValue : hit.RefDisplayValue);
  }

  function entitlementSummary() {
    const entitlement = numericInfo(/entitle/i);
    const utilized = numericInfo(/utili[sz]/i);

    if (entitlement === null && utilized === null) {
      // Label-independent fallback: on a renamed or localized screen, the
      // read-only numeric controls whose value changed after the date
      // recalculation are the entitlement figures.
      const changed = readOnlyControls()
        .filter(c => c.BesDataType === "NUMERIC" && !sameValue("2", c.RefValue, baseValues.get(c.BesId)))
        .map(c => ({ displayName: c.BesDisplayName, value: numberOf(c.RefValue) }));
      return changed.length ? { unlabelled: changed } : null;
    }

    const summary = { entitlement, utilized };
    if (entitlement !== null && utilized !== null) summary.balance = +(entitlement - utilized).toFixed(2);
    return summary;
  }

  // Total Request carries a stale RefDisplayValue ("0.00" while RefValue is
  // "200" - straight from the capture), so RefValue is the only figure to trust.
  function totalRequested() {
    return totalControl ? numberOf(totalControl.RefValue) : null;
  }

  /* ---------------------------------------------------------------------
   * Grid benefit types (e.g. Telephone Bill Reimbursement). The outer form
   * holds only the computed total plus one IsGridDef control, whose
   * ApplicationGridDefVm carries the column definitions (GridStructureVms),
   * the working row (ApplicationGridRowVms) and the added rows
   * (GridData.RowItems).
   * ------------------------------------------------------------------- */
  const gridVm = gridControl ? (gridControl.ApplicationGridDefVm || {}) : null;
  const gridColumns = gridVm ? (gridVm.GridStructureVms || []) : [];
  const gridEditable = gridColumns
    .filter(c => EDITABLE_CTRL_TYPES.includes(c.BesCtrlType) && c.BesDisplayName && c.IsVisible !== false && c.IsEnable !== false)
    .map(describeField);

  const workingRowControls = gridVm
    ? (gridVm.ApplicationGridRowVms || []).flatMap(r => r.ApplicationStructureRowVms || [])
    : [];

  function workingControl(besId) {
    return workingRowControls.find(c => c.BesId === besId);
  }

  if (gridVm && !gridVm.GridData) gridVm.GridData = { RowItems: [] };
  if (gridVm && !Array.isArray(gridVm.GridData.RowItems)) gridVm.GridData.RowItems = [];

  // The grid's own controls carry values the outer form never sees, so they
  // need BaseValue tracking too (used to spot which read-only figures the
  // recalculation actually filled in).
  workingRowControls.forEach(c => {
    if (!baseValues.has(c.BesId)) baseValues.set(c.BesId, c.RefValue);
  });

  // Column order and shape confirmed from both the ValidateGridControl request
  // and the saved grid application (reference 170): every column, read-only
  // ones included, with Code and Value carrying the same string. CurrencyValue
  // is the UI's own display string - it really does send "undefined <value>"
  // when the column has no currency symbol, and that submitted successfully.
  function columnItemsFromWorkingRow() {
    return gridColumns.map(col => {
      const live = workingControl(col.BesId) || col;
      const value = live.RefValue;
      return {
        BesId: col.BesId,
        BesCtrlType: col.BesCtrlType,
        Code: value,
        Value: value,
        CurrencyValue: `${live.BesCurrencySymbol} ${value}`
      };
    });
  }

  async function validateGridRow(rowId) {
    const result = await postJson(
      `${base}/BenefitV9//api/ApplicationApi/ValidateGridControl/`,
      {
        GridData: gridVm.GridData,
        GridColumn: { RowId: rowId, IsEdit: false, ColumnItems: columnItemsFromWorkingRow() },
        GridDef: gridVm.GridDef,
        GridState: gridVm.GridState,
        StepId: blob.StepId || "0",
        AppId: blob.AppId,
        WfMainId: blob.WfMainId || null,
        ApplicationRowVms: wiredRows(),
        CurrentEmployeeNumber: appEmpNumber,
        CurrentBenefitTypeCode: typeMatch.BetCode,
        VisibilityState: blob.VisibilityState || "1",
        ReadOnlyState: blob.ReadOnlyState || "0",
        IsEditGrid: false,
        IsWorkflow: blob.IsWorkflow || "0",
        IsSummary: blob.IsSummary || "0",
        KeyValue: sessionKey,
        BetAppYear: blob.BetAppYear
      },
      "ValidateGridControl"
    );
    if (result.error) return { ok: false, message: result.error };

    // Confirmed envelope: {Message, Type, Title, Status, Object, ByteArray},
    // Status true with Object [] for a valid row.
    const body = result.data || {};
    if (body.Status !== true) {
      return { ok: false, message: body.Message || "PeoplesHR rejected this row." };
    }
    return { ok: true };
  }

  /* ---------------------------------------------------------------------
   * Value application, shared by the outer form and by each grid row.
   * ------------------------------------------------------------------- */
  function normalizeValue(field, value) {
    if (field.ctrlType === "3") {
      const options = field.ref.RefObjectValue || [];
      if (options.length === 0) return { defer: true };
      const opt = options.find(o => String(o.Value).toLowerCase() === String(value).toLowerCase());
      if (!opt) {
        return { error: `"${value}" is not a valid option for "${field.displayName}". Valid options: ${options.map(o => o.Value).join(", ")}` };
      }
      // Dropdowns store the option's Id, never its label - confirmed by capture
      // (Corporate title sent as "000005", shown as "QA-Lead").
      return { value: opt.Id };
    }

    if (field.ctrlType === "5") {
      if (!dateRegex.test(String(value))) {
        return { error: `"${field.displayName}" must be a date in ${dateFormat} format (e.g. ${todayFormatted()}) - got "${value}".` };
      }
      return { value: String(value) };
    }

    if (field.ctrlType === "4") {
      const text = String(value).toLowerCase().trim();
      if (["1", "true", "yes", "y"].includes(text)) return { value: "1" };
      if (["0", "false", "no", "n"].includes(text)) return { value: "0" };
      return { error: `"${field.displayName}" must be yes or no - got "${value}".` };
    }

    // Numeric: "200 USD" passes a bare parseFloat, so write the parsed number
    // back rather than whatever was typed.
    const num = numberOf(value);
    if (num === null) {
      return { error: `"${field.displayName}" must be a number - got "${value}".` };
    }
    return { value: field.decimals > 0 ? num.toFixed(field.decimals) : String(num) };
  }

  function keyFor(values, name) {
    return Object.keys(values || {}).find(n => n.toLowerCase() === name.toLowerCase());
  }

  // Dates go first regardless of their position in the structure: entitlement
  // and every derived figure depend on the date, and posting an amount while
  // the date is still null computes it against a 0.00 entitlement.
  function orderedForApply(list) {
    return list.slice().sort((a, b) => (a.ctrlType === "5" ? 0 : 1) - (b.ctrlType === "5" ? 0 : 1));
  }

  async function applyValues(fieldList, values, controlsToMerge, trackIntent) {
    const deferred = [];

    for (const field of orderedForApply(fieldList)) {
      const givenKey = keyFor(values, field.displayName);
      if (!givenKey) continue;

      const outcome = normalizeValue(field, values[givenKey]);
      if (outcome.error) return { error: outcome.error };
      if (outcome.defer) { deferred.push(field); continue; }

      field.ref.RefValue = outcome.value;
      if (trackIntent) intended.set(field.besId, outcome.value);
      if (!await refreshDependents(field.besId, controlsToMerge)) {
        return { error: `Could not recalculate the application after setting "${field.displayName}": ${refreshFailed}` };
      }
    }

    // Second pass for dropdowns whose options only appeared once their parent
    // field was set - the structure does not guarantee parents come first.
    for (const field of deferred) {
      const givenKey = keyFor(values, field.displayName);
      const outcome = normalizeValue(field, values[givenKey]);
      if (outcome.error) return { error: outcome.error };
      if (outcome.defer) {
        return { error: `"${field.displayName}" still has no options available for ${employee.displayName} - it depends on another field that has not been set. Ask the supervisor for that field first.` };
      }
      field.ref.RefValue = outcome.value;
      if (trackIntent) intended.set(field.besId, outcome.value);
      if (!await refreshDependents(field.besId, controlsToMerge)) {
        return { error: `Could not recalculate the application after setting "${field.displayName}": ${refreshFailed}` };
      }
    }

    return {};
  }

  function describeForDiscovery(field) {
    const options = field.ref.RefObjectValue || [];
    const isDate = field.ctrlType === "5";
    return {
      displayName: field.displayName,
      // The Application Date reports "not-mandatory", but entitlement, utilized
      // and the computed total are all worthless without it, so it is required
      // in practice and must be asked for.
      mandatory: field.mandatory || isDate,
      dataType: field.dataType,
      inputType: isDate ? `date (${dateFormat})` : field.ctrlType === "3" ? "choice" : field.ctrlType === "4" ? "yes/no" : "number",
      currentValue: field.ref.RefValue,
      options: options.length ? options.map(o => o.Value) : undefined,
      note: isDate
        ? `Required. Entitlement, utilized amount and the total are calculated for this date, so ask the supervisor which date to use - today (${todayFormatted()}) is only a suggestion.`
        : (field.ctrlType === "3" && !options.length
          ? "Options appear only once the field this one depends on is set - set that one first, then call this tool again."
          : undefined)
    };
  }

  function missingDateFields(fieldList, values) {
    return fieldList.filter(f => f.ctrlType === "5" && !keyFor(values, f.displayName) && !f.ref.RefValue);
  }

  function missingMandatory(fieldList, values) {
    return fieldList.filter(f => f.mandatory && !keyFor(values, f.displayName));
  }

  /* ---------------------------------------------------------------------
   * Step 11: discovery. Entitlement is 0.00 until a date is posted, so probe
   * with today purely to show live figures - nothing is saved by this, and the
   * probed date is reported so it is never mistaken for a choice the
   * supervisor made.
   * ------------------------------------------------------------------- */
  const hasGrid = !!gridControl;
  const wantsApply = hasGrid ? !!args.rows : !!args.fieldValues;

  if (!wantsApply) {
    let probedDate = null;
    const probeField = (hasGrid ? gridEditable : fields).find(f => f.ctrlType === "5" && !f.ref.RefValue);
    const probeTarget = hasGrid ? workingRowControls : allControls;

    if (probeField) {
      const probeControl = hasGrid ? (workingControl(probeField.besId) || probeField.ref) : probeField.ref;
      probedDate = todayFormatted();
      probeControl.RefValue = probedDate;
      await refreshDependents(probeField.besId, probeTarget);
      probeControl.RefValue = null;
      refreshFailed = null; // a probe failure must not block a later submit
    }

    const probedEntitlement = entitlementSummary();

    const discovery = {
      discovery: true,
      employee: employee.displayName,
      employeeNumber: employee.displayNumber,
      designation: (employeeDetails.Designation && employeeDetails.Designation.DsgName) || null,
      benefitType: typeMatch.BetName,
      entitlement: probedEntitlement,
      entitlementAsAt: probedDate,
      entitlementNote: probedDate
        ? `These figures are for ${probedDate} (today) ONLY. Entitlement and utilized amount differ on every application date - ${employee.displayName} may have ${probedEntitlement && probedEntitlement.entitlement} today and nothing at all on another date. Never repeat these figures for a different date: if the supervisor names or changes the date, or asks what the entitlement is then, call this tool again with fieldValues containing just that application date and report what comes back.`
        : null,
      commentMandatory: betInfo.BetCommentMandatoryFlg === "1",
      showComment: betInfo.BetshowAppCommentBox === "1",
      confirmMessage: betInfo.IsConfirmNeed === "1" ? betInfo.ConfirmMessage : null,
      info: infoSnapshot()
    };

    if (hasGrid) {
      discovery.message = `${employee.displayName} (${employee.displayNumber}) and the benefit type are settled - do not ask for an employee number or re-confirm the type. This benefit type is claimed as one or more rows${gridVm.GridDef && gridVm.GridDef.GridTitle ? ` under "${gridVm.GridDef.GridTitle}"` : ""}. Ask the supervisor for the columns listed below for each row they want to claim, then call this tool again with the same employeeName/benefitType plus a rows array, each row an object keyed by the column names shown. Ask for nothing that is not listed.`;
      discovery.rowsRequired = true;
      discovery.gridColumns = gridEditable.map(describeForDiscovery);
      discovery.readOnlyColumns = gridColumns
        .filter(c => c.BesCtrlType === "7" && c.BesDisplayName)
        .map(c => c.BesDisplayName);
    } else {
      discovery.message = `${employee.displayName} (${employee.displayNumber}) and the benefit type are both settled - do not ask the user for an employee number or re-confirm the type. Ask them ONLY for the fields listed below: every mandatory one, plus any optional ones they want to set. Ask for nothing that is not in this list. Then call this tool again with the same employeeName/benefitType plus a fieldValues object keyed by each field's displayName exactly as shown.`;
      discovery.fields = fields.map(describeForDiscovery);
      if (totalVisible) {
        discovery.fields.push({
          displayName: totalLabel,
          mandatory: false,
          dataType: "NUMERIC",
          inputType: "number",
          currentValue: totalControl.RefValue,
          readOnly: !totalEditable,
          note: totalEditable
            ? "This is the amount Benefit History records against the application. PeoplesHR calculates it from the amount field(s) above, so normally leave it out - include it only when the supervisor explicitly wants a different total."
            : "This is the amount Benefit History records against the application. PeoplesHR calculates it from the amount field(s) above; it cannot be set directly for this benefit type."
        });
      }
    }

    return discovery;
  }

  /* ---------------------------------------------------------------------
   * Step 12: apply the supervisor's values.
   * ------------------------------------------------------------------- */
  let rowSummaries = [];

  if (!hasGrid) {
    const values = args.fieldValues || {};

    const unknown = Object.keys(values)
      .filter(name => name.toLowerCase() !== totalLabel.toLowerCase() && !fields.some(f => f.displayName.toLowerCase() === name.toLowerCase()));
    if (unknown.length > 0) {
      return `${unknown.map(n => `"${n}"`).join(", ")} ${unknown.length === 1 ? "is not a field" : "are not fields"} on the "${typeMatch.BetName}" benefit type. Valid fields: ${fields.map(f => f.displayName).concat(totalEditable ? [totalLabel] : []).join(", ")}`;
    }

    const missingDates = missingDateFields(fields, values);
    if (missingDates.length > 0) {
      return `${missingDates.map(f => `"${f.displayName}"`).join(", ")} is required for ${employee.displayName}'s "${typeMatch.BetName}" application - entitlement, utilized amount and the total are all calculated for that date. Ask the supervisor which date to use (today is ${todayFormatted()}) and call this tool again with it in fieldValues.`;
    }

    const missing = missingMandatory(fields, values);
    if (missing.length > 0) {
      return `Missing required field(s) for ${employee.displayName}'s "${typeMatch.BetName}" application: ${missing.map(f => f.displayName).join(", ")}. Call this tool again with these included in fieldValues.`;
    }

    const applied = await applyValues(fields, values, allControls, true);
    if (applied.error) return applied.error;

    const drift = await assertIntactAfterRefresh();
    if (drift) return drift;
  } else {
    const rows = Array.isArray(args.rows) ? args.rows : [args.rows];
    if (rows.length === 0) {
      return `At least one row is required for ${employee.displayName}'s "${typeMatch.BetName}" application.`;
    }

    for (let i = 0; i < rows.length; i++) {
      const rowValues = rows[i] || {};
      const rowLabel = rows.length > 1 ? ` (row ${i + 1})` : "";

      const unknown = Object.keys(rowValues)
        .filter(name => !gridEditable.some(f => f.displayName.toLowerCase() === name.toLowerCase()));
      if (unknown.length > 0) {
        return `${unknown.map(n => `"${n}"`).join(", ")} ${unknown.length === 1 ? "is not a column" : "are not columns"} on the "${typeMatch.BetName}" benefit type${rowLabel}. Valid columns: ${gridEditable.map(f => f.displayName).join(", ")}`;
      }

      // Work against the live row controls, which is what ColumnItems is built
      // from and what the recalculation fills in.
      const rowFields = gridEditable.map(f => Object.assign({}, f, { ref: workingControl(f.besId) || f.ref }));

      const missingDates = missingDateFields(rowFields, rowValues);
      if (missingDates.length > 0) {
        return `${missingDates.map(f => `"${f.displayName}"`).join(", ")} is required${rowLabel} - entitlement, utilized amount and the row total are all calculated for that date. Ask the supervisor which date to use (today is ${todayFormatted()}).`;
      }

      const missing = missingMandatory(rowFields, rowValues);
      if (missing.length > 0) {
        return `Missing required column(s)${rowLabel} for ${employee.displayName}'s "${typeMatch.BetName}" application: ${missing.map(f => f.displayName).join(", ")}.`;
      }

      const applied = await applyValues(rowFields, rowValues, workingRowControls, false);
      if (applied.error) return applied.error;

      const rowId = gridVm.GridData.RowItems.length + 1;
      const validation = await validateGridRow(rowId);
      if (!validation.ok) {
        return `PeoplesHR would not accept${rowLabel} this claim for ${employee.displayName}: ${validation.message}`;
      }

      gridVm.GridData.RowItems.push({
        RowId: rowId,
        IsEdit: false,
        ColumnItems: columnItemsFromWorkingRow()
      });

      rowSummaries.push(rowFields.reduce((acc, f) => {
        const live = workingControl(f.besId) || f.ref;
        acc[f.displayName] = f.ctrlType === "3"
          ? ((live.RefObjectValue || []).find(o => o.Id === live.RefValue)?.Value ?? live.RefValue)
          : f.ctrlType === "4" ? (live.RefValue === "1" ? "Yes" : "No") : live.RefValue;
        return acc;
      }, {}));
    }

    // The saved grid application (reference 170) carried Total Request "10" for
    // a single row whose amount was "10", so the total is the sum of the rows'
    // numeric columns. Ask the server for it first; fall back to summing the
    // rows ourselves if it has not caught up, since this figure is what Benefit
    // History records.
    const amountColumn = gridEditable.find(f => f.ctrlType === "2");
    if (amountColumn) await refreshDependents(amountColumn.besId, allControls);
    // This last refresh is an optimisation, not a dependency - the row values
    // are already validated and the fallback below covers the total - so a
    // failure here must not block a submission that is otherwise complete.
    refreshFailed = null;

    // Then pin the total to the sum of the rows' numeric column. Reference 170
    // recorded Total Request "10" for a single row whose amount was "10", so
    // the sum IS the figure Benefit History keeps - and pinning it also stops a
    // total left over from an earlier state of the form being submitted.
    if (totalControl) {
      const summed = gridVm.GridData.RowItems.reduce((sum, row) => {
        return sum + (row.ColumnItems || []).reduce((rowSum, ci) => {
          const col = gridColumns.find(c => c.BesId === ci.BesId);
          if (!col || col.BesCtrlType !== "2") return rowSum;
          return rowSum + (numberOf(ci.Value) || 0);
        }, 0);
      }, 0);
      totalControl.RefValue = String(summed);
    }
  }

  if (betInfo.BetCommentMandatoryFlg === "1" && !args.comment) {
    return `Error: a comment is required for ${employee.displayName}'s "${typeMatch.BetName}" application.`;
  }

  /* ---------------------------------------------------------------------
   * Step 13: Total Request override, set LAST and without a refresh after it -
   * every recalculation recomputes this control from the amount fields, so
   * setting it earlier would simply throw the supervisor's override away. Not
   * directly confirmed by capture (no captured application overrode it), so if
   * an overridden total comes back recalculated, re-capture that one change.
   * ------------------------------------------------------------------- */
  const givenTotalKey = (!hasGrid && totalVisible) ? keyFor(args.fieldValues, totalLabel) : undefined;
  let totalOverridden = false;

  if (givenTotalKey && !totalEditable) {
    return `"${totalLabel}" cannot be set directly for the "${typeMatch.BetName}" benefit type - PeoplesHR calculates it from the amount field(s). Remove it from fieldValues and set the amount instead.`;
  }
  if (givenTotalKey) {
    const totalValue = args.fieldValues[givenTotalKey];
    if (numberOf(totalValue) === null) {
      return `"${totalLabel}" must be a number - got "${totalValue}".`;
    }
    totalControl.RefValue = String(numberOf(totalValue));
    totalOverridden = true;
  }

  /* ---------------------------------------------------------------------
   * Step 14: final guards before anything can be submitted.
   * ------------------------------------------------------------------- */
  if (refreshFailed) {
    return {
      error: true,
      message: `PeoplesHR could not recalculate ${employee.displayName}'s "${typeMatch.BetName}" application, so entitlement and the applied amount cannot be trusted and nothing has been submitted. Please try again, or use the Benefit Management screen directly.`,
      detail: refreshFailed
    };
  }

  // A dropdown whose parent changed later in the run can be left holding an
  // option list - and an Id - that is no longer valid.
  const staleDropdown = (hasGrid ? gridEditable : fields).find(f => {
    if (f.ctrlType !== "3") return false;
    const live = hasGrid ? (workingControl(f.besId) || f.ref) : f.ref;
    if (!live.RefValue) return false;
    return !(live.RefObjectValue || []).some(o => o.Id === live.RefValue);
  });
  if (staleDropdown) {
    return `The value chosen for "${staleDropdown.displayName}" is no longer one of its options - another field changed what it can be. Ask the supervisor to choose it again.`;
  }

  const entitlement = entitlementSummary();
  let requested = totalRequested();

  const amountFields = (hasGrid ? [] : fields).filter(f => f.ctrlType === "2" && (numberOf(f.ref.RefValue) || 0) > 0);
  const enteredAmount = amountFields.reduce((sum, f) => sum + (numberOf(f.ref.RefValue) || 0), 0);

  // The application date every figure below was calculated for - the same
  // employee and benefit type give different entitlement figures on different
  // dates, so the date is reported alongside them and must never be dropped.
  const dateField = (hasGrid ? gridEditable : fields).find(f => f.ctrlType === "5");
  const entitlementAsAt = dateField
    ? ((hasGrid ? (workingControl(dateField.besId) || dateField.ref) : dateField.ref).RefValue || null)
    : null;

  /* Benefit History records the COMPUTED total, not the number typed into the
   * amount field: application 161 was filed with Amount in Bills 200 and an
   * applied amount of 0.00, while the same application through the UI (160)
   * recorded 200.00.
   *
   * A total of zero or below is not blocked - PeoplesHR's own screen allows an
   * application to be submitted when entitlement is exhausted (entitlement 0.00
   * on 02/09/2026 against 585.00 already utilized yields a Total Request of
   * -585.00, and the UI will still file it). Refusing here would block a flow
   * the product permits. Instead the recalculation is retried once, and the
   * figure is put in front of the supervisor: the preview states it, and the
   * digest they confirm covers it, so the number can never be filed unseen. */
  let totalWarning = null;

  if (!totalOverridden && amountFields.length > 0 && totalControl && !(requested > 0)) {
    await refreshDependents(amountFields[amountFields.length - 1].besId, allControls);
    requested = totalRequested();

    if (!(requested > 0)) {
      const entitlementNote = entitlement && entitlement.entitlement !== null && entitlement.entitlement !== undefined
        ? ` ${employee.displayName}'s entitlement${entitlementAsAt ? ` for ${entitlementAsAt}` : ""} is ${entitlement.entitlement}${entitlement.utilized !== null && entitlement.utilized !== undefined ? `, with ${entitlement.utilized} already utilized` : ""}.`
        : "";
      totalWarning = `PeoplesHR calculates a Total Request of ${requested === null ? "nothing" : requested} for this application even though ${amountFields.map(f => `"${f.displayName}" is ${f.ref.RefValue}`).join(" and ")}.${entitlementNote} That calculated figure is what Benefit History will record as the applied amount, NOT the amount entered. Tell the supervisor this plainly and get their agreement before submitting - a different date or amount may be what they intended.`;
    }
  }

  // Flagged whenever PeoplesHR's own total differs from what was typed in - the
  // supervisor is confirming the computed figure, so a difference has to be
  // visible rather than buried.
  const amountMismatch = !totalOverridden && !hasGrid && enteredAmount > 0 && requested !== null && requested !== enteredAmount;

  const overBalance = entitlement && entitlement.balance !== undefined && entitlement.balance !== null
    && (entitlement.balance < 0 || (requested !== null && requested > entitlement.balance));

  const resolvedFields = hasGrid ? [] : fields.map(f => ({
    displayName: f.displayName,
    value: f.ctrlType === "3"
      ? ((f.ref.RefObjectValue || []).find(o => o.Id === f.ref.RefValue)?.Value ?? f.ref.RefValue)
      : f.ctrlType === "4" ? (f.ref.RefValue === "1" ? "Yes" : "No") : f.ref.RefValue
  }));

  /* ---------------------------------------------------------------------
   * Step 15: preview, bound to the submit by a digest. The preview call and
   * the confirm call are independent runs - entitlement can change between
   * them (another application filed, a different day) - so the supervisor must
   * be confirming the figures they were actually shown.
   * ------------------------------------------------------------------- */
  const previewDigest = digestOf({
    employee: employee.displayNumber,
    betCode: typeMatch.BetCode,
    fields: resolvedFields,
    rows: rowSummaries,
    total: requested,
    entitlement,
    comment: args.comment || null
  });

  function previewPayload(extra) {
    return Object.assign({
      preview: true,
      employee: employee.displayName,
      employeeNumber: employee.displayNumber,
      benefitType: typeMatch.BetName,
      entitlement,
      // These figures belong to this date only - the same employee and type
      // give different entitlement on a different date.
      entitlementAsAt,
      [totalLabel]: requested,
      totalWasOverridden: totalOverridden,
      amountEntered: enteredAmount || null,
      // Both of these must be read out to the supervisor before they confirm -
      // the figure PeoplesHR records is the calculated one, not what was typed.
      totalWarning,
      amountWarning: amountMismatch && !totalWarning
        ? `PeoplesHR will record ${requested}, not the ${enteredAmount} that was entered - it applies its own rules to work out the Total Request. Show the supervisor both figures before they confirm.`
        : null,
      balanceWarning: overBalance
        ? `${employee.displayName} has ${entitlement.balance} left${entitlementAsAt ? ` as at ${entitlementAsAt}` : ""} (entitlement ${entitlement.entitlement}, utilized ${entitlement.utilized}), and this application requests ${requested}. Point this out to the supervisor before they confirm - PeoplesHR applies its own rules on submission.`
        : null,
      confirmMessage: betInfo.IsConfirmNeed === "1" ? betInfo.ConfirmMessage : null,
      info: infoSnapshot(),
      fields: hasGrid ? undefined : resolvedFields,
      rows: hasGrid ? rowSummaries : undefined,
      comment: args.comment || null,
      previewDigest
    }, extra || {});
  }

  if (!args.confirmed) {
    return previewPayload({
      message: `Review this application with the supervisor, making clear it will be submitted on ${employee.displayName}'s behalf${totalWarning ? ", and read them the totalWarning below in full - PeoplesHR will record that calculated figure, not the amount entered" : ""}. Once they agree, call this tool again with the same arguments plus confirmed:true and previewDigest:"${previewDigest}" copied exactly from this response.`
    });
  }

  if (!args.previewDigest) {
    return previewPayload({
      message: `Nothing has been submitted: a confirmation must carry the previewDigest from the preview the supervisor actually saw. Show them these figures, then call again with confirmed:true and previewDigest:"${previewDigest}".`
    });
  }

  if (args.previewDigest !== previewDigest) {
    return previewPayload({
      changed: true,
      message: `The application has changed since the supervisor saw it - most likely ${employee.displayName}'s entitlement or utilized amount moved. Nothing has been submitted. Show them these updated figures and, if they still agree, call again with confirmed:true and previewDigest:"${previewDigest}".`
    });
  }

  /* ---------------------------------------------------------------------
   * Step 16: submit. Exactly the 7 keys the capture sends - for grid types too
   * (reference 170), where the rows ride inside the grid control's
   * ApplicationGridDefVm.GridData.RowItems within ApplicationRowVms.
   * ------------------------------------------------------------------- */
  const saveResult = await postJson(
    `${base}/BenefitV9//api/ApplicationApi/SaveApplication/`,
    {
      ApplicationRowVms: structure.applicationRowVms,
      CurrentEmployeeNumber: appEmpNumber,
      CurrentBenefitTypeCode: typeMatch.BetCode,
      BetCommentMandatoryFlg: betInfo.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.comment || null,
      VisibilityState: blob.VisibilityState || "1",
      KeyValue: sessionKey
    },
    "SaveApplication"
  );
  if (saveResult.error) return saveResult.error;

  const saved = saveResult.data || {};

  return {
    submitted: !!saved.Status,
    message: saved.Message
      ? `${saved.Message} (submitted on behalf of ${employee.displayName})`
      : `The application for ${employee.displayName} was not confirmed as submitted - please check the Benefit Management screen.`,
    employee: employee.displayName,
    employeeNumber: employee.displayNumber,
    benefitType: typeMatch.BetName,
    entitlement,
    entitlementAsAt,
    [totalLabel]: requested,
    amountEntered: enteredAmount || null,
    totalWarning,
    fields: hasGrid ? undefined : resolvedFields,
    rows: hasGrid ? rowSummaries : undefined
  };
})