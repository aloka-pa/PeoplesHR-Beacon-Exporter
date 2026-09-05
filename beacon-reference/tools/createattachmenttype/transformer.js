(async function (data, args, reqOptions) {

  const details = await BeaconBar.executeFunction("getApiList")("AttachmentType");

  const newInt = await BeaconBar.executeFunction("getEIMApii")({
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: details.viewState,
    __VIEWSTATEGENERATOR: details.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: details.eventValidation,
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$butNew": "New"
  }, "AttachmentType");

  const payload = {
    scrollLeft: "0",
    scrollTop: "0",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: newInt.viewState,
    __VIEWSTATEGENERATOR: newInt.viewStateGen,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: newInt.eventValidation,

    // mapped fields
    "ctl00$body$txtDesc": args.description || "",

    "ctl00$body$butSave": "Save"
  };

  if (args.isExpire === true) {
    payload["ctl00$body$ChkisExpire"] = "on";
  }

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")(
    payload,
    "AttachmentType"
  );

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const code =
    doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "";

  const attachmentType =
    doc.querySelector("#ctl00_body_txtDesc")?.value?.trim() || "";

  const expiration =
    doc.querySelector("#ctl00_body_ChkisExpire")?.checked || false;

  return {
    code,
    attachmentType,
    expiration
  };

});