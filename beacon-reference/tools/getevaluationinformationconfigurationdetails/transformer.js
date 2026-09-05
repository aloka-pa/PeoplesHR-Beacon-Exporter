(async function(data, args, reqOptions) {
  debugger;
  if (!BeaconBar.user.metaData.menus.includes("Perf/CompanyEvaluation.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const details = await BeaconBar.executeFunction("getApiListPerf")("CompanyEvaluation");

  const myHeaders = new Headers();
  myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
  myHeaders.append("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('Perf/CompanyEvaluation.aspx');
  let url;
  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url = `${window.origin}/${reqOptions.sl}/Perf/CompanyEvaluation.aspx`;
  }

  let evaluationFound = null;
  let currentViewState = details.viewState;
  let currentEventValidation = details.eventValidation;
  let currentViewStateGen = details.viewStateGen;
  let eventTarget = "";

  // Search through pages to find the evaluation
  while (true) {
    const formData = new FormData();
    formData.append("scrollLeft", "0");
    formData.append("scrollTop", "0");
    formData.append("__EVENTTARGET", eventTarget);
    formData.append("__EVENTARGUMENT", "");
    formData.append("__VIEWSTATE", currentViewState);
    formData.append("__VIEWSTATEGENERATOR", currentViewStateGen);
    formData.append("__VIEWSTATEENCRYPTED", "");
    formData.append("__EVENTVALIDATION", currentEventValidation);

    const response = await fetch(url, {
      method: "POST",
      headers: myHeaders,
      body: formData,
      redirect: "follow"
    });

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Update ViewState for next iteration
    currentViewState = doc.querySelector('#__VIEWSTATE')?.value || currentViewState;
    currentEventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || currentEventValidation;
    currentViewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || currentViewStateGen;

    // Check all rows on the page
    const rows = doc.querySelectorAll("#grdsummary tbody tr");
    for (let row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length < 3) continue;

      const evalName = cells[0].textContent.trim();
      if (evalName === args.evaluationName) {
        const editHref = cells[2].querySelector("a")?.getAttribute("href") || "";
        const editTarget = editHref.match(/__doPostBack\('([^']+)'/)?.[1] || null;

        evaluationFound = {
          name: evalName,
          description: cells[1].textContent.trim(),
          editTarget
        };
        break;
      }
    }

    if (evaluationFound) break;

    // Check if there is a next page
    const nextPageLink = doc.querySelector("#grdsummary tbody tr[pager] a[href*='__doPostBack']");
    if (!nextPageLink) {
      const allLinks = doc.querySelectorAll("#grdsummary a[href*='__doPostBack']");
      let foundNext = false;
      for (let link of allLinks) {
        const linkText = link.textContent.trim();
        if (linkText && !isNaN(linkText) && parseInt(linkText) > 1) {
          eventTarget = link.getAttribute("href").match(/__doPostBack\('([^']+)'/)?.[1] || null;
          if (eventTarget) {
            foundNext = true;
            break;
          }
        }
      }
      if (!foundNext) break;
    } else {
      eventTarget = nextPageLink.getAttribute("href").match(/__doPostBack\('([^']+)'/)?.[1] || null;
      if (!eventTarget) break;
    }
  }

  if (!evaluationFound) {
    return { error: "Evaluation not found", evaluationName: args.evaluationName };
  }

  // Click Edit to view details
  const editFormData = new FormData();
  editFormData.append("scrollLeft", "0");
  editFormData.append("scrollTop", "0");
  editFormData.append("__EVENTTARGET", evaluationFound.editTarget);
  editFormData.append("__EVENTARGUMENT", "");
  editFormData.append("__VIEWSTATE", currentViewState);
  editFormData.append("__VIEWSTATEGENERATOR", currentViewStateGen);
  editFormData.append("__VIEWSTATEENCRYPTED", "");
  editFormData.append("__EVENTVALIDATION", currentEventValidation);

  const editResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: editFormData,
    redirect: "follow"
  });

  const editHtml = await editResponse.text();
  const editParser = new DOMParser();
  const editDoc = editParser.parseFromString(editHtml, "text/html");

  const editViewState = editDoc.querySelector('#__VIEWSTATE')?.value || '';
  const editEventValidation = editDoc.querySelector('#__EVENTVALIDATION')?.value || '';
  const editViewStateGen = editDoc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  // Click Edit button to enable editing
  const enableEditFormData = new FormData();
  enableEditFormData.append("scrollLeft", "0");
  enableEditFormData.append("scrollTop", "0");
  enableEditFormData.append("__EVENTTARGET", "");
  enableEditFormData.append("__EVENTARGUMENT", "");
  enableEditFormData.append("__VIEWSTATE", editViewState);
  enableEditFormData.append("__VIEWSTATEGENERATOR", editViewStateGen);
  enableEditFormData.append("__VIEWSTATEENCRYPTED", "");
  enableEditFormData.append("__EVENTVALIDATION", editEventValidation);
  enableEditFormData.append("cmdEdit", "Edit");

  const enableEditResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: enableEditFormData,
    redirect: "follow"
  });

  const enableEditHtml = await enableEditResponse.text();
  const enableEditDoc = editParser.parseFromString(enableEditHtml, "text/html");

  const enableEditViewState = enableEditDoc.querySelector('#__VIEWSTATE')?.value || '';
  const enableEditEventValidation = enableEditDoc.querySelector('#__EVENTVALIDATION')?.value || '';
  const enableEditViewStateGen = enableEditDoc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  // Click Customize Parameters button
  const customizeFormData = new FormData();
  customizeFormData.append("scrollLeft", "0");
  customizeFormData.append("scrollTop", "0");
  customizeFormData.append("__EVENTTARGET", "");
  customizeFormData.append("__EVENTARGUMENT", "");
  customizeFormData.append("__VIEWSTATE", enableEditViewState);
  customizeFormData.append("__VIEWSTATEGENERATOR", enableEditViewStateGen);
  customizeFormData.append("__VIEWSTATEENCRYPTED", "");
  customizeFormData.append("__EVENTVALIDATION", enableEditEventValidation);
  customizeFormData.append("butParameter", "Customize Parameters");

  const customizeResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: customizeFormData,
    redirect: "follow"
  });

  const customizeHtml = await customizeResponse.text();
  const customizeDoc = editParser.parseFromString(customizeHtml, "text/html");

  // Extract parameters from the grid
  const parameters = [];
  const parameterRows = customizeDoc.querySelectorAll("#grdParameter tbody tr");
  
  for (let row of parameterRows) {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 3) {
      const parameterName = cells[0].textContent.trim();
      const description = cells[1].textContent.trim();
      const valueSpan = cells[2].querySelector("span");
      const value = valueSpan ? valueSpan.textContent.trim() : cells[2].textContent.trim();
      
      if (parameterName) {
        parameters.push({
          parameter: parameterName,
          description: description,
          value: value
        });
      }
    }
  }

  const finalViewState = customizeDoc.querySelector('#__VIEWSTATE')?.value || '';
  const finalEventValidation = customizeDoc.querySelector('#__EVENTVALIDATION')?.value || '';
  const finalViewStateGen = customizeDoc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';
  
  window.evalConfig = {
    viewState: finalViewState,
    eventValidation: finalEventValidation,
    viewStateGen: finalViewStateGen,
    rawData: customizeHtml,
    evaluationName: evaluationFound.name
  };

  return {
    evaluationName: evaluationFound.name,
    description: evaluationFound.description,
    parameters: parameters
  };
});
