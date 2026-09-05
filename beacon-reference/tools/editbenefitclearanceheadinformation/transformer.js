(async function (data, args, reqOptions) {
  
  if (!BeaconBar.user.metaData.menus.includes("EIM/BenefitClearingHead.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Benefit Clearance Head screen. Please contact HR Admin."
    };
  }

  const headers = new Headers();
  headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  headers.append("x-requested-with", "XMLHttpRequest");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/BenefitClearingHead.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/BenefitClearingHead.aspx`;

  const parser = new DOMParser();

  // STEP 1: Get initial page and list all benefit heads
  const initialResponse = await fetch(url, { method: "GET", headers });
  const initialDoc = parser.parseFromString(await initialResponse.text(), "text/html");

  const rows = initialDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
  const allPositions = [];
  
  rows.forEach(r => {
    const cells = r.querySelectorAll("td");
    const posName = cells[0]?.textContent.trim();
    const empName = cells[1]?.textContent.trim();
    const editKey = r.querySelector("a")?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1];
    
    if (posName && editKey) {
      allPositions.push({
        positionName: posName,
        currentEmployee: empName,
        editKey: editKey
      });
    }
  });


  // If no specific position provided, return the list
  if (!args.positionName) {
    return {
      status: "NEEDS_POSITION",
      message: "Please specify which Benefit Clearance Head position you want to edit:",
      availablePositions: allPositions
    };
  }

  // Find the matching position
  const targetPosition = allPositions.find(p => 
    p.positionName.toLowerCase() === args.positionName.toLowerCase()
  );

  if (!targetPosition) {
    return {
      status: "NOT_FOUND",
      message: `Position "${args.positionName}" not found. Available positions are: ${allPositions.map(p => p.positionName).join(', ')}`,
      availablePositions: allPositions
    };
  }

  const vs1 = initialDoc.querySelector("#__VIEWSTATE")?.value || "";
  const ev1 = initialDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const vsg1 = initialDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // STEP 2: Click on row to open detail view
  const rowClickForm = new URLSearchParams();
  rowClickForm.append("scrollLeft", "0");
  rowClickForm.append("scrollTop", "0");
  rowClickForm.append("__EVENTTARGET", targetPosition.editKey);
  rowClickForm.append("__EVENTARGUMENT", "");
  rowClickForm.append("__VIEWSTATE", vs1);
  rowClickForm.append("__VIEWSTATEGENERATOR", vsg1);
  rowClickForm.append("__VIEWSTATEENCRYPTED", "");
  rowClickForm.append("__EVENTVALIDATION", ev1);
  rowClickForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
  rowClickForm.append("ctl00$hdnQuickmenu", "1");
  rowClickForm.append("ctl00_body_RadWindowManager1_ClientState", "");
  rowClickForm.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  rowClickForm.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  rowClickForm.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "5");
  rowClickForm.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  rowClickForm.append("ctl00_body_grdsummary_ClientState", "");

  const detailResponse = await fetch(url, { method: "POST", headers, body: rowClickForm });
  const detailDoc = parser.parseFromString(await detailResponse.text(), "text/html");

  const currentPositionName = detailDoc.querySelector("#ctl00_body_txtBenHeadName")?.value || "";
  const currentEmployeeDisplay = detailDoc.querySelector("#ctl00_body_txtEmpDisplayNo")?.value || "";


  const vs2 = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
  const ev2 = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const vsg2 = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // STEP 3: Click Edit button
  const editForm = new URLSearchParams();
  editForm.append("scrollLeft", "0");
  editForm.append("scrollTop", "0");
  editForm.append("__EVENTTARGET", "");
  editForm.append("__EVENTARGUMENT", "");
  editForm.append("__VIEWSTATE", vs2);
  editForm.append("__VIEWSTATEGENERATOR", vsg2);
  editForm.append("__VIEWSTATEENCRYPTED", "");
  editForm.append("__EVENTVALIDATION", ev2);
  editForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
  editForm.append("ctl00$hdnQuickmenu", "1");
  editForm.append("ctl00_body_RadWindowManager1_ClientState", "");
  editForm.append("ctl00$body$hdnDisplayMethod", "");
  editForm.append("ctl00$body$butEdit", "Edit");

  const editModeResponse = await fetch(url, { method: "POST", headers, body: editForm });
  const editModeDoc = parser.parseFromString(await editModeResponse.text(), "text/html");

  let vs3 = editModeDoc.querySelector("#__VIEWSTATE")?.value || "";
  let ev3 = editModeDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  let vsg3 = editModeDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const currentCheckbox = editModeDoc.querySelector("#ctl00_body_chkAssignWorkFlow")?.checked || false;

  let updatedPositionName = args.newPositionName || currentPositionName;
  let updatedEmployeeName = currentEmployeeDisplay;
  let employeeChanged = false;

  // EMPLOYEE SEARCH FLOW - Using GetSearchResult (same as work experience)
  if (args.employeeId) {
    
    // Call censusInformation to register employee selection
    await BeaconBar.executeFunction("censusInformation")(args.employeeId);

    // Trigger GetSearchResult callback
    const searchForm = new URLSearchParams();
    searchForm.append("scrollLeft", "0");
    searchForm.append("scrollTop", "0");
    searchForm.append("__EVENTTARGET", "GetSearchResult");
    searchForm.append("__EVENTARGUMENT", "");
    searchForm.append("__VIEWSTATE", vs3);
    searchForm.append("__VIEWSTATEGENERATOR", vsg3);
    searchForm.append("__VIEWSTATEENCRYPTED", "");
    searchForm.append("__EVENTVALIDATION", ev3);
    searchForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
    searchForm.append("ctl00$hdnQuickmenu", "1");
    searchForm.append("ctl00_body_RadWindowManager1_ClientState", "");
    searchForm.append("ctl00$body$txtBenHeadName", updatedPositionName);
    searchForm.append("ctl00$body$hdnDisplayMethod", "");
    searchForm.append("ctl00$body$txtEmpDisplayNo", currentEmployeeDisplay);

    const searchResponse = await fetch(url, { method: "POST", headers, body: searchForm });
    const searchDoc = parser.parseFromString(await searchResponse.text(), "text/html");

    // Get updated employee name after GetSearchResult
    updatedEmployeeName = searchDoc.querySelector("#ctl00_body_txtEmpDisplayNo")?.value || "";
    
    // Check if employee was found
    if (!updatedEmployeeName || updatedEmployeeName === currentEmployeeDisplay) {
      return {
        status: "EMPLOYEE_NOT_FOUND",
        message: `Employee with ID "${args.employeeId}" not found or is not active.`
      };
    }

    employeeChanged = true;

    // Update viewstate
    vs3 = searchDoc.querySelector("#__VIEWSTATE")?.value || vs3;
    ev3 = searchDoc.querySelector("#__EVENTVALIDATION")?.value || ev3;
    vsg3 = searchDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || vsg3;
  }

  // Handle checkbox
  let checkboxChecked = currentCheckbox;
  if (args.createWorkflowApproval !== undefined) {
    checkboxChecked = args.createWorkflowApproval === "true" || args.createWorkflowApproval === true;
  }

    position: updatedPositionName,
    employee: updatedEmployeeName,
    workflow: checkboxChecked
  });

  // STEP 6: Save
  const saveForm = new URLSearchParams();
  saveForm.append("scrollLeft", "0");
  saveForm.append("scrollTop", "0");
  saveForm.append("__EVENTTARGET", "");
  saveForm.append("__EVENTARGUMENT", "");
  saveForm.append("__VIEWSTATE", vs3);
  saveForm.append("__VIEWSTATEGENERATOR", vsg3);
  saveForm.append("__VIEWSTATEENCRYPTED", "");
  saveForm.append("__EVENTVALIDATION", ev3);
  saveForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
  saveForm.append("ctl00$hdnQuickmenu", "1");
  saveForm.append("ctl00_body_RadWindowManager1_ClientState", "");
  saveForm.append("ctl00$body$txtBenHeadName", updatedPositionName);
  saveForm.append("ctl00$body$hdnDisplayMethod", "");
  saveForm.append("ctl00$body$txtEmpDisplayNo", updatedEmployeeName);
  
  if (checkboxChecked) {
    saveForm.append("ctl00$body$chkAssignWorkFlow", "on");
  }
  
  saveForm.append("ctl00$body$butSave", "Save");

  const finalResponse = await fetch(url, { method: "POST", headers, body: saveForm });
  const saveHtml = await finalResponse.text();

  if (finalResponse.status === 200) {
    const saveDoc = parser.parseFromString(saveHtml, "text/html");
    const errorMsg = saveDoc.querySelector(".alert-danger, .error, #ctl00_body_lblMessage")?.textContent;
    
    if (errorMsg && errorMsg.trim() !== "") {
      return { status: "ERROR", message: `Save failed: ${errorMsg.trim()}` };
    }

    
    const changes = [];
    if (args.newPositionName) changes.push(`position name to "${updatedPositionName}"`);
    if (employeeChanged) changes.push(`assigned employee to ${updatedEmployeeName} (ID: ${args.employeeId})`);
    if (args.createWorkflowApproval !== undefined) {
      changes.push(`workflow approval ${checkboxChecked ? 'enabled' : 'disabled'}`);
    }
    
    return {
      status: "SUCCESS",
      message: `Successfully updated ${args.positionName}. Changed: ${changes.join(', ')}.`,
      positionName: updatedPositionName,
      assignedEmployee: updatedEmployeeName,
      employeeId: args.employeeId,
      workflowApprovalEnabled: checkboxChecked,
      previousEmployee: currentEmployeeDisplay
    };
  }

  return {
    status: "ERROR",
    message: "Failed to update. Please verify in the UI."
  };
});