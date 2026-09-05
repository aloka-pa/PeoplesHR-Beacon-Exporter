(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/SalaryGradeInfo.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const myHeaders = new Headers();

  myHeaders.append(
    "accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  );

  myHeaders.append(
    "accept-language",
    "en-US,en;q=0.9"
  );

  myHeaders.append(
    "x-requested-with",
    "XMLHttpRequest"
  );

  const urlencoded1 = new URLSearchParams();

  urlencoded1.append(
    "ctl00_body_RadScriptManager_HiddenField",
    ";;HBS:en-GB:1bf6bb2e-a9e3-48c2-8258-789b8d94ae17:64806b3a"
  );

  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");

  urlencoded1.append(
    "__EVENTTARGET",
    "ctl00$body$cboCurrType"
  );

  urlencoded1.append("__EVENTARGUMENT", "");
  urlencoded1.append("__LASTFOCUS", "");

  urlencoded1.append(
    "__VIEWSTATE",
    window.sg.viewState
  );

  urlencoded1.append(
    "__VIEWSTATEGENERATOR",
    window.sg.viewStateGen
  );

  urlencoded1.append("__VIEWSTATEENCRYPTED", "");

  urlencoded1.append(
    "__EVENTVALIDATION",
    window.sg.eventValidation
  );

  urlencoded1.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded1.append(
    "ctl00$body$txtsalname",
    args["ctl00_body_txtsalname"]
  );

  urlencoded1.append(
    "ctl00$body$cboCurrType",
    args["ctl00_body_cboCurrType"]
  );

  urlencoded1.append(
    "ctl00$body$optsalary",
    "0"
  );

  urlencoded1.append(
    "ctl00$body$txtMin",
    "0"
  );

  urlencoded1.append(
    "ctl00$body$txtMid",
    "0"
  );

  urlencoded1.append(
    "ctl00$body$txtMax",
    "0"
  );

  urlencoded1.append(
    "ctl00$body$hdnDecimalFormat",
    "2"
  );

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(
    `${location.origin}/${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`,
    requestOptions1
  );

  const html1 = await response1.text();

  const parser1 = new DOMParser();

  const doc1 = parser1.parseFromString(
    html1,
    "text/html"
  );

  const viewState =
    doc1.querySelector("#__VIEWSTATE")?.value || "";

  const eventValidation =
    doc1.querySelector("#__EVENTVALIDATION")?.value || "";

  const viewStateGen =
    doc1.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  const urlencoded2 = new URLSearchParams();

  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__LASTFOCUS", "");

  urlencoded2.append(
    "__VIEWSTATE",
    viewState
  );

  urlencoded2.append(
    "__VIEWSTATEGENERATOR",
    viewStateGen
  );

  urlencoded2.append("__VIEWSTATEENCRYPTED", "");

  urlencoded2.append(
    "__EVENTVALIDATION",
    eventValidation
  );

  urlencoded2.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded2.append(
    "ctl00$body$txtsalname",
    args["ctl00_body_txtsalname"]
  );

  urlencoded2.append(
    "ctl00$body$cboCurrType",
    args["ctl00_body_cboCurrType"]
  );

  urlencoded2.append(
    "ctl00$body$optsalary",
    "0"
  );

  urlencoded2.append(
    "ctl00$body$txtMin",
    args["ctl00_body_txtMin"]
  );

  urlencoded2.append(
    "ctl00$body$txtMid",
    args["ctl00_body_txtMid"]
  );

  urlencoded2.append(
    "ctl00$body$txtMax",
    args["ctl00_body_txtMax"]
  );

  urlencoded2.append(
    "ctl00$body$butSave",
    "Save"
  );

  urlencoded2.append(
    "ctl00$body$hdnDecimalFormat",
    "2"
  );

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(
    `${location.origin}/${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`,
    requestOptions2
  );

  const html2 = await response2.text();

  return "create successfully!";

})