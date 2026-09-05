(async function (data, args, reqOptions) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const urlencoded = new URLSearchParams();
  urlencoded.append("scrollLeft", "0");
  urlencoded.append("scrollTop", "0");
  urlencoded.append("__EVENTTARGET", "");
  urlencoded.append("__EVENTARGUMENT", "");
  urlencoded.append("__VIEWSTATE", window.ca.viewState);
  urlencoded.append("__VIEWSTATEGENERATOR", window.ca.viewStateGen);
  urlencoded.append("__VIEWSTATEENCRYPTED", "");
  urlencoded.append("__EVENTVALIDATION", window.ca.eventValidation);
  urlencoded.append("ctl00$hdnDateFormat", "dd/mm/yy");
  urlencoded.append("ctl00$body$txtName", args.jobDescriptionTypeName);
  urlencoded.append("ctl00$body$dpSalary", args.jobDescriptionCategory);
  urlencoded.append("ctl00$body$butSave", "Save");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/hr/EIM/JdType.aspx`, requestOptions);
  const html = await response.text();
  return "Create Successfully!!";
})
