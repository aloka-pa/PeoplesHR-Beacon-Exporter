(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/Location.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/Location.aspx");

  let url;

  if (updateurl.updateUrl) {
    url =
      `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url =
      `${window.origin}/${reqOptions.sl}/EIM/Location.aspx`;
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

  const initialFormData = new FormData();

  initialFormData.append("scrollLeft", "0");
  initialFormData.append("scrollTop", "0");
  initialFormData.append("__EVENTTARGET", "");
  initialFormData.append("__EVENTARGUMENT", "");

  initialFormData.append(
    "__VIEWSTATE",
    window.viewData.viewState
  );

  initialFormData.append(
    "__VIEWSTATEGENERATOR",
    window.viewData.viewStateGen
  );

  initialFormData.append(
    "__VIEWSTATEENCRYPTED",
    ""
  );

  initialFormData.append(
    "__EVENTVALIDATION",
    window.viewData.eventValidation
  );

  initialFormData.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  initialFormData.append(
    "ctl00$hdnQuickmenu",
    "1"
  );

  initialFormData.append(
    "ctl00$body$hdnIsHead",
    ""
  );

  initialFormData.append(
    "ctl00$body$hdnEditItemIndex",
    ""
  );

  initialFormData.append(
    "ctl00_body_RadWindowManager1_ClientState",
    ""
  );

  initialFormData.append(
    "ctl00$body$txtHeadName",
    ""
  );

  initialFormData.append(
    "ctl00$body$txtAdminName",
    ""
  );

  initialFormData.append(
    "ctl00$body$butEdit",
    "Edit"
  );

  initialFormData.append(
    "ctl00$body$hdnDefCountry",
    "-1"
  );

  const fetchEditResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: initialFormData,
    redirect: "follow"
  });

  const html = await fetchEditResponse.text();

  const parser = new DOMParser();

  const document = parser.parseFromString(
    html,
    "text/html"
  );

  const viewState =
    document.querySelector("#__VIEWSTATE")
      ?.value || "";

  const eventValidation =
    document.querySelector("#__EVENTVALIDATION")
      ?.value || "";

  const viewStateGen =
    document.querySelector("#__VIEWSTATEGENERATOR")
      ?.value || "";

  const finalFormData = new FormData();

  finalFormData.append("scrollLeft", "0");
  finalFormData.append("scrollTop", "0");
  finalFormData.append("__EVENTTARGET", "");
  finalFormData.append("__EVENTARGUMENT", "");
  finalFormData.append("__LASTFOCUS", "");

  finalFormData.append(
    "__VIEWSTATE",
    viewState
  );

  finalFormData.append(
    "__VIEWSTATEGENERATOR",
    viewStateGen
  );

  finalFormData.append(
    "__VIEWSTATEENCRYPTED",
    ""
  );

  finalFormData.append(
    "__EVENTVALIDATION",
    eventValidation
  );

  finalFormData.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  finalFormData.append(
    "ctl00$body$hdnIsHead",
    ""
  );

  finalFormData.append(
    "ctl00$body$hdnEditItemIndex",
    ""
  );

  finalFormData.append(
    "ctl00_body_RadWindowManager1_ClientState",
    ""
  );

  finalFormData.append(
    "ctl00$body$txtName",
    args["ctl00_body_txtName"]
  );

  finalFormData.append(
    "ctl00$body$txtAbbreviation",
    args["ctl00_body_txtAbbreviation"]
  );

  finalFormData.append(
    "ctl00$body$txttp",
    args["ctl00_body_txttp"]
  );

  finalFormData.append(
    "ctl00$body$txtFax",
    args["ctl00_body_txtFax"]
  );

  finalFormData.append(
    "ctl00$body$txtemail",
    args["ctl00_body_txtemail"]
  );

  finalFormData.append(
    "ctl00$body$txturl",
    args["ctl00_body_txturl"]
  );

  finalFormData.append(
    "ctl00$body$txtaddress",
    args["ctl00_body_txtaddress"]
  );

  finalFormData.append(
    "ctl00$body$ddlCountry",
    args["ctl00_body_ddlCountry"]
  );

  finalFormData.append(
    "ctl00$body$ddlProvince",
    args["ctl00_body_ddlProvince"]
  );

  finalFormData.append(
    "ctl00$body$ddlDistrict",
    args["ctl00_body_ddlDistrict"]
  );

  finalFormData.append(
    "ctl00$body$cboTimeZone",
    args["ctl00_body_cboTimeZone"]
  );

  finalFormData.append(
    "ctl00$body$txtHeadName",
    args["ctl00_body_txtHeadName"]
  );

  finalFormData.append(
    "ctl00$body$txtHTitle",
    args["ctl00_body_txtHTitle"]
  );

  finalFormData.append(
    "ctl00$body$txtAdminName",
    args["ctl00_body_txtAdminName"]
  );

  finalFormData.append(
    "ctl00$body$filMyFile",
    args["ctl00_body_filMyFile"]
  );

  finalFormData.append(
    "ctl00$body$butSave",
    args["ctl00_body_butSave"]
  );

  finalFormData.append(
    "ctl00$body$hdnDefCountry",
    args["ctl00_body_hdnDefCountry"]
  );

  const saveResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: finalFormData,
    redirect: "follow"
  });

  await saveResponse.text();

  if (saveResponse.status === 200) {
    return "Successfully updated!";
  } else {
    return "not update the location details";
  }

});