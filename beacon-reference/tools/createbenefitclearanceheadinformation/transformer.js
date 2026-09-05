(async function (data, args, reqOptions) {
  
  if (!BeaconBar.user.metaData.menus.includes("EIM/BenefitClearingHead.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Benefit Clearance Head screen. Please contact HR Admin."
    };
  }

  // Validate required fields
  if (!args.positionName) {
    return {
      status: "INVALID_ARGS",
      message: "positionName is required to create a new Benefit Clearance Head position."
    };
  }

  if (!args.employeeId) {
    return {
      status: "INVALID_ARGS",
      message: "employeeId is required to assign an employee to the position."
    };
  }

  // Validate createWorkflowApproval is provided
  if (args.createWorkflowApproval === undefined || args.createWorkflowApproval === null) {
    return {
      status: "INVALID_ARGS",
      message: "createWorkflowApproval is required. Please specify true or false."
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

  // STEP 1: Get initial page
  const initialResponse = await fetch(url, { method: "GET", headers });
  const initialDoc = parser.parseFromString(await initialResponse.text(), "text/html");

  const vs1 = initialDoc.querySelector("#__VIEWSTATE")?.value || "";
  const ev1 = initialDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const vsg1 = initialDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // STEP 2: Click New button
  const newForm = new URLSearchParams();
  newForm.append("scrollLeft", "0");
  newForm.append("scrollTop", "0");
  newForm.append("__EVENTTARGET", "");
  newForm.append("__EVENTARGUMENT", "");
  newForm.append("__VIEWSTATE", vs1);
  newForm.append("__VIEWSTATEGENERATOR", vsg1);
  newForm.append("__VIEWSTATEENCRYPTED", "");
  newForm.append("__EVENTVALIDATION", ev1);
  newForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
  newForm.append("ctl00$hdnQuickmenu", "1");
  newForm.append("ctl00_body_RadWindowManager1_ClientState", "");
  newForm.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
  newForm.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
  newForm.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "6");
  newForm.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
  newForm.append("ctl00_body_grdsummary_ClientState", "");
  newForm.append("ctl00$body$butNew", "New");

  const newResponse = await fetch(url, { method: "POST", headers, body: newForm });
  const newDoc = parser.parseFromString(await newResponse.text(), "text/html");

  let vs2 = newDoc.querySelector("#__VIEWSTATE")?.value || "";
  let ev2 = newDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  let vsg2 = newDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  const currentEmployeeDisplay = newDoc.querySelector("#ctl00_body_txtEmpDisplayNo")?.value || "";

  // STEP 3: Search for employee - SAME AS EDIT
  
  // Call censusInformation to register employee selection
  await BeaconBar.executeFunction("censusInformation")(args.employeeId);

  // Trigger GetSearchResult callback
  const searchForm = new URLSearchParams();
  searchForm.append("scrollLeft", "0");
  searchForm.append("scrollTop", "0");
  searchForm.append("__EVENTTARGET", "GetSearchResult");
  searchForm.append("__EVENTARGUMENT", "");
  searchForm.append("__VIEWSTATE", vs2);
  searchForm.append("__VIEWSTATEGENERATOR", vsg2);
  searchForm.append("__VIEWSTATEENCRYPTED", "");
  searchForm.append("__EVENTVALIDATION", ev2);
  searchForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
  searchForm.append("ctl00$hdnQuickmenu", "1");
  searchForm.append("ctl00_body_RadWindowManager1_ClientState", "");
  searchForm.append("ctl00$body$txtBenHeadName", "");
  searchForm.append("ctl00$body$hdnDisplayMethod", "");
  searchForm.append("ctl00$body$txtEmpDisplayNo", currentEmployeeDisplay);

  const searchResponse = await fetch(url, { method: "POST", headers, body: searchForm });
  const searchDoc = parser.parseFromString(await searchResponse.text(), "text/html");

  // Get updated employee name after GetSearchResult
  const employeeName = searchDoc.querySelector("#ctl00_body_txtEmpDisplayNo")?.value || "";
  
  // Check if employee was found
  if (!employeeName || employeeName === currentEmployeeDisplay) {
    return {
      status: "EMPLOYEE_NOT_FOUND",
      message: `Employee with ID "${args.employeeId}" not found or is not active.`
    };
  }


  // Update viewstate
  const vs3 = searchDoc.querySelector("#__VIEWSTATE")?.value || "";
  const ev3 = searchDoc.querySelector("#__EVENTVALIDATION")?.value || "";
  const vsg3 = searchDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  // Handle checkbox - now guaranteed to have a value
  const checkboxChecked = args.createWorkflowApproval === "true" || args.createWorkflowApproval === true;

    position: args.positionName,
    employee: employeeName,
    workflow: checkboxChecked
  });

  // STEP 5: Save
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
  saveForm.append("ctl00$body$txtBenHeadName", args.positionName);
  saveForm.append("ctl00$body$hdnDisplayMethod", "");
  saveForm.append("ctl00$body$txtEmpDisplayNo", employeeName);
  
  if (checkboxChecked) {
    saveForm.append("ctl00$body$chkAssignWorkFlow", "on");
  }
  
  saveForm.append("ctl00$body$butSave", "Save");

  const finalResponse = await fetch(url, { method: "POST", headers, body: saveForm });
  const saveHtml = await finalResponse.text();

  if (finalResponse.status === 200) {
    const saveDoc = parser.parseFromString(saveHtml, "text/html");
    const errorMsg = saveDoc.querySelector(".alert-danger, .error, #ctl00_body_lblMessage")?.textContent;
    
    if (errorMsg && errorMsg.trim() !== "" && !errorMsg.includes("successfully")) {
      return { status: "ERROR", message: `Save failed: ${errorMsg.trim()}` };
    }

    
    return {
      status: "SUCCESS",
      message: `Successfully created Benefit Clearance Head position "${args.positionName}" and assigned it to ${employeeName} (ID: ${args.employeeId}).`,
      positionName: args.positionName,
      assignedEmployee: employeeName,
      employeeId: args.employeeId,
      workflowApprovalEnabled: checkboxChecked
    };
  }

  return {
    status: "ERROR",
    message: "Failed to create position. Please verify in the UI."
  };
});