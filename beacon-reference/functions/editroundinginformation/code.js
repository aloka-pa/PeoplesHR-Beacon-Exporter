(async function(args) {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");

    const raw = new URLSearchParams({
        "ctl00$main$RadScriptManager": "ctl00$action$upPnlBtn|ctl00$action$ButtonPanel$butEdit$imgbtnSave",
        "ctl00_main_RadScriptManager_HiddenField": "",
        "ctl00$body$txtRoundingPatternName": "Beacons",
        "ctl00$body$Rounding_pattern": "rbtnGeneral",
        "ctl00$body$cboMethod": "1",
        "ctl00$body$txtNumVal": "00:13",
        "ctl00$body$tpTest$txtTime": "",
        "ctl00$action$ButtonPanel$butNew$isControlEnabled": "True",
        "ctl00$action$ButtonPanel$butEdit$isControlEnabled": "True",
        "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
        "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
        "ctl00$hdnCulturDateFormat": "M/d/yyyy",
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "__LASTFOCUS": "",
        "__VIEWSTATE": args.viewState,
        "__VIEWSTATEENCRYPTED" : "",
        "__ASYNCPOST":true ,
        "ctl00$action$ButtonPanel$butEdit$imgbtnSave": Edit
        })

const response = await fetch(`https://devtest-echoengineers.phrsandbox.dev/hrb5/TNA/RoundingInformation.aspx`, requestOptions)
  const data = await  response.text();
 return data ;
})