(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("AssignCashBenifit");

  const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "ctl00$body$dpsalGrsade",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: details.viewState,
    __VIEWSTATEGENERATOR: details.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: details.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$dpsalGrsade": args.salaryGradeCode
  }, "AssignCashBenifit");

  const postBackResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: searchResponse.viewState,
    __VIEWSTATEGENERATOR: searchResponse.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: searchResponse.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$dpsalGrsade": args.salaryGradeCode,
    "ctl00$body$butEdit": "Edit"
  }, "AssignCashBenifit");

  window.cashBenefit = postBackResponse;

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const availableTable = doc.getElementById("ctl00_body_grdavailable");
  const availableBenefits = [];

  if (availableTable) {
    const availableRows = availableTable.querySelectorAll("tr");
    for (let i = 1; i < availableRows.length; i++) {
      const cells = availableRows[i].querySelectorAll("td");
      if (cells.length >= 2) {
        const benefit = cells[0].textContent.trim();
        const quantity = cells[1].textContent.trim();
        const input = cells[2].querySelector('input');
        const identifier = input ? input.name : null;
        availableBenefits.push({ benefit, quantity, identifier });
      }
    }
  }

  const allocatedTable = doc.getElementById("ctl00_body_grdallocated");
  const allocatedBenefits = [];

  if (allocatedTable) {
    const allocatedRows = allocatedTable.querySelectorAll("tr");
    for (let i = 1; i < allocatedRows.length; i++) {
      const cells = allocatedRows[i].querySelectorAll("td");
      if (cells.length >= 2) {
        const benefit = cells[0].textContent.trim();
        const quantity = cells[1].textContent.trim();
        const editAnchor = cells[2].querySelector('a');
        let editId = null;
        if (editAnchor) {
          const match = editAnchor.getAttribute('href').match(/__doPostBack\('([^']+)'/);
          if (match) {
            editId = match[1];
          }
        }
        allocatedBenefits.push({ benefit, quantity, editId });
      }
    }
  }

  const cashbenefitassign = {
    availableBenefits,
    allocatedBenefits
  }
  return cashbenefitassign;
});
