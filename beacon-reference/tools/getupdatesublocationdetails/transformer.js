(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "eim/SubLocation.aspx"
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
    )("eim/SubLocation.aspx");

  let url;

  if (updateurl.updateUrl) {
    url =
      `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url =
      `${window.origin}/${reqOptions.sl}/eim/SubLocation.aspx`;
  }

  const urlencoded1 = new URLSearchParams();

  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");

  urlencoded1.append(
    "__VIEWSTATE",
    window.sl.viewState
  );

  urlencoded1.append(
    "__VIEWSTATEGENERATOR",
    window.sl.viewStateGen
  );

  urlencoded1.append(
    "__VIEWSTATEENCRYPTED",
    ""
  );

  urlencoded1.append(
    "__EVENTVALIDATION",
    window.sl.eventValidation
  );

  urlencoded1.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded1.append(
    "ctl00$body$hdnIsHead",
    ""
  );

  urlencoded1.append(
    "ctl00$body$hdnEditItemIndex",
    ""
  );

  urlencoded1.append(
    "ctl00$body$txtHeadName",
    args["ctl00_body_txtHeadName"] || " "
  );

  urlencoded1.append(
    "ctl00$body$CmdEdit",
    "Edit"
  );

  urlencoded1.append(
    "ctl00$body$hdnDefCountry",
    ""
  );

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response = await fetch(
    url,
    requestOptions1
  );

  const html = await response.text();

  const parser = new DOMParser();

  const documentEdit = parser.parseFromString(
    html,
    "text/html"
  );

  const viewState =
    documentEdit.querySelector("#__VIEWSTATE")
      ?.value || "";

  const eventValidation =
    documentEdit.querySelector("#__EVENTVALIDATION")
      ?.value || "";

  const viewStateGen =
    documentEdit.querySelector("#__VIEWSTATEGENERATOR")
      ?.value || "";

  const urlencoded2 =
    new URLSearchParams();

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

  urlencoded2.append(
    "__VIEWSTATEENCRYPTED",
    ""
  );

  urlencoded2.append(
    "__EVENTVALIDATION",
    eventValidation
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
    args["ctl00_body_txtName"] || ""
  );

  urlencoded2.append(
    "ctl00$body$ddlLocation",
    args["ctl00_body_ddlLocation"] || ""
  );

  urlencoded2.append(
    "ctl00$body$txtHeadName",
    args["ctl00_body_txtHeadName"] || "Peter Pascal"
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

  const response1 = await fetch(
    url,
    requestOptions2
  );

  const html1 = await response1.text();

  const document2 = parser.parseFromString(
    html1,
    "text/html"
  );

  const code =
    document2.getElementById(
      "ctl00_body_txtCode"
    )?.value || "";

  const description =
    document2.getElementById(
      "ctl00_body_txtName"
    )?.value || "";

  const locationSelect =
    document2.getElementById(
      "ctl00_body_ddlLocation"
    );

  const selectedLocation =
    locationSelect?.options[
      locationSelect.selectedIndex
    ];

  const location = {
    id: selectedLocation?.value || "",
    name:
      selectedLocation?.textContent?.trim() || ""
  };

  const headOfSubLocation =
    document2.getElementById(
      "ctl00_body_txtHeadName"
    )?.value || "";

  const select =
    document2.getElementById(
      "ctl00_body_ddlLocation"
    );

  const options =
    Array.from(select.options);

  const locationData =
    options.map(option => ({
      id: option.value,
      name: option.textContent.trim()
    }));

  const sublocationData = {

    Code: code,

    Description: description,

    Location: location,

    HeadOfSubLocation:
      headOfSubLocation,

    allLocation: locationData

  };

  if (response1.status === 200) {
    return sublocationData;
  } else {
    return "no update for given sublocations";
  }

})