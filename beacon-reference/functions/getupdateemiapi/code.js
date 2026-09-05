(async function (params, url) {
  const sl = await BeaconBar.getSharedData("sl");
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const body = new URLSearchParams({ ...params });

  const response = await fetch(`${location.origin}/${sl}/${url}`, {
    method: "POST",
    headers: myHeaders,
    body: body,
    redirect: "follow"
  });

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const anchor = doc.querySelector('tr[id^="ctl00_body_grdsummary_ctl00__"] a[href^="javascript:__doPostBack"]');
  const href = anchor?.getAttribute('href') || "";
  const match = href.match(/__doPostBack\('([^']+)'/);
  const postBackCode = match ? match[1] : "";

  const viewState = doc.querySelector('#__VIEWSTATE')?.value || '';
  const eventValidation = doc.querySelector('#__EVENTVALIDATION')?.value || '';
  const viewStateGen = doc.querySelector('#__VIEWSTATEGENERATOR')?.value || '';

  const finalData = {
    rawData: html,
    postBackCode,
    viewState,
    eventValidation,
    viewStateGen
  }
  return finalData;
})
