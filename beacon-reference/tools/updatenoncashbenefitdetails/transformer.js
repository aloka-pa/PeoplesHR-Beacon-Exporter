(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/NonCashBenifit.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/NonCashBenifit.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "NonCashBenifit";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.cda.viewState,
      __VIEWSTATEGENERATOR: window.cda.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.cda.eventValidation,

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

      "ctl00$body$txtName":
        args["ctl00_body_txtName"] || "",

      "ctl00$body$dpCategory":
        args["ctl00_body_dpCategory"] || "",

      "ctl00$body$butSave": "Save"

    }, url);

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

  const updatedetails = {
    code,
    description
  };

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return updatedetails;
  }

});