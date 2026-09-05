(async function (data, args, reqOptions) {
  const allResultsgroups = BeaconBar.getSharedData("allWorkflowTypesWithViewState");

  if (!BeaconBar.user.metaData.menus.includes("WorkFlow_v6/DefineWorkflowType.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const matchedItem = allResultsgroups.find(
    item => item.WorkflowType === args.WorkflowType
  );

  if (!matchedItem) {
    throw new Error(`Description not found: ${args.description}`);
  }
  const result = await BeaconBar.executeFunction("workflowTypesDetails")(matchedItem.EventKey, matchedItem.ViewState);
  function extractWorkflowDetailsFromHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const getValue = (selector) => doc.querySelector(selector)?.value?.trim() || '';
    const getText = (selector) => doc.querySelector(selector)?.textContent?.trim() || '';
    const getSelectedText = (selector) => {
      const el = doc.querySelector(selector);
      return el ? el.options[el.selectedIndex]?.text?.trim() : '';
    };
    const getCheckbox = (selector) => doc.querySelector(selector)?.hasAttribute('checked') || false;

    return {
      Module: getSelectedText('#ctl00_body_ddlModule'),
      WorkflowTypeCode: getValue('#ctl00_body_txtCode'),
      Description: getText('#ctl00_body_txtDescription'),
      Table: getValue('#ctl00_body_txtTbl'),
      View: getValue('#ctl00_body_txtView'),
      UpdateField: getSelectedText('#ctl00_body_ddlUpdCol'),
      ApproveMainField: getSelectedText('#ctl00_body_ddlAppMain'),
      CancelMainField: getSelectedText('#ctl00_body_ddlCancelMain'),
      CancelStatusField: getSelectedText('#ctl00_body_ddlCnclStatus'),
      HistoryView: getValue('#ctl00_body_txtWFHistoryView'),
      PendingView: getValue('#ctl00_body_txtWFPendingView'),
      RedirectURL: getValue('#ctl00_body_txtRedirectURL'),
      Assembly: getValue('#ctl00_body_txtAssembly'),
      AssemblyClass: getValue('#ctl00_body_txtAssemblyClass'),
      BulkApproval: getCheckbox('#ctl00_body_chkBulkApproval'),
      OwnApproval: getCheckbox('#ctl00_body_chkOwnApproval'),
      DirectReject: getCheckbox('#ctl00_body_chkDirectReject'),
      RejectToPreStep: getCheckbox('#ctl00_body_chkRejectToPreStep'),
    };
  }

  const workflowDetails = extractWorkflowDetailsFromHTML(result);
  return workflowDetails;
})