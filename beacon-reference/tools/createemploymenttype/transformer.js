(async function (data, args, reqOptions) {
  const details = await BeaconBar.executeFunction("getApiList")("EmployeementType");

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
  }, "EmployeementType");

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
    "ctl00$hdnDateFormat": "dd/mm/yy",
    "ctl00$body$txtempdesc": args["ctl00_body_txtempdesc"] || "",
    "ctl00$body$dpempcat": args["ctl00_body_dpempcat"] || "",
    "ctl00$body$butSave": "Save"
  };

  if (args["ctl00_body_cbisdatelimit"] === "on") {
    payload["ctl00$body$cbisdatelimit"] = "on";
    payload["ctl00$body$nuDuration"] =
      args["ctl00_body_nuDuration"] || "";

    payload["ctl00$body$dpDurationType"] =
      args["ctl00_body_dpDurationType"] || "";
  }

  if (args["ctl00_body_chkRetirementAge"] === "on") {
    payload["ctl00$body$chkRetirementAge"] = "on";

    payload["ctl00$body$nuAgeofMale"] =
      args["ctl00_body_nuAgeofMale"] || "";

    payload["ctl00$body$nuAgeofFemale"] =
      args["ctl00_body_nuAgeofFemale"] || "";
  }

  const saveResponse =
    await BeaconBar.executeFunction("getEIMApii")(
      payload,
      "EmployeementType"
    );

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    saveResponse.rawData,
    "text/html"
  );

  const updateemployeeTypeDetails = {
    code:
      doc.querySelector("#ctl00_body_txtempcode")
        ?.value?.trim() || "",

    employmentType:
      doc.querySelector("#ctl00_body_txtempdesc")
        ?.value?.trim() || "",

    dateLimited:
      doc.querySelector("#ctl00_body_cbisdatelimit")
        ?.checked || false,

    duration:
      doc.querySelector("#ctl00_body_nuDuration")
        ?.value?.trim() || "",

    durationUnit:
      doc.querySelector(
        "#ctl00_body_dpDurationType option:checked"
      )?.textContent.trim() || "",

    retirementAgeRequired:
      doc.querySelector("#ctl00_body_chkRetirementAge")
        ?.checked || false,

    retirementAgeMale:
      doc.querySelector("#ctl00_body_nuAgeofMale")
        ?.value?.trim() || "",

    retirementAgeFemale:
      doc.querySelector("#ctl00_body_nuAgeofFemale")
        ?.value?.trim() || "",

    employmentCategory:
      doc.querySelector(
        "#ctl00_body_dpempcat option:checked"
      )?.textContent.trim() || ""
  };

  return updateemployeeTypeDetails;
})