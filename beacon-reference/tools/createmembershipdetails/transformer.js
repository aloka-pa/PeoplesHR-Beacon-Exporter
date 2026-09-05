(async function (data, args, reqOptions) {

  const create =
    await BeaconBar.executeFunction("getEIMApii")(
      {
        scrollLeft: "0",
        scrollTop: "0",
        __EVENTTARGET: "",
        __EVENTARGUMENT: "",

        __VIEWSTATE: window.cm.viewState,
        __VIEWSTATEGENERATOR: window.cm.viewStateGen,
        __VIEWSTATEENCRYPTED: "",
        __EVENTVALIDATION: window.cm.eventValidation,

        "ctl00$hdnDateFormat": "dd/mm/yy",

        "ctl00$body$txtName":
          args["ctl00_body_txtName"],

        "ctl00$body$dpcountry":
          args["ctl00_body_dpcountry"],

        "ctl00$body$butSave": "Save"

      },
      "Membership"
    );

  const html = create.rawData || "";

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    html,
    "text/html"
  );

  const getElementValue = (id) =>
    doc.getElementById(id)?.value?.trim() || "";

  const getSelectedOption = (id) => {
    const select = doc.getElementById(id);

    const selected =
      select?.selectedOptions?.[0];

    return selected
      ? {
          value: selected.value,
          text: selected.text.trim()
        }
      : {
          value: "",
          text: ""
        };
  };

  const createMembershipDetails = {
    code:
      getElementValue("ctl00_body_txtCode"),

    membership:
      getElementValue("ctl00_body_txtName"),

    selectedMembershipType:
      getSelectedOption("ctl00_body_dpcountry")
  };

  return createMembershipDetails;

})