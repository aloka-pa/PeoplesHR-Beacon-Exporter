(async function (data, args, reqOptions) {

  const myHeaders = new Headers();

  myHeaders.append(
    "accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  );

  myHeaders.append(
    "accept-language",
    "en-US,en;q=0.9"
  );

  const urlencoded2 = new URLSearchParams();

  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");

  urlencoded2.append(
    "__VIEWSTATE",
    window.sls.viewState
  );

  urlencoded2.append(
    "__VIEWSTATEGENERATOR",
    window.sls.viewStateGen
  );

  urlencoded2.append("__VIEWSTATEENCRYPTED", "");

  urlencoded2.append(
    "__EVENTVALIDATION",
    window.sls.eventValidation
  );

  urlencoded2.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded2.append(
    "ctl00$body$hdnIsHead",
    ""
  );

  urlencoded2.append(
    "ctl00$body$hdnEditItemIndex",
    ""
  );

  urlencoded2.append(
    "ctl00$body$txtName",
    args["ctl00_body_txtName"]
  );

  urlencoded2.append(
    "ctl00$body$ddlLocation",
    args["ctl00_body_ddlLocation"]
  );

  urlencoded2.append(
    "ctl00$body$txtHeadName",
    args["ctl00_body_txtHeadName"] || ""
  );

  urlencoded2.append(
    "ctl00$body$CmdSave",
    "Save"
  );

  urlencoded2.append(
    "ctl00$body$hdnDefCountry",
    ""
  );

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(
    `${location.origin}/hr/eim/SubLocation.aspx`,
    requestOptions2
  );

  const result = await response2.text();

  return "Successfully created!";

})