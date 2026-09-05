(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("AssignNonCashBenifit");

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
  }, "AssignNonCashBenifit");

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
    "ctl00_body_grdavailable_ClientState": "",
    "ctl00$body$butEdit": "Edit"
  }, "AssignNonCashBenifit");

  window.noncashBenefit = postBackResponse

  const parser = new DOMParser();
  const doc = parser.parseFromString(postBackResponse.rawData, "text/html");

  const availableTable = doc.querySelector("#ctl00_body_grdavailable_ctl00");
  const availableBenefits = [];

  let currentCategory = "";

  if (availableTable) {
    const rows = availableTable.querySelectorAll("tbody tr");

    for (const row of rows) {
      if (row.classList.contains("GroupHeader_Default")) {
        const categoryText = row.querySelector("td[colspan] p")?.textContent || "";
        const match = categoryText.match(/Category\s*:\s*(.*)/i);
        currentCategory = match ? match[1].trim() : "";
      } else if (
        row.classList.contains("GridRow_Default") ||
        row.classList.contains("GridAltRow_Default")
      ) {
        const benefitCell = row.querySelectorAll("td")[1];
        const name = row.querySelectorAll("td")[2];
        if (benefitCell) {
          const input = name.querySelector('input');
          const identifier = input ? input.name : null;
          availableBenefits.push({
            category: currentCategory,
            benefit: benefitCell.textContent.trim(),
            identifier: identifier
          });
        }
      }
    }
  }

  const allocatedTable = doc.querySelector("#ctl00_body_grdallocated");
  const allocatedBenefits = [];

  if (allocatedTable) {
    const rows = allocatedTable.querySelectorAll("tr");

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
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

  const noncashbenefitassign = {
    availableBenefits,
    allocatedBenefits
  };
  return noncashbenefitassign;
});
