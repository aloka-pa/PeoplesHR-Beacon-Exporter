(async function (data, args, reqOptions) {

  const saveResponse =
    await BeaconBar.executeFunction("getEIMApii")({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.ft.viewState,
      __VIEWSTATEGENERATOR: window.ft.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.ft.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$dpcountry":
        args["ctl00_body_dpcountry"],

      "ctl00$body$txtName":
        args["ctl00_body_txtName"],

      "ctl00$body$butSave": "Save"

    }, "FunctionalRole");

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const code =
    doc.querySelector("#ctl00_body_txtCode")
      ?.value?.trim() || "";

  const functionRole =
    doc.querySelector("#ctl00_body_txtName")
      ?.value?.trim() || "";

  const selectElement =
    doc.querySelector("#ctl00_body_dpcountry");

  let functionSelect = null;

  if (selectElement) {
    const selected = selectElement.selectedOptions[0];

    functionSelect = {
      value: selected?.value || "",
      text: selected?.textContent.trim() || ""
    };
  }

  const result = {
    code,
    functionSelect,
    functionRole
  };

  return result;

});