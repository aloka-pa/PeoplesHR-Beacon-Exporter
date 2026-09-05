(async function (data, args) {
  if (!BeaconBar.user.metaData.menus.includes("WorkFlow_v6/DefineWorkflowType.aspx")) {
    return "you don't have access to get the workflow details . Please check with the HR Admin";
  }
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('WorkFlow_v6/DefineWorkflowType.aspx');
  const baseUrl = `${reqOptions}${updateurl.updateUrl}`;

  const headers = new Headers({
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/x-www-form-urlencoded",
    "x-requested-with" : "XMLHttpRequest"
  });

  const buildPostBody = (pageNumber, viewStateInfo) => {
    const body = new URLSearchParams();
    body.append("ctl00_body_RadScriptManager1_HiddenField", "");
    body.append("__EVENTTARGET", "ctl00$body$grdWFTypes");
    body.append("__EVENTARGUMENT", `Page$${pageNumber}`);
    body.append("__VIEWSTATE", viewStateInfo.viewState);
    body.append("__VIEWSTATEGENERATOR", viewStateInfo.viewStateGenerator);
    body.append("__VIEWSTATEENCRYPTED", "");
    body.append("__EVENTVALIDATION", viewStateInfo.eventValidation);
    body.append("ctl00_body_RadWindowManager1_ClientState", "");
    body.append("ctl00$body$hdnFlModID", "");
    body.append("ctl00$body$hdnFldTypeCodeStatus", "");
    body.append("ctl00$body$hdnFldTypeCode", "");
    return body;
  };

  const extractHiddenFields = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return {
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGenerator: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || "",
    };
  };

  const extractTableData = (htmlString, viewStateInfo, pageNumber) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    const table = doc.getElementById("ctl00_body_grdWFTypes");
    if (!table) return [];

    const rows = table.querySelectorAll("tr");
    const results = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].querySelectorAll("td");

      if (cols.length >= 2) {
        const module = cols[0].textContent.trim();
        const workflowType = cols[1].textContent.trim();
        const editButton = cols[2]?.querySelector('input[title="Edit"]');
        const eventKey = editButton?.getAttribute("name") || "";

        if (/^\d+$/.test(module) || /^\d+$/.test(workflowType)) continue;

        results.push({
          Module: module,
          WorkflowType: workflowType,
          EventKey: eventKey,
          PageNumber: pageNumber,
          ViewState: {
            viewState: viewStateInfo.viewState,
            viewStateGenerator: viewStateInfo.viewStateGenerator,
            eventValidation: viewStateInfo.eventValidation
          }
        });
      }
    }

    return results;
  };

  let allResults = [];

  const initialResponse = await fetch(baseUrl, { method: "GET", headers });
  const initialHtml = await initialResponse.text();

  let page = 1;
  let hasMorePages = true;
  let currentHtml = initialHtml;

  const maxPages = 50;
  let pagesFetched = 0;

  while (hasMorePages && pagesFetched < maxPages) {
    const viewStateInfo = extractHiddenFields(currentHtml);
    const pageData = extractTableData(currentHtml, viewStateInfo, page);

    if (!pageData || pageData.length === 0) {
      hasMorePages = false;
      break;
    }

    allResults = allResults.concat(pageData);
    pagesFetched += 1;

    const payloadBody = buildPostBody(page + 1, viewStateInfo);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers,
        body: payloadBody,
        redirect: "follow",
      });

      if (!response.ok) {
        const errorHtml = await response.text();
        throw {
          page,
          status: response.status,
          statusText: response.statusText,
          viewState: viewStateInfo,
          payload: payloadBody.toString(),
          html: errorHtml
        };
      }

      currentHtml = await response.text();
      page += 1;

    } catch (err) {
      BeaconBar.setSharedData("failedViewState_WFType", err.viewState);
      break;
    }
  }
  BeaconBar.setSharedData("allWorkflowTypesWithViewState", allResults);

  return allResults.map(x => {
    return {
      Module: x.Module,
      WorkflowType: x.WorkflowType
    };
  });

});