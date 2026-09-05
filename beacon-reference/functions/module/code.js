(async function (params, url) {
  //done
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const body = new URLSearchParams({ ...params });

  // Split URL into path and query
  const [rawPath, rawQuery] = url.split("?");
  const cleanPath = rawPath.replace(/\.aspx$/, "");  // Remove .aspx if included
  const fullUrl = `${location.origin}/${cleanPath}.aspx${rawQuery ? `?${rawQuery}` : ""}`;

  const response = await fetch(fullUrl, {
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
  const publicKey = doc.querySelector("#ctl00_body_txtPublicKey")?.value || "";

  const finalData = {
    rawData: html,
    postBackCode,
    viewState,
    eventValidation,
    viewStateGen,
    publicKey
  };
  return finalData;
});
