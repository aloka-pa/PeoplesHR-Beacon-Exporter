(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("absence/ess/ViewSubbordinateLeaveDetail.aspx?subo=0")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  const saveEmployeeSelectResult = await BeaconBar.executeFunction("saveEmployeeSelectResult")(args.selectingEmployeeIdsOrName);
   BeaconBar.setSharedData("saveEmployeeSelectResult", saveEmployeeSelectResult);
  try {
    const leaveDetails = await BeaconBar.executeFunction("getLeave")(args);
    const leaveDetail = await BeaconBar.executeFunction("getLeaves")(args);
   BeaconBar.setSharedData("leaveDetails", leaveDetails)
   function extractLeaveDataFromHTML(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const table = doc.querySelector("#body_SubbordinateLeaveHistoryView_grdStatutory_ctl00");
  const rows = table?.querySelectorAll("tr");

  const data = [];
  let currentEmployeeName = "";

  rows.forEach((row) => {
    if (row.classList.contains("GroupHeader_Default")) {
      const nameCell = row.querySelector("td[title*='Click to view Leave Balances']");
      const nameText = nameCell?.innerText?.trim() || "";
      // Extract actual name from: "Name: 000002 - Peter Pascal"
      const match = nameText.match(/Name:\s*(.+)/);
      currentEmployeeName = match ? match[1] : "";
    }

    if (
      row.classList.contains("GridRow_Default") ||
      row.classList.contains("GridAltRow_Default")
    ) {
      const cells = row.querySelectorAll("td");

      const leaveRecord = {
        employee: currentEmployeeName,
        fromDate: cells[1]?.textContent.trim(),
        toDate: cells[2]?.textContent.trim(),
        leaveType: cells[3]?.textContent.trim(),
        days: cells[4]?.textContent.trim(),
        status: cells[6]?.textContent.trim(),
        comments: cells[7]?.textContent.trim(),
        coveringEmployee: cells[8]?.textContent.trim(),
        initiatedBy: cells[9]?.textContent.trim(),
        cancellationReason: cells[10]?.textContent.trim(),
      };

      data.push(leaveRecord);
    }
  });

  return data;
}
function extractShortLeaveFromHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const rows = doc.querySelectorAll('#body_SubbordinateLeaveHistoryView_grdShort_ctl00 tbody tr');
    const data = [];

    let currentName = "";

    rows.forEach(row => {
        if (row.classList.contains('GroupHeader_Default')) {
            const nameText = row.querySelector('p')?.textContent.trim() || "";
            const match = nameText.match(/Name:\s*(.*)/);
            currentName = match ? match[1] : "";
        } else {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 9) {
                data.push({
                    name: currentName,
                    date: cells[1].textContent.trim(),
                    fromTime: cells[2].textContent.trim(),
                    toTime: cells[3].textContent.trim(),
                    leaveType: cells[4].textContent.trim(),
                    status: cells[5].textContent.trim(),
                    leaveComments: cells[6].textContent.trim(),
                    initiatedBy: cells[7].textContent.trim(),
                    cancellationReason: cells[8].textContent.trim()
                });
            }
        }
    });

    return data;
}

const datasss = extractLeaveDataFromHTML(leaveDetail)
const shortleaveDetails = extractShortLeaveFromHTML(leaveDetail);
const companyleaveDetails = datasss.slice(0, 10)
if(datasss.length>10){
 BeaconBar.executeFunction("downloadcsv")(datasss);
}
   return {
  shortleaveDetails: shortleaveDetails.length < 1 
    ? "No employees are on leave" 
    : shortleaveDetails,
  companyleaveDetails
};

  } catch (error) {
    return {
      ...data,
      error: error.message || "An unknown error occurred"
    };
  }
});
