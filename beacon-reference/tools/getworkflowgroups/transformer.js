(async function (data, args) {
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  if (!BeaconBar.user.metaData.menus.includes("WorkFlow_v6/DefineWorkflowGroup.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('WorkFlow_v6/DefineWorkflowGroup.aspx');
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
    body.append("__EVENTTARGET", "ctl00$body$grdWFGroups");
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

  const extractTableData = (htmlString) => {
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    const table = doc.getElementById("ctl00_body_grdWFGroups");
    if (!table) return [];

    const rows = table.querySelectorAll("tr");
    const results = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].querySelectorAll("td");
      if (cols.length > 0) {
        const description = cols[0]?.textContent.trim();
        const editButton = cols[1]?.querySelector('input[title="Edit"]');
        const eventKey = editButton?.getAttribute("name") || "";

        if (description) {
          results.push({ Description: description, EventKey: eventKey });
        }
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
  let lastSuccessfulViewState = null;

  const maxPagesEstimate = 50;
  let pagesFetched = 0;

  while (hasMorePages && pagesFetched < maxPagesEstimate) {
    const viewStateInfo = extractHiddenFields(currentHtml);
    // Check if ViewState fields are empty (indicates end of pagination or error)
    if (!viewStateInfo.viewState || !viewStateInfo.eventValidation) {
      
      // Use the last successful ViewState if available
      if (lastSuccessfulViewState) {
        BeaconBar.setSharedData("failedViewState", {
          viewState: lastSuccessfulViewState,
          page: page,
          reason: "ViewState fields empty - likely end of pagination",
          emptyViewState: viewStateInfo,
          timestamp: new Date().toISOString()
        });
      }
      
      hasMorePages = false;
      break;
    }
    
    const pageData = extractTableData(currentHtml);
    // Check if data extraction was successful
    if (!pageData || pageData.length === 0) {
      
      // Store failed ViewState when no data is extracted
      BeaconBar.setSharedData("failedViewState", {
        viewState: viewStateInfo,
        page: page,
        reason: "No data extracted from page",
        timestamp: new Date().toISOString()
      });
      
      hasMorePages = false;
      break;
    }

    // Data extraction was successful
    allResults = allResults.concat(pageData);
    lastSuccessfulViewState = viewStateInfo; // Store last successful ViewState
    pagesFetched += 1;

    // Store working ViewState near the end
    if (pagesFetched === maxPagesEstimate - 3) {
      BeaconBar.setSharedData("workFlowGroups", viewStateInfo);
    }

    // Try to fetch next page
    const payloadBody = buildPostBody(page + 1, viewStateInfo);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers,
        body: payloadBody,
        redirect: "follow"
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Store failed ViewState on HTTP error
        BeaconBar.setSharedData("failedViewState", {
          viewState: viewStateInfo,
          page: page + 1,
          status: response.status,
          statusText: response.statusText,
          reason: "HTTP request failed",
          timestamp: new Date().toISOString()
        });
        
        hasMorePages = false;
        break;
      }

      currentHtml = await response.text();
      page += 1;
      
    } catch (err) {
      // Store failed ViewState on network/fetch error
      BeaconBar.setSharedData("failedViewState", {
        viewState: viewStateInfo,
        page: page + 1,
        error: err.message || String(err),
        reason: "Network or fetch error",
        timestamp: new Date().toISOString()
      });
      
      hasMorePages = false;
      break;
    }
  }

  // Store all results and last successful ViewState
  BeaconBar.setSharedData("allResultsgroups", allResults);
  if (lastSuccessfulViewState) {
    BeaconBar.setSharedData("lastSuccessfulViewState", lastSuccessfulViewState);
  }
  return allResults.map(({ Description }) => ({ Description }));
});