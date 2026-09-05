(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/BenefitClearingHead.aspx")) {
    return {
      status: "NO_ACCESS",
      message: "You do not have access to Benefit Clearance Head screen. Please contact HR Admin."
    };
  }

  const headers = new Headers();
  headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");

  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/BenefitClearingHead.aspx");
  const url = updateUrl.updateUrl
    ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
    : `${window.origin}/${reqOptions.sl}/EIM/BenefitClearingHead.aspx`;

  const parser = new DOMParser();

  // Get the page with all benefit clearance head data
  const response = await fetch(url, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    return {
      status: "ERROR",
      message: `Failed to load Benefit Clearance Head page, status: ${response.status}`
    };
  }

  const htmlText = await response.text();
  const doc = parser.parseFromString(htmlText, "text/html");

  // Extract all table rows
  const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");

  if (!rows || rows.length === 0) {
    return {
      status: "NOT_FOUND",
      message: "No benefit clearance head assignments found"
    };
  }

  const assignments = [];

  for (const row of rows) {
    const cells = row.querySelectorAll("td");
    if (cells.length < 3) continue;

    const positionName = cells[0]?.textContent.trim();
    const employeeNumber = cells[1]?.textContent.trim();
    const employeeName = cells[2]?.textContent.trim();

    // Check if position has an assigned employee
    const isAssigned = employeeNumber !== "" && employeeNumber !== "&nbsp;" && employeeName !== "" && employeeName !== "&nbsp;";

    assignments.push({
      positionName: positionName,
      employeeNumber: isAssigned ? employeeNumber : null,
      employeeName: isAssigned ? employeeName : null,
      isAssigned: isAssigned,
      status: isAssigned ? "Assigned" : "Vacant"
    });
  }

  // Calculate summary statistics
  const totalPositions = assignments.length;
  const assignedPositions = assignments.filter(a => a.isAssigned).length;
  const vacantPositions = totalPositions - assignedPositions;

  return {
    status: "SUCCESS",
    message: `Retrieved ${totalPositions} benefit clearance head position(s)`,
    summary: {
      totalPositions: totalPositions,
      assignedPositions: assignedPositions,
      vacantPositions: vacantPositions
    },
    assignments: assignments
  };
})