(async function (data, args, reqOptions) {


  const myHeaders = new Headers();

  myHeaders.append(
    "accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  );

  myHeaders.append("accept-language", "en-US,en;q=0.9");

  const formdata = new FormData();

  formdata.append("scrollLeft", "0");
  formdata.append("scrollTop", "0");
  formdata.append("__EVENTTARGET", "");
  formdata.append("__EVENTARGUMENT", "");
  formdata.append("__LASTFOCUS", "");

  formdata.append(
    "__VIEWSTATE",
    window.districtCode.viewState
  );

  formdata.append(
    "__VIEWSTATEGENERATOR",
    window.districtCode.viewStateGen
  );

  formdata.append("__VIEWSTATEENCRYPTED", "");

  formdata.append(
    "__EVENTVALIDATION",
    window.districtCode.eventValidation
  );

  formdata.append("ctl00$hdnDateFormat", "dd/mm/yy");
  formdata.append("ctl00$body$hdnIsHead", "");
  formdata.append("ctl00$body$hdnEditItemIndex", "");
  formdata.append("ctl00_body_RadWindowManager1_ClientState", "");

  formdata.append(
    "ctl00$body$txtName",
    args["ctl00_body_txtName"] || ""
  );

  formdata.append(
    "ctl00$body$txtAbbreviation",
    args["ctl00_body_txtAbbreviation"] || ""
  );

  formdata.append(
    "ctl00$body$txttp",
    args["ctl00_body_txttp"] || ""
  );

  formdata.append(
    "ctl00$body$txtFax",
    args["ctl00_body_txtFax"] || ""
  );

  formdata.append(
    "ctl00$body$txtemail",
    args["ctl00_body_txtemail"] || ""
  );

  formdata.append(
    "ctl00$body$txturl",
    args["ctl00_body_txturl"] || ""
  );

  formdata.append(
    "ctl00$body$txtaddress",
    args["ctl00_body_txtaddress"] || ""
  );

  formdata.append(
    "ctl00$body$ddlCountry",
    args["ctl00_body_ddlCountry"] || ""
  );

  formdata.append(
    "ctl00$body$ddlProvince",
    args["ctl00_body_ddlProvince"] || ""
  );

  formdata.append(
    "ctl00$body$ddlDistrict",
    args["ctl00_body_ddlDistrict"] || ""
  );

  formdata.append(
    "ctl00$body$cboTimeZone",
    args["ctl00_body_cboTimeZone"] || ""
  );

  formdata.append(
    "ctl00$body$txtHeadName",
    args["ctl00_body_txtHeadName"] || ""
  );

  formdata.append(
    "ctl00$body$txtHTitle",
    args["ctl00_body_txtHTitle"] || ""
  );

  formdata.append(
    "ctl00$body$txtAdminName",
    args["ctl00_body_txtAdminName"] || ""
  );

  formdata.append(
    "ctl00$body$filMyFile",
    "file"
  );

  formdata.append(
    "ctl00$body$butSave",
    "Save"
  );

  formdata.append(
    "ctl00$body$hdnDefCountry",
    "-1"
  );

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow"
  };

  const response = await fetch(
    `${location.origin}/hr/EIM/Location.aspx`,
    requestOptions
  );

  const html = await response.text();

  return "Created Successfully!";

})