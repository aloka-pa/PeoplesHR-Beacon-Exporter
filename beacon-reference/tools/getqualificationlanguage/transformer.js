(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1. Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Languages.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Languages screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2. Input validation
     *    - Either languageCode or languageName OR returnAll
     * ------------------------------------------------- */
    const returnAllRaw = (args?.returnAll || "").toString().trim().toLowerCase();
    const returnAll =
      ["true", "yes", "y", "1", "all", "showall", "returnall"].includes(returnAllRaw);

    const languageCode = (args?.languageCode || "").toString().trim();
    const languageName = (args?.languageName || "").toString().trim();

    if (!returnAll && !languageCode && !languageName) {
      return {
        status: "INVALID_ARGS",
        message:
          "Error: Provide either languageCode or languageName. To return all records, pass returnAll as 'true' or 'all'.",
        examples: {
          searchByCode: { languageCode: "000006" },
          searchByName: { languageName: "Eng" },
          returnAll: { returnAll: "true" }
        }
      };
    }

    /* -------------------------------------------------
     * 3. Initial page state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Languages");

    const headers = new Headers();
    headers.append(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    );
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")(
      "EIM/Languages.aspx"
    );

    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Languages.aspx`;

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 4. Build POST (Search OR Show All)
     * ------------------------------------------------- */
    let searchCriteria = "LANG_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (languageCode) {
        searchCriteria = "LANG_CODE";
        searchValue = languageCode;
      } else {
        searchCriteria = "LANG_NAME";
        searchValue = languageName;
      }
    }

    const formData = new FormData();
    formData.append("scrollLeft", "0");
    formData.append("scrollTop", "0");
    formData.append("__EVENTTARGET", "");
    formData.append("__EVENTARGUMENT", "");
    formData.append("__VIEWSTATE", details.viewState);
    formData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    formData.append("__VIEWSTATEENCRYPTED", "");
    formData.append("__EVENTVALIDATION", details.eventValidation);
    formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    formData.append("ctl00$hdnQuickmenu", "1");
    formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    formData.append("ctl00$body$ContentSearch$txtContent", searchValue);

    // Key difference: Search vs Show All button
    if (returnAll) {
      formData.append("ctl00$body$ContentSearch$butAll", "Show All");
    } else {
      formData.append("ctl00$body$ContentSearch$butSearch", "Search");
    }

    // Grid paging controls
    formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "100");
    formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    formData.append("ctl00_body_grdsummary_ClientState", "");

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData
    });

    const doc = parser.parseFromString(await response.text(), "text/html");

    /* -------------------------------------------------
     * 5. Extract grid rows
     * ------------------------------------------------- */
    const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");

    if (!rows || rows.length === 0) {
      return {
        status: "NOT_FOUND",
        message: returnAll
          ? "No Language records found."
          : `No Languages found matching "${searchValue}"`,
        searchBy: returnAll ? "all" : (searchCriteria === "LANG_CODE" ? "code" : "name"),
        searchValue: returnAll ? "" : searchValue
      };
    }

    const languages = [];
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        const code = (cells[0]?.textContent || "").trim();
        const name = (cells[1]?.textContent || "").trim();

        // If searching by name, do partial match filter (grid may already filter,
        // but this makes behavior consistent)
        if (!returnAll && searchCriteria === "LANG_NAME" && languageName) {
          if (!name.toLowerCase().includes(languageName.toLowerCase())) continue;
        }

        // If searching by code, enforce exact match
        if (!returnAll && searchCriteria === "LANG_CODE" && languageCode) {
          if (code !== languageCode) continue;
        }

        languages.push({ code, language: name });
      }
    }

    if (!returnAll && languages.length === 0) {
      return {
        status: "NOT_FOUND",
        message: `No Languages found matching "${searchValue}"`,
        searchBy: searchCriteria === "LANG_CODE" ? "code" : "name",
        searchValue: searchValue
      };
    }

    /* -------------------------------------------------
     * 6. Return result
     * ------------------------------------------------- */
    return {
      status: "SUCCESS",
      message: returnAll
        ? `Returned ${languages.length} Language record(s)`
        : `Found ${languages.length} Language(s)`,
      searchBy: returnAll ? "all" : (searchCriteria === "LANG_CODE" ? "code" : "name"),
      searchValue: returnAll ? "" : searchValue,
      count: languages.length,
      languages
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err.message,
      error: err.toString()
    };
  }
});
