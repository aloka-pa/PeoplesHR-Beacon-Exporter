(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", window.cp.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", window.cp.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", window.cp.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");

  urlencoded.append(
    "ctl00$body$txtName",
    args["ctl00_body_txtName"]
  );

  urlencoded.append(
    "ctl00$body$dpSalary",
    args["ctl00_body_dpSalary"]
  );

  if (args["ctl00_body_chkTop"] === "on") {
    urlencoded.append("ctl00$body$chkTop", "on");
  } else {
    urlencoded.append(
      "ctl00$body$dpNextUpgrade",
      args["ctl00_body_dpNextUpgrade"] || "-1"
    );
  }

  urlencoded.append(
    "ctl00$body$nuLevel",
    args["ctl00_body_nuLevel"]?.toString() || ""
  );

  urlencoded.append("ctl00$body$butSave", "Save");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(
    `${location.origin}/hr/EIM/CorporeteTitle.aspx`,
    requestOptions
  );

  const html = await response.text();

  return "Created successfully!!";
})