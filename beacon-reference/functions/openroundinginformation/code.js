(async function (args) {
  //done
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const randomX = Math.floor(Math.random() * 10).toString();
  const randomY = Math.floor(Math.random() * 90 + 10).toString();

  const rawObject = {
    "ctl00$main$RadScriptManager": `ctl00$body$upPnlBody|${args.eventKey}`,
    "ctl00_main_RadScriptManager_HiddenField": "",
    "__EVENTTARGET": "",
    "__EVENTARGUMENT": "",
    "__LASTFOCUS": "",
    "__VIEWSTATE": args.viewState,
    "__VIEWSTATEGENERATOR": args.viewStateGenerator,
    "__SCROLLPOSITIONX": "0",
    "__SCROLLPOSITIONY": "0",
    "__VIEWSTATEENCRYPTED": "",
    "__EVENTVALIDATION": args.eventValidation,

    "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_ROUND_RULE_ID": "",
    "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_ROUND_RULE_NAME": "",
    "ctl00$body$grdsummary$ctl00$ctl02$ctl02$FilterTextBox_ROUND_TYPE": "",

    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox": "1",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState": "",
    "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox": "7",
    "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState": "",

    "ctl00$body$grdsummary$ctl00$ctl04$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl04$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl06$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl06$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl08$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl08$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl10$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl10$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl12$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl12$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl14$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl14$butDeleteGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl16$butEditGrid$isControlEnabled": "True",
    "ctl00$body$grdsummary$ctl00$ctl16$butDeleteGrid$isControlEnabled": "True",

    "ctl00_body_grdsummary_rfltMenu_ClientState": "",
    "ctl00_body_grdsummary_ClientState": "",

    "ctl00$body$tpTest$txtTime": "",
    "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
    "ctl00$hdnCulturDateFormat": "M/d/yyyy",
    "__ASYNCPOST": "true",

    [`${args.eventKey}.x`]: randomX,
    [`${args.eventKey}.y`]: randomY
  };

  // Proper URL-encoding
  const body = new URLSearchParams(rawObject).toString();

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body,
    redirect: "follow"
  };

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();
  const response = await fetch(`${reqOptions}TNA/RoundingInformation.aspx`, requestOptions);
  const data = await response.text();
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


const extractViewStates = extractViewState(data);
BeaconBar.setSharedData("extractViewStates", extractViewStates)
  return data;

});
