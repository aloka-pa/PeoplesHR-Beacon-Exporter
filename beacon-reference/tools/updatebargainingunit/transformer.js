(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/BargainingUnit.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/BargainingUnit.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "BargainingUnit";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({
      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.bu.viewState,
      __VIEWSTATEGENERATOR: window.bu.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.bu.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$butEdit": "Edit",

      "ctl00$body$hdnEventType": ""

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

      "ctl00$body$txtBGNCode":
        args["ctl00_body_txtBGNCode"] || "",

      "ctl00$body$txtBGNName":
        args["ctl00_body_txtBGNName"] || "",

      "ctl00$body$txtAbbreviation":
        args["ctl00_body_txtAbbreviation"] || "",

      "ctl00$body$txtRegDate":
        args["ctl00_body_txtRegDate"] || "",

      "ctl00$body$txtRegNumber":
        args["ctl00_body_txtRegNumber"] || "",

      "ctl00$body$txtRegBody":
        args["ctl00_body_txtRegBody"] || "",

      "ctl00$body$butSave": "Save",

      "ctl00$body$hdnEventType": "2"

    }, url);

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const getValue = (id) => {
    const el = doc.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const updateBargainingUnitDetails = {
    code:
      getValue("ctl00_body_txtBGNCode"),

    name:
      getValue("ctl00_body_txtBGNName"),

    abbreviation:
      getValue("ctl00_body_txtAbbreviation"),

    registeredDate:
      getValue("ctl00_body_txtRegDate"),

    registeredNumber:
      getValue("ctl00_body_txtRegNumber"),

    registeredBody:
      getValue("ctl00_body_txtRegBody")
  };

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return updateBargainingUnitDetails;
  }

});