(async function (args) {
  //done
  const myHeaders = new Headers({
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-requested-with": "XMLHttpRequest"
  });
  let views;
  if (args.pattern === "Range") {
    const viewss = await BeaconBar.executeFunction("submitrange")(BeaconBar.getSharedData("extractViewStates"), args);
    views = await BeaconBar.executeFunction("addRoundingRangeInfor")(viewss, args)
  } else {
    views = BeaconBar.getSharedData("extractViewStates");
    //  views  = await BeaconBar.executeFunction("generalpatternroundInfor")(viewssss , args)
  }

  const data = {
    "ctl00_main_RadScriptManager_HiddenField": "",
    "ctl00$body$txtRoundingPatternName": args.roundingPatternName || "",
    "ctl00$body$tpTest$txtTime": "",
    "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
    "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": views.viewState,
    "__VIEWSTATEGENERATOR": views.viewStateGenerator,
    "__SCROLLPOSITIONX": "0",
    "__SCROLLPOSITIONY": "0",
    "__EVENTVALIDATION": views.eventValidation,
    "__VIEWSTATEENCRYPTED": "",
    "__ASYNCPOST": "true",
    "ctl00$action$ButtonPanel$butSave$imgbtnSave": "Save"
  };

  if (args.pattern === "General") {
    data["ctl00$main$RadScriptManager"] = "ctl00$body$upPnlDetailView|ctl00$body$cboMethod";
    data["__EVENTTARGET"] = "ctl00$body$cboMethod";
    data["ctl00$body$Rounding_pattern"] = "rbtnGeneral";
    data["ctl00$body$cboMethod"] = args.method || "";
    data["ctl00$body$txtNumVal"] = args.numVal || "";
  } else if (args.pattern === "Range") {
    data["ctl00$main$RadScriptManager"] = "ctl00$action$upPnlBtn|ctl00$action$ButtonPanel$butSave$imgbtnSave";
    data["__EVENTTARGET"] = "";
    data["ctl00$body$Rounding_pattern"] = "rbtnRange";
    data["ctl00$body$txtNumFrom$txtTime"] = args.numFrom || "";
    data["ctl00$body$txtNumTo$txtTime"] = args.numTo || "";
    data["ctl00$body$txtNumValue$txtTime"] = args.textnumValue || "";
  }

  const raw = new URLSearchParams(data).toString();

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  try {
    const response = await fetch(`${reqOptions}TNA/RoundingInformation.aspx`, requestOptions);
    const result = await response.text();
  } catch (error) {
  }
})
