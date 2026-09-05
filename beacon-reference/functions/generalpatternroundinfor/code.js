(async function(state , args ){
  const reqOptions = await BeaconBar.executeFunction('reqOptions')()
  const url = `${reqOptions}TNA/RoundingInformation.aspx`;

  const headers = new Headers({
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
  });

  const body = new URLSearchParams({
    "ctl00$main$RadScriptManager": "ctl00$body$upPnlDetailView|ctl00$body$rbtnGeneral",
    "ctl00_main_RadScriptManager_HiddenField": "",
    "ctl00$body$txtRoundingPatternName": args.roundingPatternName,
    "ctl00$body$Rounding_pattern": "rbtnGeneral",
    "ctl00$body$txtNumFrom$txtTime": "",
    "ctl00$body$txtNumTo$txtTime": "",
    "ctl00$body$txtNumValue$txtTime": "",
    "ctl00$body$grdRange$ctl00$ctl04$butEditGrid$isControlEnabled": "",
    "ctl00$body$grdRange$ctl00$ctl04$butDeleteGrid$isControlEnabled": "",
    "ctl00_body_grdRange_ClientState": "",
    "ctl00$body$tpTest$txtTime": "",
    "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
    "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
    "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    "__EVENTTARGET": "ctl00$body$rbtnGeneral",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": state.viewState, 
    "__VIEWSTATEGENERATOR": state.viewStateGenerator,
    "__SCROLLPOSITIONX": "0",
    "__SCROLLPOSITIONY": "0",
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": state.eventValidation, 
    "__ASYNCPOST": "true"
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      redirect: "follow"
    });
    const result = await response.text();
        function extractViewState(htmlText) {
  const data = {};

  const regexMap = {
    viewState: /__VIEWSTATE\|([^|]+)/,
    viewStateGenerator: /__VIEWSTATEGENERATOR\|([^|]+)/,
    eventValidation: /__EVENTVALIDATION\|([^|]+)/,
    eventTarget: /postBackControlIDs\|\|([^|,\n]+)/
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
const res = extractViewState(result);
    return res;

  } catch (error) {
    return null;
  }
})