(async function (data, args, reqOptions) {
  // Confirmed by diffing GetApplicationStructure's response against the matching
  // SaveApplication request body (captures under "Benefit Mng Feature/"): only
  // BesCtrlType "2" (numeric), "3" (dropdown), and "5" (date) fields had their RefValue
  // changed by the user. "7" (text) and "VL" (computed value-list) fields were always
  // echoed back exactly as received - they are system-prefilled/computed, not user input.
  // "0" is a structural divider row with no BesDisplayName. This list is what makes the
  // tool generic across benefit types instead of hardcoding field positions per type.
  const EDITABLE_CTRL_TYPES = ["2", "3", "5"];

  const jsonHeaders = new Headers();
  jsonHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  jsonHeaders.append("Content-Type", "application/json; charset=UTF-8");
  jsonHeaders.append("X-Requested-With", "XMLHttpRequest");

  // Reuses the existing "selfEmployeeApplyBenefitApplication" Beacon Function, which
  // correctly resolves the signed-in employee's encrypted empNumber plus appId/keyValue/
  // betAppYear and the live benefit type list from the Application page's own bootstrap
  // blob - unlike the old tool, nothing here is cached on `window` between separate tool
  // calls; every invocation re-resolves everything fresh, the same self-contained pattern
  // used by submitMyGrievanceApplication/submitSelfAppealForGrievance.
  const bootstrap = await BeaconBar.executeFunction("selfEmployeeApplyBenefitApplication")();
  if (!bootstrap || !bootstrap.empNumber) {
    return "Could not resolve the signed-in employee's Benefit Management session - please try again.";
  }

  if (!args.benefitType) {
    return `benefitType is required. Available benefit types: ${(bootstrap.benefitTypes || []).map(b => b.BetName).join(", ")}`;
  }

  const wantedType = args.benefitType.toLowerCase();
  const typeMatch = (bootstrap.benefitTypes || []).find(b => b.BetName.toLowerCase() === wantedType)
    || (bootstrap.benefitTypes || []).find(b => b.BetName.toLowerCase().includes(wantedType));

  if (!typeMatch) {
    return `Could not find a benefit type matching "${args.benefitType}". Available benefit types: ${(bootstrap.benefitTypes || []).map(b => b.BetName).join(", ")}`;
  }

  // Confirmed request shape (betCode/empNumber/visibilityState/isWorkflow/appId/wfMainId/
  // cancelWfMainId/keyValue/BetAppYear) via capture, matching the self-service (non-admin)
  // branch of the existing "getBenefitApplicationStructure" function - visibilityState "1",
  // isWorkflow "0", wfMainId/cancelWfMainId null are constants across every capture for
  // this path, not guesses.
  const structureRes = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/GetApplicationStructure/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      betCode: typeMatch.BetCode,
      empNumber: bootstrap.empNumber,
      visibilityState: "1",
      isWorkflow: "0",
      appId: bootstrap.appId,
      wfMainId: null,
      cancelWfMainId: null,
      keyValue: bootstrap.keyValue,
      BetAppYear: bootstrap.betAppYear
    }),
    redirect: "follow"
  });
  const structure = await structureRes.json();

  // Flatten into addressable fields by display name (not array position), keeping a live
  // reference back into `structure` so edits land directly in the same tree that gets
  // resent to SaveApplication unchanged otherwise - mirrors how Beacon's own client works.
  // Read-only fields (Entitlement, Utilized Amount, Department, etc. - BesCtrlType "7"/
  // "VL") are collected separately as `infoFields`, surfaced for display only, so the
  // agent can show entitlement/utilized-amount context without asking the user for it.
  const fields = [];
  const infoFields = [];
  let hasUnsupportedGrid = false;
  (structure.applicationRowVms || []).forEach(row => {
    (row.ApplicationStructureRowVms || []).forEach(ctrl => {
      if (ctrl.IsGridDef || ctrl.BesIsGridControl === 1) {
        hasUnsupportedGrid = true;
        return;
      }
      if (!ctrl.BesDisplayName) return;
      if (EDITABLE_CTRL_TYPES.includes(ctrl.BesCtrlType)) {
        fields.push({
          besId: ctrl.BesId,
          displayName: ctrl.BesDisplayName,
          mandatory: ctrl.BesIsMandatory === "mandatory",
          dataType: ctrl.BesDataType,
          ctrlType: ctrl.BesCtrlType,
          options: (ctrl.RefObjectValue || []).map(o => o.Value),
          ref: ctrl
        });
      } else if (ctrl.BesCtrlType === "7" || ctrl.BesCtrlType === "VL") {
        infoFields.push({ displayName: ctrl.BesDisplayName, value: ctrl.RefDisplayValue || ctrl.RefValue });
      }
    });
  });

  // Parking Reimbursement's claim list and Health Plan's dependent enrollments are
  // grid-based (ApplicationGridDefVm/IsGridDef), a structurally different shape this tool
  // does not yet handle - refuse cleanly rather than silently submitting an incomplete grid.
  if (hasUnsupportedGrid) {
    return `The "${typeMatch.BetName}" benefit type includes a table/grid section (e.g. a list of claims or dependent enrollments) that this tool doesn't support yet. Please use the Benefit Management screen directly for this benefit type.`;
  }

  const betInfo = structure.currentBenefitType || {};

  if (betInfo.BetAttachmentMandatoryFlg === 1 || betInfo.BetAttachmentMandatoryFlg === "1") {
    return `The "${typeMatch.BetName}" benefit type requires a file attachment, which this tool cannot upload. Please use the Benefit Management screen directly for this benefit type.`;
  }

  // No fieldValues yet: return the live, per-benefit-type field list instead of asking the
  // user blind or guessing generic field names - mirrors submitMyGrievanceApplication's
  // "call with ground omitted to discover the real list" pattern.
  if (!args.fieldValues) {
    return {
      discovery: true,
      message: "Ask the user for each mandatory field below (plus any optional ones they want to set), then call this tool again with the same benefitType and a fieldValues object keyed by each field's displayName exactly as shown. For dropdown fields, use the option's text from `options`, not an internal code.",
      benefitType: typeMatch.BetName,
      commentMandatory: betInfo.BetCommentMandatoryFlg === "1",
      showComment: betInfo.BetshowAppCommentBox === "1",
      confirmMessage: betInfo.IsConfirmNeed === "1" ? betInfo.ConfirmMessage : null,
      info: infoFields,
      fields: fields.map(f => ({
        displayName: f.displayName,
        mandatory: f.mandatory,
        dataType: f.dataType,
        currentValue: f.ref.RefValue,
        options: f.options.length ? f.options : undefined
      }))
    };
  }

  const missingMandatory = fields.filter(f => f.mandatory && !(f.displayName in args.fieldValues));
  if (missingMandatory.length > 0) {
    return `Missing required field(s) for "${typeMatch.BetName}": ${missingMandatory.map(f => f.displayName).join(", ")}. Call this tool again with these included in fieldValues.`;
  }

  for (const [name, value] of Object.entries(args.fieldValues)) {
    const field = fields.find(f => f.displayName.toLowerCase() === name.toLowerCase());
    if (!field) {
      return `"${name}" is not a field on the "${typeMatch.BetName}" benefit type. Valid fields: ${fields.map(f => f.displayName).join(", ")}`;
    }
    if (field.ctrlType === "3") {
      // Dropdown: resolve the given label against RefObjectValue and store its Id as
      // RefValue - confirmed via capture (e.g. "Effected month" RefValue "9" for the
      // option {Id:"9", Value:"September"}), not the display text itself.
      const opt = (field.ref.RefObjectValue || []).find(o => String(o.Value).toLowerCase() === String(value).toLowerCase());
      if (!opt) {
        return `"${value}" is not a valid option for "${field.displayName}". Valid options: ${(field.ref.RefObjectValue || []).map(o => o.Value).join(", ")}`;
      }
      field.ref.RefValue = opt.Id;
    } else {
      // Numeric ("2") and date ("5") fields take the plain value directly. Dates are
      // "DD/MM/YYYY" (e.g. "12/09/2026", confirmed by capture) - convert yourself, this
      // module does not use the "dateFormat" tool's output format.
      field.ref.RefValue = value;
    }
  }

  if (betInfo.BetCommentMandatoryFlg === "1" && !args.comment) {
    return `Error: comment is required for the "${typeMatch.BetName}" benefit type.`;
  }

  if (!args.confirmed) {
    return {
      preview: true,
      message: "Review this application with the user before submitting. Call this tool again with confirmed:true (and the same arguments) once they agree.",
      benefitType: typeMatch.BetName,
      confirmMessage: betInfo.IsConfirmNeed === "1" ? betInfo.ConfirmMessage : null,
      info: infoFields,
      fields: fields.map(f => ({
        displayName: f.displayName,
        value: f.ctrlType === "3"
          ? ((f.ref.RefObjectValue || []).find(o => o.Id === f.ref.RefValue)?.Value ?? f.ref.RefValue)
          : f.ref.RefValue
      })),
      comment: args.comment || null
    };
  }

  // Confirmed request shape via capture: exactly these 7 keys, nothing else (no AppId/
  // WfMainId/StepId - those only appear in GetApplicationStructure and in the grid-only
  // ValidateGridControl/GetDependentControlValues calls this tool doesn't use).
  const saveRes = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/SaveApplication/`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      ApplicationRowVms: structure.applicationRowVms,
      CurrentEmployeeNumber: bootstrap.empNumber,
      CurrentBenefitTypeCode: typeMatch.BetCode,
      BetCommentMandatoryFlg: betInfo.BetCommentMandatoryFlg || "0",
      ApplicantComment: args.comment || null,
      VisibilityState: "1",
      KeyValue: bootstrap.keyValue
    }),
    redirect: "follow"
  });
  const saveResult = await saveRes.json();

  return {
    submitted: !!saveResult.Status,
    message: saveResult.Message,
    benefitType: typeMatch.BetName
  };
})
