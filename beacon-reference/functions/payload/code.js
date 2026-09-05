(async function (pathName, htmlText, raw) {
  //done
  let data = {};

  if (raw) {
    // Extract viewstate-related values from raw string
    const regexMap = {
      viewState: /__VIEWSTATE\|([^|]+)/,
      viewStateGenerator: /__VIEWSTATEGENERATOR\|([^|]+)/,
      eventValidation: /__EVENTVALIDATION\|([^|]+)/,
      eventTarget: /postBackControlIDs\|\|([^|,\n]+)/ // First one in list
    };

    for (const [key, regex] of Object.entries(regexMap)) {
      const match = htmlText.match(regex);
      if (match) {
        data[key] = decodeURIComponent(match[1]);
      }
    }
  } else {
    // Parse DOM and extract values
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    data.viewState = doc.querySelector("#__VIEWSTATE")?.value || null;
    data.viewStateGenerator = doc.querySelector("#__VIEWSTATEGENERATOR")?.value || null;
    data.eventValidation = doc.querySelector("#__EVENTVALIDATION")?.value || null;

    // Dynamically extract __EVENTTARGET from a dropdown using __doPostBack
    const dropdown = doc.querySelector('select[onchange*="__doPostBack"]');
    if (dropdown) {
      const onchangeAttr = dropdown.getAttribute("onchange");
      const match = /__doPostBack\('([^']+)'/.exec(onchangeAttr);
      if (match) data.eventTarget = match[1];
    }
  }

  // Save if valid
  if (data.viewState && data.viewStateGenerator) {
    // await BeaconBar.resetSharedData(pathName);
    // await BeaconBar.setSharedData(pathName, data);
    localStorage.removeItem(pathName);
    localStorage.setItem(pathName, JSON.stringify(data));
  } else {
  }
})