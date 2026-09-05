(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("EIM/SalaryGradeInfo.aspx")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const details = await BeaconBar.executeFunction("getApiList")("SalaryGradeInfo");
  const myHeaders = new Headers();
  myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
  myHeaders.append("Accept-Language", "en-US,en;q=0.9");
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('EIM/SalaryGradeInfo.aspx');
  let url;
  if (updateurl.updateUrl) {
    url = `${window.origin}/${reqOptions.sl}/${updateurl.updateUrl}`;
  } else {
    url = `${window.origin}/${reqOptions.sl}/EIM/SalaryGradeInfo.aspx`;
  }

  // Search Salary Grade
  const searchFormData = new FormData();

  // mandatory ASP.NET fields
  searchFormData.append("scrollLeft", "0");
  searchFormData.append("scrollTop", "0");
  searchFormData.append("__EVENTTARGET", "");
  searchFormData.append("__EVENTARGUMENT", "");
  searchFormData.append("__VIEWSTATE", details.viewState);
  searchFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
  searchFormData.append("__VIEWSTATEENCRYPTED", "");
  searchFormData.append("__EVENTVALIDATION", details.eventValidation);

  // page-specific hidden fields
  searchFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
  searchFormData.append("ctl00$hdnQuickmenu", "1");

  // 🔍 Search criteria
  searchFormData.append(
    "ctl00$body$ContentSearch$cboCriteria",
    "SAGRD.SAL_GRD_NAME" // or SAGRD.SAL_GRD_CODE
  );
  searchFormData.append(
    "ctl00$body$ContentSearch$txtContent",
    args.salaryGradeName // search text
  );
  searchFormData.append(
    "ctl00$body$ContentSearch$butSearch",
    "Search"
  );

  // Telerik RadGrid paging (grdsummary1)
  searchFormData.append(
    "ctl00$body$grdsummary1$ctl00$ctl03$ctl01$GoToPageTextBox",
    "1"
  );
  searchFormData.append(
    "ctl00_body_grdsummary1_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState",
    ""
  );
  searchFormData.append(
    "ctl00$body$grdsummary1$ctl00$ctl03$ctl01$ChangePageSizeTextBox",
    "10"
  );
  searchFormData.append(
    "ctl00_body_grdsummary1_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState",
    ""
  );
  searchFormData.append(
    "ctl00_body_grdsummary1_ClientState",
    ""
  );

  const searchResponse = await fetch(url, {
    method: "POST",
    headers: myHeaders,
    body: searchFormData,
    redirect: "follow"
  });

  const searchHtml = await searchResponse.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(searchHtml, "text/html");

  function getSalaryGradeCode(doc, salaryGradeName) {
    const headers = doc.querySelectorAll(
      "tr.GroupHeader_Default p"
    );

    const targetName = salaryGradeName.trim().toLowerCase();

    for (const p of headers) {
      const text = p.textContent || "";

      // Example text:
      // "Salary Grade  : 000004_Software Engineer"
      const match = text.match(/Salary Grade\s*:\s*(\d+)_([\s\S]+)/i);

      if (!match) continue;

      const code = match[1];           // 000004
      const name = match[2].trim();    // Software Engineer

      if (name.toLowerCase() === targetName) {
        return code;
      }
    }

    return null;
  }

  const salaryGradeCode = getSalaryGradeCode(
    doc,
    args.salaryGradeName
  );

  if (!salaryGradeCode) {
    throw new Error(
      `Salary Grade not found for name: ${args.salaryGradeName}`
    );
  }

  return {
    code: salaryGradeCode
  };
})

