(function (args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  return {
    url: `${location.origin}/${reqOptions.sl}/EIMV9/SetupConfiguration/GetSectiondata/`,
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      "SectionList": [window.list],
      "SectionCode": args.sessionCode,
      "profileCode": args.profileCode,
      "profileName": null,
      "DataList": [],
      "BackButtonCode": "0"
    })
  };
})