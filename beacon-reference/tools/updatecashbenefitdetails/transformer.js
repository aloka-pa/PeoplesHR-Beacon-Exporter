(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/CashBenifit.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/CashBenifit.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "CashBenifit";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.cb.viewState,
      __VIEWSTATEGENERATOR: window.cb.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.cb.eventValidation,

      "ctl00$hdnDateFormat": "dd/mm/yy",

      "ctl00$body$dtRateEffDate$hdnDateFormat":
        "dd/mm/yy",

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

      "ctl00$body$nuamount":
        args["ctl00_body_nuamount"] || "",

      "ctl00$body$cboCurrency":
        args["ctl00_body_cboCurrency"] || "",

      "ctl00$body$dtRateEffDate$txtDate":
        args["ctl00_body_dtRateEffDate_txtDate"] || "",

      "ctl00$body$dtRateEffDate$hdnDateFormat":
        "dd/mm/yy",

      "ctl00$body$butSave": "Save"

    }, url);

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const getValue = (id) =>
    doc.getElementById(id)?.value?.trim() || "";

  const getSelectedText = (id) => {
    const el = doc.getElementById(id);

    return el
      ? el.options[el.selectedIndex]?.text.trim() || ""
      : "";
  };

  const updateCashBenefitDetails = {
    code:
      getValue("ctl00_body_txtCode"),

    description:
      getValue("ctl00_body_txtName"),

    amount:
      getValue("ctl00_body_nuamount"),

    currency:
      getSelectedText("ctl00_body_cboCurrency"),

    rateEffectiveDate:
      getValue("ctl00_body_dtRateEffDate_txtDate")
  };

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return updateCashBenefitDetails;
  }

})