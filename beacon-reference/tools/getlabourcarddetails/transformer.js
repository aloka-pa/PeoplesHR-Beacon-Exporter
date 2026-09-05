(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("home/rendermodulemenus?mid=2")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
  async function payload(url) {
    const updateurl = await BeaconBar.executeFunction("updateUrlParams")(url);

    if (updateurl.updateUrl) {
      return {
        pageUrl: updateurl.updateUrl,
        param: updateurl.updateParams
      }
    } else {
      return {
        pageUrl: url,
        param: ""
      }
    }
  }

  const updateUrlData = await payload("home/rendermodulemenus?mid=2");
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${updateUrlData.pageUrl}&_=${Date.now()}`, requestOptions);
  const text = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  const anchors = doc.querySelectorAll('a');
  let customPageId = null;

  anchors.forEach(anchor => {
    const onclick = anchor.getAttribute('onclick');
    const match = onclick?.match(/customPage=(\d+)/);
    if (match) customPageId = match[1];
  });

  const url = `${location.origin}/${reqOptions.sl}/Dynamic-PG/service/api/DynamicClientApi/GetDynamicSummaryPageRecords`;

  const headers = {
    'accept': 'application/json, text/plain, */*',
    'content-type': 'application/json;charset=UTF-8',
    "x-requested-with": "XMLHttpRequest"
  };

  const body = {
    sort: "",
    page: 1,
    per_page: 1000,
    customPage: customPageId,
    selfService: "0"
  };

  const response1 = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
    credentials: 'include'
  });

  const labourCardDetails = await response1.json();
  return labourCardDetails.DataObj;
})
