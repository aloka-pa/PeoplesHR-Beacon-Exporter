(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.includes("EIM/SalaryGradeInfo.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const myHeaders = new Headers();

  myHeaders.append(
    "accept",
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
  );

  myHeaders.append(
    "accept-language",
    "en-US,en;q=0.9"
  );

  myHeaders.append(
    "x-requested-with",
    "XMLHttpRequest"
  );

  const updateurl =
    await BeaconBar.executeFunction("updateUrlParams")(
      "EIM/SalaryGradeInfo.aspx"
    );

  let url;

  if (updateurl.updateUrl) {
    url =
      `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url =
      `${window.origin}/${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`;
  }

  const urlencoded1 = new URLSearchParams();

  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");

  urlencoded1.append(
    "__VIEWSTATE",
    window.sg.viewState
  );

  urlencoded1.append(
    "__VIEWSTATEGENERATOR",
    window.sg.viewStateGen
  );

  urlencoded1.append("__VIEWSTATEENCRYPTED", "");

  urlencoded1.append(
    "__EVENTVALIDATION",
    window.sg.eventValidation
  );

  urlencoded1.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded1.append(
    "ctl00$hdnQuickmenu",
    ""
  );

  urlencoded1.append(
    "ctl00$body$butEdit",
    "Edit"
  );

  urlencoded1.append(
    "ctl00$body$hdnDecimalFormat",
    "2"
  );

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  const response1 = await fetch(
    url,
    requestOptions1
  );

  const html1 = await response1.text();

  const parser1 = new DOMParser();

  const doc1 = parser1.parseFromString(
    html1,
    "text/html"
  );

  let viewState =
    doc1.querySelector("#__VIEWSTATE")?.value || "";

  let eventValidation =
    doc1.querySelector("#__EVENTVALIDATION")?.value || "";

  let viewStateGen =
    doc1.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

  if (args.updateCurrency === "updateCurrency") {

    const urlencoded2 = new URLSearchParams();

    urlencoded2.append("scrollLeft", "0");
    urlencoded2.append("scrollTop", "0");

    urlencoded2.append(
      "__EVENTTARGET",
      "ctl00$body$cboCurrType"
    );

    urlencoded2.append("__EVENTARGUMENT", "");
    urlencoded2.append("__LASTFOCUS", "");

    urlencoded2.append(
      "__VIEWSTATE",
      viewState
    );

    urlencoded2.append(
      "__VIEWSTATEGENERATOR",
      viewStateGen
    );

    urlencoded2.append("__VIEWSTATEENCRYPTED", "");

    urlencoded2.append(
      "__EVENTVALIDATION",
      eventValidation
    );

    urlencoded2.append(
      "ctl00$hdnDateFormat",
      "dd/mm/yy"
    );

    urlencoded2.append(
      "ctl00$hdnQuickmenu",
      ""
    );

    urlencoded2.append(
      "ctl00$body$txtsalname",
      args["ctl00_body_txtsalname"]
    );

    urlencoded2.append(
      "ctl00$body$cboCurrType",
      args["ctl00_body_cboCurrType"]
    );

    urlencoded2.append(
      "ctl00$body$txtMin",
      args["ctl00_body_txtMin"] + ".00"
    );

    urlencoded2.append(
      "ctl00$body$txtMid",
      args["ctl00_body_txtMid"] + ".00"
    );

    urlencoded2.append(
      "ctl00$body$txtMax",
      args["ctl00_body_txtMax"] + ".00"
    );

    urlencoded2.append(
      "ctl00$body$hdnDecimalFormat",
      "2"
    );

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded2,
      redirect: "follow"
    };

    const response2 = await fetch(
      url,
      requestOptions2
    );

    const html2 = await response2.text();

    const doc2 = parser1.parseFromString(
      html2,
      "text/html"
    );

    viewState =
      doc2.querySelector("#__VIEWSTATE")?.value || "";

    eventValidation =
      doc2.querySelector("#__EVENTVALIDATION")?.value || "";

    viewStateGen =
      doc2.querySelector("#__VIEWSTATEGENERATOR")?.value || "";
  }

  const urlencoded2 = new URLSearchParams();

  urlencoded2.append("scrollLeft", "0");
  urlencoded2.append("scrollTop", "0");
  urlencoded2.append("__EVENTTARGET", "");
  urlencoded2.append("__EVENTARGUMENT", "");
  urlencoded2.append("__LASTFOCUS", "");

  urlencoded2.append(
    "__VIEWSTATE",
    viewState
  );

  urlencoded2.append(
    "__VIEWSTATEGENERATOR",
    viewStateGen
  );

  urlencoded2.append("__VIEWSTATEENCRYPTED", "");

  urlencoded2.append(
    "__EVENTVALIDATION",
    eventValidation
  );

  urlencoded2.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded2.append(
    "ctl00$hdnQuickmenu",
    ""
  );

  urlencoded2.append(
    "ctl00$body$txtsalname",
    args["ctl00_body_txtsalname"]
  );

  urlencoded2.append(
    "ctl00$body$cboCurrType",
    args["ctl00_body_cboCurrType"]
  );

  urlencoded2.append(
    "ctl00$body$txtMin",
    args["ctl00_body_txtMin"]
  );

  urlencoded2.append(
    "ctl00$body$txtMid",
    args["ctl00_body_txtMid"]
  );

  urlencoded2.append(
    "ctl00$body$txtMax",
    args["ctl00_body_txtMax"]
  );

  urlencoded2.append(
    "ctl00$body$butSave",
    "Save"
  );

  urlencoded2.append(
    "ctl00$body$hdnDecimalFormat",
    "2"
  );

  const requestOptions2 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded2,
    redirect: "follow"
  };

  const response2 = await fetch(
    url,
    requestOptions2
  );

  const html2 = await response2.text();

  const details =
    await BeaconBar.executeFunction(
      "getDomExtract"
    )(html2);

  window.sg1 = details;

  const doc2 = parser1.parseFromString(
    html2,
    "text/html"
  );

  const updatesalaryGradeData = {
    code:
      doc2.getElementById("ctl00_body_txtsalcode")
        ?.value.trim() || "",

    salaryGradeName:
      doc2.getElementById("ctl00_body_txtsalname")
        ?.value.trim() || "",

    currency: {
      value:
        doc2.getElementById("ctl00_body_cboCurrType")
          ?.value || "",

      text:
        doc2.getElementById("ctl00_body_cboCurrType")
          ?.options[
            doc2.getElementById(
              "ctl00_body_cboCurrType"
            )?.selectedIndex
          ]?.text.trim() || ""
    },

    salaryType: (() => {

      const rangeRadio =
        doc2.getElementById(
          "ctl00_body_optsalary_0"
        );

      const slotRadio =
        doc2.getElementById(
          "ctl00_body_optsalary_1"
        );

      if (rangeRadio?.checked) return "Range";

      if (slotRadio?.checked) return "Slot";

      return "";

    })(),

    minPoint:
      doc2.getElementById("ctl00_body_txtMin")
        ?.value.trim() || "",

    midPoint:
      doc2.getElementById("ctl00_body_txtMid")
        ?.value.trim() || "",

    maxPoint:
      doc2.getElementById("ctl00_body_txtMax")
        ?.value.trim() || ""
  };

  if (response2.status === 200) {
    return updatesalaryGradeData;
  } else {
    return "no update for given salary grade";
  }

})