(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/AttachmentType.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/AttachmentType.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "AttachmentType";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.at.viewState,
      __VIEWSTATEGENERATOR: window.at.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.at.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$butEdit": "Edit"

    }, url);

  const payload = {

    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",

    __VIEWSTATE: editInit.viewState,
    __VIEWSTATEGENERATOR: editInit.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: editInit.eventValidation,

    "ctl00$body$txtDesc":
      args["ctl00_body_txtDesc"] || "",

    "ctl00$body$butSave": "Save"
  };

  if (
    args["ctl00_body_ChkisExpire"] === "on"
  ) {
    payload["ctl00$body$ChkisExpire"] = "on";
  }

  const saveResponse =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )(payload, url);

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const code =
    doc.querySelector("#ctl00_body_txtCode")
      ?.value?.trim() || "";

  const attachmentType =
    doc.querySelector("#ctl00_body_txtDesc")
      ?.value?.trim() || "";

  const expiration =
    doc.querySelector("#ctl00_body_ChkisExpire")
      ?.checked || false;

  const updatedetails = {
    code,
    attachmentType,
    expiration
  };

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return updatedetails;
  }

});