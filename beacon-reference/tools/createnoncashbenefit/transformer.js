(async function (data, args, reqOptions) {

  const saveResponse =
    await BeaconBar.executeFunction("getEIMApii")({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.ncd.viewState,
      __VIEWSTATEGENERATOR: window.ncd.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.ncd.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$txtName":
        args["ctl00_body_txtName"] || "",

      "ctl00$body$dpCategory":
        args["ctl00_body_dpCategory"] || "",

      "ctl00$body$butSave": "Save"

    }, "NonCashBenifit");

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const code =
    doc.getElementById("ctl00_body_txtCode")
      ?.value?.trim() || "";

  const description =
    doc.getElementById("ctl00_body_txtName")
      ?.value?.trim() || "";

  return {
    code,
    description
  };

});