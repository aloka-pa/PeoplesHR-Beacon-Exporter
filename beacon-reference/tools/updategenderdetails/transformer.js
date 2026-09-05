(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/GenderType.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/GenderType.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "GenderType";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.ge.viewState,
      __VIEWSTATEGENERATOR: window.ge.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.ge.eventValidation,

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
      __LASTFOCUS: "",

      __VIEWSTATE: editInit.viewState,
      __VIEWSTATEGENERATOR: editInit.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: editInit.eventValidation,

      "ctl00$body$txtGenName":
        args["ctl00_body_txtGenName"],

      "ctl00$body$txtdesc":
        args["ctl00_body_txtdesc"],

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

  const gender =
    doc.querySelector("#ctl00_body_txtGenName")
      ?.value?.trim() || "";

  const description =
    doc.querySelector("#ctl00_body_txtdesc")
      ?.value?.trim() || "";

  const updatedetails = {
    code,
    gender,
    description
  };

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return updatedetails;
  }

});