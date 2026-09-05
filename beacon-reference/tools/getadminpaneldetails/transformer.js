(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("TNA/dashboard.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNA/dashboard.aspx');
  let url;
  let details;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl
    details = await BeaconBar.executeFunction("getmodule")(url);
  } else {
    url = "TNA/dashboard.aspx"
    details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/dashboard`);
  }
  // const details = await BeaconBar.executeFunction("getmodule")(`${reqOptions.sl}/TNA/dashboard`);

  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const urlencoded = new URLSearchParams();
  urlencoded.append("RadScriptManager_HiddenField", "");
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", details.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", details.eventValidation);
  urlencoded.append("txtDate", args.date);
  urlencoded.append("butRefress.x", "0");
  urlencoded.append("butRefress.y", "0");
  urlencoded.append("RadDock60_C_ctl00_RadWindowManager1_ClientState", "");
  urlencoded.append("RadDock62_C_ctl00_RadWindowManager1_ClientState", "");
  urlencoded.append("radLeftDock_ClientState", "");
  urlencoded.append("radRightDock_ClientState", "");
  urlencoded.append("hdnCulturDateFormat", "dd/MM/yyyy");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${url}`, requestOptions);
  const text = await response.text();
  const document = new DOMParser().parseFromString(text, 'text/html');

  const dockModules = Array.from(document.querySelectorAll('.raddock.RadDock_Default'));

  const extractedModules = dockModules.map(dock => {
    const title = dock.querySelector('.rdTitle')?.innerText?.trim();
    const content = dock.querySelector('.rdContent')?.innerText?.trim().replace(/\s+/g, ' ');
    return {
      title,
      context: content
    };
  });

  const targetModules = [
    "Reminder",
    "Clock Status",
    "Attendance Info",
    "Attendance Overview"
  ];
  const result = extractedModules.filter(module =>
    targetModules.some(target => module.title?.startsWith(target))
  );
  return result;
});
