(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/Salutation.aspx"
    )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl =
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/Salutation.aspx");

  let url;

  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
  } else {
    url = "Salutation";
  }

  const editInit =
    await BeaconBar.executeFunction(
      "getEIMApii"
    )({

      scrollLeft: "0",
      scrollTop: "0",
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",

      __VIEWSTATE: window.eti.viewState,
      __VIEWSTATEGENERATOR: window.eti.viewStateGen,
      __VIEWSTATEENCRYPTED: "",
      __EVENTVALIDATION: window.eti.eventValidation,

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

    "ctl00$body$butSave": "Save"
  };

  if (
    args["ctl00_body_chkGenderValid"] === "on"
  ) {
    payload["ctl00$body$chkGenderValid"] = "on";
  }

  if (args["ctl00_body_cboGender"]) {
    payload["ctl00$body$cboGender"] =
      args["ctl00_body_cboGender"];
  }

  for (let i = 0; i <= 7; i++) {

    const schemaKey =
      `ctl00_body_chkMaritalStatus_${i}`;

    const payloadKey =
      `ctl00$body$chkMaritalStatus$${i}`;

    if (args[schemaKey] === "on") {
      payload[payloadKey] = "on";
    }

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

  const updateemployeetypeDetails = {

    code:
      doc.querySelector("#ctl00_body_txtCode")
        ?.value?.trim() || "",

    employeeTitle:
      doc.querySelector("#ctl00_body_txtName")
        ?.value?.trim() || "",

    genderValidate:
      doc.querySelector("#ctl00_body_chkGenderValid")
        ?.checked || false,

    gender: (() => {

      const selected =
        doc.querySelector("#ctl00_body_cboGender")
          ?.selectedOptions?.[0];

      return selected
        ? selected.textContent.trim()
        : "";

    })(),

    maritalStatusLabel:
      doc.querySelector("#ctl00_body_lblMAritalStatus")
        ?.textContent.trim() || "",

    maritalStatuses: []
  };

  const maritalTable =
    doc.querySelector(
      "#ctl00_body_chkMaritalStatus"
    );

  if (maritalTable) {

    const checkboxes =
      maritalTable.querySelectorAll(
        "input[type='checkbox']"
      );

    checkboxes.forEach((checkbox) => {

      const label =
        maritalTable.querySelector(
          `label[for="${checkbox.id}"]`
        );

      updateemployeetypeDetails.maritalStatuses.push({
        label:
          label
            ? label.textContent.trim()
            : "",

        checked:
          checkbox.checked
      });

    });

  }

  if (saveResponse === false) {
    return "try again api is fail.";
  } else {
    return updateemployeetypeDetails;
  }

});