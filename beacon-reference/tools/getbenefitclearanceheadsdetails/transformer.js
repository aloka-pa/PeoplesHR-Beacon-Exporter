(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("BenefitClearingHead");

  const searchResponse = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ctl04",
    __EVENTARGUMENT: "",
    __VIEWSTATE: details.viewState,
    __VIEWSTATEGENERATOR: details.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: details.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00_body_RadWindowManager1_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "100000",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",
    "ctl00_body_grdsummary_ClientState": ""
  }, "BenefitClearingHead");

  const result = Array.from(
    new DOMParser()
      .parseFromString(searchResponse.rawData, "text/html")
      .querySelectorAll("tbody tr")
  ).reduce((acc, row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 3) {
      acc.push({
        designation: cells[0].textContent.trim(),
        code: cells[1].textContent.trim(),
        name: cells[2].textContent.trim()
      });
    }
    return acc;
  }, []);

  return result;
});
