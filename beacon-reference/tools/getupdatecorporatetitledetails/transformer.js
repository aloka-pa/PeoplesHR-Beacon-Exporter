(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/CorporeteTitle.aspx"
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

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/CorporeteTitle.aspx");

  let url;

  if (updateurl.updateUrl) {
    url =
      `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url =
      `${window.origin}/${reqOptions.sl}/EIM/CorporeteTitle.aspx`;
  }

  const urlencoded1 = new URLSearchParams();

  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");

  urlencoded1.append(
    "__VIEWSTATE",
    window.ct.viewState
  );

  urlencoded1.append(
    "__VIEWSTATEGENERATOR",
    window.ct.viewStateGen
  );

  urlencoded1.append("__VIEWSTATEENCRYPTED", "");

  urlencoded1.append(
    "__EVENTVALIDATION",
    window.ct.eventValidation
  );

  urlencoded1.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded1.append(
    "ctl00$hdnQuickmenu",
    ""
  );

  urlencoded1.append(
    "ctl00$body$butEdit",
    "Edit"
  );

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(
    url,
    requestOptions1
  );

  const html1 = await response1.text();

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    html1,
    "text/html"
  );

  const viewState =
    doc.querySelector("#__VIEWSTATE")?.value || "";

  const eventValidation =
    doc.querySelector("#__EVENTVALIDATION")?.value || "";

  const viewStateGen =
    doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  const urlencoded2 = new URLSearchParams();

  // urlencoded2.append("ctl00_body_RadScriptManager1_HiddenField", ";;HBS:en-GB:1bf6bb2e-a9e3-48c2-8258-789b8d94ae17:64806b3a");

  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");

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
    "ctl00$hdnQuickmenu",
    ""
  );

  urlencoded2.append(
    "ctl00$body$txtName",
    args["ctl00_body_txtName"]
  );

  urlencoded2.append(
    "ctl00$body$dpSalary",
    args["ctl00_body_dpSalary"]
  );

  if (args["ctl00_body_chkTop"] === "on") {

    urlencoded2.append(
      "ctl00$body$chkTop",
      "on"
    );

  } else {

    urlencoded2.append(
      "ctl00$body$dpNextUpgrade",
      args["ctl00_body_dpNextUpgrade"] || "-1"
    );

  }

  urlencoded2.append(
    "ctl00$body$nuLevel",
    args["ctl00_body_nuLevel"]
  );

  urlencoded2.append(
    "ctl00$body$ManagePos",
    args["ctl00_body_ManagePos"]
  );

  urlencoded2.append(
    "ctl00$body$butSave",
    "Save"
  );

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(
    url,
    requestOptions2
  );

  const html2 = await response2.text();

  if (response2.status === 200) {
    return "sucessfully update the corporation details!!";
  } else {
    return "try again api is fail.";
  }

})