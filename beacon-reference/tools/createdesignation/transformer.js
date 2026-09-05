(async function (data, args, reqOptions) {
  const myHeaders = new Headers();

  myHeaders.append(
    "accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  );

  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded = new URLSearchParams();

  // urlencoded.append("ctl00_body_RadScriptManager_HiddenField", ";;HBS:en-GB:1bf6bb2e-a9e3-48c2-8258-789b8d94ae17:64806b3a");

  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__LASTFOCUS", "");
  urlencoded.append("__VIEWSTATE", window.cd.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", window.cd.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", window.cd.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");

  urlencoded.append(
    "ctl00$body$txtName",
    args["ctl00_body_txtName"]
  );

  urlencoded.append(
    "ctl00$body$chksenior",
    args["ctl00_body_chksenior"]
  );

  urlencoded.append(
    "ctl00$body$dpSalary",
    args["ctl00_body_dpSalary"]
  );

  urlencoded.append(
    "ctl00$body$dpNextUpgrade",
    args["ctl00_body_dpNextUpgrade"] || "-1"
  );

  urlencoded.append(
    "ctl00$body$dpnextupgradedsg",
    args["ctl00_body_dpnextupgradedsg"] || "-1"
  );

  urlencoded.append(
    "ctl00$body$cbofunctionRole",
    args["ctl00_body_cbofunctionRole"] || "-1"
  );

  urlencoded.append("ctl00$body$butSave", "Save");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(
    `${location.origin}/hr/EIM/Designation.aspx`,
    requestOptions
  );

  const html = await response.text();

  return "create sucessfully!!";
})