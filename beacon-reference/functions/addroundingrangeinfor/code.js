(async function (state, args) {
  //done
  try {
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
    myHeaders.append("x-requested-with", "XMLHttpRequest");


    const raw = new URLSearchParams({
      "ctl00$main$RadScriptManager": "ctl00$body$upPnlDetailView|ctl00$body$btnAdd",
      "ctl00_main_RadScriptManager_HiddenField": "",
      "ctl00$body$txtRoundingPatternName": args.roundingPatternName,
      "ctl00$body$Rounding_pattern": "rbtnRange",
      "ctl00$body$txtNumFrom$txtTime": args.numFrom || "",
      "ctl00$body$txtNumTo$txtTime": args.numTo || "",
      "ctl00$body$txtNumValue$txtTime": args.textnumValue || "",
      "ctl00$body$tpTest$txtTime": "",
      "ctl00$action$ButtonPanel$butDelete$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butReset$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSave$isControlEnabled": "True",
      "ctl00$action$ButtonPanel$butSummary$isControlEnabled": "True",
      "ctl00$hdnCulturDateFormat": "M/d/yyyy",
      "__EVENTTARGET": "",
      "__EVENTARGUMENT": "",
      "__LASTFOCUS": "",
      "__VIEWSTATE": state.viewState,
      "__VIEWSTATEGENERATOR": state.viewStateGenerator,
      "__SCROLLPOSITIONX": "0",
      "__SCROLLPOSITIONY": "0",
      "__EVENTVALIDATION": state.eventValidation,
      "__VIEWSTATEENCRYPTED": "",
      "__ASYNCPOST": "true",
      "ctl00$body$btnAdd": "Add"
    }).toString();

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    const reqOptions = await BeaconBar.executeFunction('reqOptions')();
    const response = await fetch(`${reqOptions}TNA/RoundingInformation.aspx`, requestOptions);
    const data = await response.text();
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

    const datss = extractViewState(data);

    return datss;

  } catch (error) {
    return "Error fetching data";
  }
});
