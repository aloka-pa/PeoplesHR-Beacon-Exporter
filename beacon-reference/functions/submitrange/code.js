async function submitRoundingPattern(viewS, args) {
  //done
  const myHeaders = new Headers({
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-requested-with": "XMLHttpRequest"

  });

  const raw = new URLSearchParams({
    "ctl00$main$RadScriptManager": "ctl00$body$upPnlDetailView|ctl00$body$rbtnRange",
    "ctl00_main_RadScriptManager_HiddenField": "",
    "ctl00$body$txtRoundingPatternName": args.roundingPatternName,
    "ctl00$body$Rounding_pattern": "rbtnRange",
    "ctl00$body$cboMethod": args.method || "2",
    "ctl00$body$txtNumVal": args.numVal || "00:30",
    "ctl00$body$tpTest$txtTime": "",
    "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
    "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    "__EVENTTARGET": "ctl00$body$rbtnRange",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": viewS.viewState,
    "__VIEWSTATEGENERATOR": viewS.viewStateGenerator || "79BC7E24",
    "__SCROLLPOSITIONX": "0",
    "__SCROLLPOSITIONY": "0",
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": viewS.eventValidation,
    "__ASYNCPOST": "true"
  }).toString();

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const response = await fetch(`${reqOptions}TNA/RoundingInformation.aspx`, requestOptions);
    const result = await response.text();
    function extractViewState(htmlText) {
      const data = {};

      const regexMap = {
        viewState: /__VIEWSTATE\|([^|]+)/,
        viewStateGenerator: /__VIEWSTATEGENERATOR\|([^|]+)/,
        eventValidation: /__EVENTVALIDATION\|([^|]+)/,
        eventTarget: /postBackControlIDs\|\|([^|,\n]+)/ // First one from list
      };

      for (const [key, regex] of Object.entries(regexMap)) {
        const match = htmlText.match(regex);
        if (match) {
          data[key] = decodeURIComponent(match[1]);
        } else {
        }
      }

      return data;
    }
    const resp = extractViewState(result)
    return resp;

  } catch (error) {
    throw error;
  }
}
