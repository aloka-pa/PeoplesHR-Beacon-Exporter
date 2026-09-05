(async function (data, args, reqOptions) {

  const details =
    await BeaconBar.executeFunction("getApiList")(
      "GenderType"
    );

  const newInt =
    await BeaconBar.executeFunction("getEIMApii")({

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

    }, "GenderType");

  const saveResponse =
    await BeaconBar.executeFunction("getEIMApii")({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",

      __VIEWSTATE: newInt.viewState,
      __VIEWSTATEGENERATOR: newInt.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: newInt.eventValidation,

      "ctl00$body$txtGenName":
        args["ctl00_body_txtGenName"],

      "ctl00$body$txtdesc":
        args["ctl00_body_txtdesc"],

      "ctl00$body$butSave": "Save"

    }, "GenderType");

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const code =
    doc.querySelector("#ctl00_body_txtCode")
      ?.value?.trim() || "";

  const gender =
    doc.querySelector("#ctl00_body_txtGenName")
      ?.value?.trim() || "";

  const description =
    doc.querySelector("#ctl00_body_txtdesc")
      ?.value?.trim() || "";

  const createdetails = {
    code,
    gender,
    description
  };

  return createdetails;

})