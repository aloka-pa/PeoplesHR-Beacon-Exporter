(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNAVUE/app/RosterEmployee?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }
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

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNAVUE/app/RosterEmployee?mvc=1');
  let urls;

  if (updateurl.updateUrl) {
    urls = updateurl.updateUrl
  } else {
    urls = "TNAVUE/app/RosterEmployee?mvc=1"
  }

  const digest = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);

  const details = await fetch(`${location.origin}/${reqOptions.sl}/${urls}&digest=${digest.digest}`, requestOptions);
  const text = await details.text();

  const parser = new DOMParser();
  const document = parser.parseFromString(text, "text/html");

  const html = document.documentElement.innerHTML;
  const empMatch = html.match(/window\.\$LoggedEmpNumber\s*=\s*'([^']+)'/);
  const loginEmpNumber = empMatch ? empMatch[1] : 'N/A';
  const userIdMatch = html.match(/window\.\$LoggedUserId\s*=\s*'([^']+)'/);
  const loginUserId = userIdMatch ? userIdMatch[1] : 'N/A';

  const url = `${location.origin}/${reqOptions.sl}/tnavue/service/api/Roster/GetRoleWiseRosterGroupData`;

  const payload = {
    loginEmpNumber: loginEmpNumber,
    loginUserId: loginUserId,
    adminRoleCode: 20
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      "x-requested-with": "XMLHttpRequest"
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return await response.json();
})