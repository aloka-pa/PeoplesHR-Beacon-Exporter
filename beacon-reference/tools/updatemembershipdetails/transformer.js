(async function (data, args, reqOptions) {

  if (
    !BeaconBar.user.metaData.menus.includes(
      "EIM/Membership.aspx"
    )
  ) {
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
    await BeaconBar.executeFunction(
      "updateUrlParams"
    )("EIM/Membership.aspx");

  let url;

  if (updateurl.updateUrl) {
    url =
      `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url =
      `${window.origin}/${reqOptions.sl}/EIM/Membership.aspx`;
  }

  const urlencoded1 = new URLSearchParams();

  urlencoded1.append("scrollLeft", "0");
  urlencoded1.append("scrollTop", "0");
  urlencoded1.append("__EVENTTARGET", "");
  urlencoded1.append("__EVENTARGUMENT", "");

  urlencoded1.append(
    "__VIEWSTATE",
    window.md.viewState
  );

  urlencoded1.append(
    "__VIEWSTATEGENERATOR",
    window.md.viewStateGen
  );

  urlencoded1.append("__VIEWSTATEENCRYPTED", "");

  urlencoded1.append(
    "__EVENTVALIDATION",
    window.md.eventValidation
  );

  urlencoded1.append(
    "ctl00$hdnDateFormat",
    "dd/mm/yy"
  );

  urlencoded1.append(
    "ctl00$body$butEdit",
    "Edit"
  );

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded1,
    redirect: "follow"
  };

  return fetch(url, requestOptions1)

    .then(response => response.text())

    .then(html1 => {

      const parser1 = new DOMParser();

      const doc1 = parser1.parseFromString(
        html1,
        "text/html"
      );

      const viewState =
        doc1.querySelector("#__VIEWSTATE")
          ?.value || "";

      const eventValidation =
        doc1.querySelector("#__EVENTVALIDATION")
          ?.value || "";

      const viewStateGen =
        doc1.querySelector("#__VIEWSTATEGENERATOR")
          ?.value || "";

      const urlencoded2 =
        new URLSearchParams();

      urlencoded2.append("scrollLeft", "0");
      urlencoded2.append("scrollTop", "0");
      urlencoded2.append("__EVENTTARGET", "");
      urlencoded2.append("__EVENTARGUMENT", "");

      urlencoded2.append(
        "__VIEWSTATE",
        viewState
      );

      urlencoded2.append(
        "__VIEWSTATEGENERATOR",
        viewStateGen
      );

      urlencoded2.append(
        "__VIEWSTATEENCRYPTED",
        ""
      );

      urlencoded2.append(
        "__EVENTVALIDATION",
        eventValidation
      );

      urlencoded2.append(
        "ctl00$hdnDateFormat",
        "dd/mm/yy"
      );

      urlencoded2.append(
        "ctl00$body$txtName",
        args["ctl00_body_txtName"]
      );

      urlencoded2.append(
        "ctl00$body$dpcountry",
        args["ctl00_body_dpcountry"]
      );

      urlencoded2.append(
        "ctl00$body$butSave",
        "Save"
      );

      const requestOptions2 = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded2,
        redirect: "follow"
      };

      return fetch(url, requestOptions2)

        .then(response => response.text())

        .then(html2 => {

          const parser2 = new DOMParser();

          const doc2 = parser2.parseFromString(
            html2,
            "text/html"
          );

          const getElementValue = (id) =>
            doc2.getElementById(id)
              ?.value?.trim() || "";

          const getSelectedOption = (id) => {

            const select =
              doc2.getElementById(id);

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

          return {

            code:
              getElementValue(
                "ctl00_body_txtCode"
              ),

            membership:
              getElementValue(
                "ctl00_body_txtName"
              ),

            selectedMembershipType:
              getSelectedOption(
                "ctl00_body_dpcountry"
              )

          };

        });

    });

})