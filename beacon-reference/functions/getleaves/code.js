(async function (args) {
  //done
  const req = BeaconBar.getSharedData("getLeave");
  const request = BeaconBar.getSharedData("request");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('absence/ess/ViewSubbordinateLeaveDetail.aspx?subo=0');
  let url;
  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
  } else {
    url = "absence/ess/ViewSubbordinateLeaveDetail.aspx?subo=0"
  }

  const parseDate = (date) => {
    const d = new Date(date);
    if (isNaN(d)) throw new Error("Invalid date format provided.");

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return {
      fullDate: `${yyyy}-${mm}-${dd}`,                       // 2025-01-01
      dateText: `${mm}/${dd}/${yyyy}`,                       // 01/01/2025
      fullDateTime: `${yyyy}-${mm}-${dd}-00-00-00`,          // 2025-01-01-00-00-00
    };
  };
  const today = new Date();
  const todayFormatted = `[${today.getFullYear()},${today.getMonth() + 1},${today.getDate()}]`;


  const from = parseDate(args.fromDate); // single date input
  const to = parseDate(args.toDate);     // single date input

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlencoded = new URLSearchParams();
  urlencoded.append("RadScriptManager_HiddenField", "");
  urlencoded.append("__EVENTTARGET", "ViewSubbordinateLeaveDetail");
  urlencoded.append("__EVENTARGUMENT", JSON.stringify(request));
  urlencoded.append("__VIEWSTATE", req.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", req.viewStateGenerator);
  urlencoded.append("__SCROLLPOSITIONX", "0");
  urlencoded.append("__SCROLLPOSITIONY", "0");
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", req.eventValidation);
  urlencoded.append("RadWindowManager1_ClientState", "");
  urlencoded.append("ctl00$AlertOKButton", "OK");
  urlencoded.append("ctl00$AlertCancelButton", "Cancel");
  urlencoded.append("ctl00$AlertUnableToLoadQuickMenu", "Unable to load quick menus.");
  urlencoded.append("ctl00$hdnSearchEmployeeTxt", "Search Employees");
  urlencoded.append("ctl00$hdnlevBalancePopupTxt", "Leave Balance");

  // FROM DATE
  urlencoded.append("ctl00$body$dtmFromDate", from.fullDate);
  urlencoded.append("body_dtmFromDate_dateInput_text", from.dateText);
  urlencoded.append("ctl00$body$dtmFromDate$dateInput", from.fullDateTime);
  urlencoded.append("body_dtmFromDate_dateInput_ClientState", "");
  urlencoded.append("body_dtmFromDate_calendar_SD", "[]");
  urlencoded.append("body_dtmFromDate_calendar_AD", `[[1980,1,1],[2099,12,30],${todayFormatted}]`);
  urlencoded.append("body_dtmFromDate_ClientState", "");

  // TO DATE
  urlencoded.append("ctl00$body$dtmToDate", to.fullDate);
  urlencoded.append("body_dtmToDate_dateInput_text", to.dateText);
  urlencoded.append("ctl00$body$dtmToDate$dateInput", to.fullDateTime);
  urlencoded.append("body_dtmToDate_dateInput_ClientState", "");
  urlencoded.append("body_dtmToDate_calendar_SD", "[]");
  urlencoded.append("body_dtmToDate_calendar_AD", `[[1980,1,1],[2099,12,30],${todayFormatted}]`);
  urlencoded.append("body_dtmToDate_ClientState", "");

  urlencoded.append("ctl00$body$hdnSupervisorEmpNumber", req.SupervisorEmpNumber);
  urlencoded.append("ctl00$body$hdnIsCompanyDetail", req.comapanydetails);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };
  const digest = await BeaconBar.executeFunction("getDigest")(updateurl.updateParams);
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}${url}&digest=${digest.digest}`, requestOptions);
  const data = await response.text();
  return data;
});
