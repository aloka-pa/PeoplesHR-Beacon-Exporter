(async function (params, url) {
  //done
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const body = new URLSearchParams({ ...params });

  const response = await fetch(`${location.origin}/${url}`, {
    method: "POST",
    headers: myHeaders,
    body: body,
    redirect: "follow"
  });

  const finalData = await response.text();
  return finalData;
});
