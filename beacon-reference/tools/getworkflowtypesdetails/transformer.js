(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getWorkflow")("DefineWorkflowType");

  const workflowData = [];

  const parser = new DOMParser();
  let doc = parser.parseFromString(details.rawData, "text/html");

  const extractRows = (document) => {
    const rows = document.querySelectorAll("#ctl00_body_grdWFTypes > tbody > tr");
    const result = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        const module = cells[0].textContent.trim();
        const description = cells[1].textContent.trim();
        if (module && description) {
          result.push({ module, description });
        }
      }
    });
    return result;
  };

  // Insert first API page
  workflowData.push(...extractRows(doc));

  let pageNumber = 2;
  let hasMorePages = true;
  let viewState = details.viewState;
  let viewStateGen = details.viewStateGen;
  let eventValidation = details.eventValidation;

  while (hasMorePages) {
    const response = await BeaconBar.executeFunction("Workflow")({
      "ctl00_body_RadScriptManager1_HiddenField": "",
      __EVENTTARGET: "ctl00$body$grdWFTypes",
      __EVENTARGUMENT: `Page$${pageNumber}`,
      __VIEWSTATE: viewState,
      __VIEWSTATEGENERATOR: viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: eventValidation,
      "ctl00_body_RadWindowManager1_ClientState": "",
      "ctl00$body$hdnFlModID": "",
      "ctl00$body$hdnFldTypeCodeStatus": "",
      "ctl00$body$hdnFldTypeCode": "",
    }, "DefineWorkflowType");

    doc = parser.parseFromString(response.rawData, "text/html");
    const currentRows = extractRows(doc);

    if (currentRows.length === 0) {
      hasMorePages = false;
    } else {
      workflowData.push(...currentRows);
      viewState = response.viewState;
      viewStateGen = response.viewStateGen;
      eventValidation = response.eventValidation;
      pageNumber++;
    }
  }

  return workflowData;
})
