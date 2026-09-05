(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("Salutation");

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
  }, "Salutation");

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
    "ctl00$body$txtName": args["ctl00_body_txtName"] || "",
    "ctl00$body$butSave": "Save"
  };

  if (args["ctl00_body_chkGenderValid"] === "on") {
    payload["ctl00$body$chkGenderValid"] = "on";
  }

  if (args["ctl00_body_cboGender"]) {
    payload["ctl00$body$cboGender"] = args["ctl00_body_cboGender"];
  }

  for (let i = 0; i <= 7; i++) {
    const schemaKey = `ctl00_body_chkMaritalStatus_${i}`;
    const payloadKey = `ctl00$body$chkMaritalStatus$${i}`;

    if (args[schemaKey] === "on") {
      payload[payloadKey] = "on";
    }
  }

  const saveResponse = await BeaconBar.executeFunction("getEIMApii")(
    payload,
    "Salutation"
  );

  const parser = new DOMParser();
  const doc = parser.parseFromString(saveResponse.rawData, "text/html");

  const createemployeetypeDetails = {
    code:
      doc.querySelector("#ctl00_body_txtCode")?.value?.trim() || "",

    employeeTitle:
      doc.querySelector("#ctl00_body_txtName")?.value?.trim() || "",

    genderValidate:
      doc.querySelector("#ctl00_body_chkGenderValid")?.checked || false,

    gender: (() => {
      const selected =
        doc.querySelector("#ctl00_body_cboGender")
          ?.selectedOptions?.[0];

      return selected ? selected.textContent.trim() : "";
    })(),

    maritalStatusLabel:
      doc.querySelector("#ctl00_body_lblMAritalStatus")
        ?.textContent.trim() || "",

    maritalStatuses: []
  };

  const maritalTable = doc.querySelector(
    "#ctl00_body_chkMaritalStatus"
  );

  if (maritalTable) {
    const checkboxes = maritalTable.querySelectorAll(
      "input[type='checkbox']"
    );

    checkboxes.forEach((checkbox) => {
      const label = maritalTable.querySelector(
        `label[for="${checkbox.id}"]`
      );

      createemployeetypeDetails.maritalStatuses.push({
        label: label ? label.textContent.trim() : "",
        checked: checkbox.checked
      });
    });
  }

  return createemployeetypeDetails;
});