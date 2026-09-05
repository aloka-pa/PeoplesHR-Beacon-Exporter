(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/FunctionalRole.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/FunctionalRole.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "FunctionalRole";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.fr.viewState,
      __VIEWSTATEGENERATOR: window.fr.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.fr.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$butEdit": "Edit"

    }, url);

  const saveResponse =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: editInit.viewState,
      __VIEWSTATEGENERATOR: editInit.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: editInit.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$dpcountry":
        args["ctl00_body_dpcountry"],

      "ctl00$body$txtName":
        args["ctl00_body_txtName"],

      "ctl00$body$butSave": "Save"

    }, url);

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

    const selected =
      selectElement.selectedOptions[0];

    functionSelect = {
      value:
        selected?.value || "",

      text:
        selected?.textContent.trim() || ""
    };

  }

  const result = {
    code,
    functionSelect,
    functionRole
  };

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return result;
  }

});