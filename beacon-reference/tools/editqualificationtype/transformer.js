(async function (data, args, reqOptions) {
  try {

    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/QualificationType.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Qualification Type screen. Please contact HR Admin."
      };
    }

    const code = (args?.qualificationTypeCode || "").trim();
    const name = (args?.qualificationTypeName || "").trim();
    const newName = (args?.newQualificationTypeName || "").trim();

    if (!code && !name) {
      return {
        status: "INVALID_ARGS",
        message: "Error: Provide qualificationTypeCode or qualificationTypeName to identify the record."
      };
    }

    if (!newName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: newQualificationTypeName is required to update the Qualification Type name."
      };
    }

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/QualificationType.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/QualificationType.aspx`;

    const details = await BeaconBar.executeFunction("getApiList")("QualificationType");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const parser = new DOMParser();

    const searchCriteria = code ? "QUALIFI_TYPE_CODE" : "QUALIFI_TYPE_NAME"; 
    const searchValue = code || name;

    const searchFormData = new URLSearchParams();
    searchFormData.append("scrollLeft", "0");
    searchFormData.append("scrollTop", "0");
    searchFormData.append("__EVENTTARGET", "");
    searchFormData.append("__EVENTARGUMENT", "");
    searchFormData.append("__VIEWSTATE", details.viewState);
    searchFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    searchFormData.append("__VIEWSTATEENCRYPTED", "");
    searchFormData.append("__EVENTVALIDATION", details.eventValidation);
    searchFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    searchFormData.append("ctl00$hdnQuickmenu", "1");

    searchFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    searchFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);
    searchFormData.append("ctl00$body$ContentSearch$butSearch", "Search");

    searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1000");
    searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    searchFormData.append("ctl00_body_grdsummary_ClientState", "");

    const searchResponse = await fetch(url, {
      method: "POST",
      headers,
      body: searchFormData
    });

    const searchHtml = await searchResponse.text();
    const searchDoc = parser.parseFromString(searchHtml, "text/html");

    const searchViewState = searchDoc.querySelector("#__VIEWSTATE")?.value || "";
    const searchEventValidation = searchDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const searchViewStateGen = searchDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    const rows = Array.from(
      searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']")
    );

    if (rows.length === 0) {
      return {
        status: "NOT_FOUND",
        message: `No Qualification Type records found for ${code ? "code" : "name"}: "${searchValue}".`
      };
    }

    const matches = [];
    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      const rowCode = (cells[0]?.textContent || "").trim();
      const rowName = (cells[1]?.textContent || "").trim();

      if (code) {
        if (rowCode === code) {
          matches.push({ row, code: rowCode, name: rowName });
        }
      } else {
        // partial match
        if (rowName.toLowerCase().includes(name.toLowerCase())) {
          matches.push({ row, code: rowCode, name: rowName });
        }
      }
    }

    if (matches.length === 0) {
      return {
        status: "NOT_FOUND",
        message: `No matching Qualification Type found for ${code ? "code" : "name"}: "${searchValue}".`
      };
    }

    // If multiple matches on partial search -> return list, do not edit
    if (matches.length > 1) {
      return {
        status: "MULTIPLE_MATCHES",
        message: `Found ${matches.length} matching Qualification Types. Please refine your search (or use qualificationTypeCode).`,
        count: matches.length,
        results: matches.map(m => ({
          code: m.code,
          qualificationTypeName: m.name
        }))
      };
    }

    const matched = matches[0];

    const editKey = matched.row
      ?.querySelector("a")
      ?.getAttribute("href")
      ?.match(/__doPostBack\('([^']+)'/)?.[1];

    if (!editKey) {
      return {
        status: "ERROR",
        message: "Unable to open the Qualification Type record (edit key not found)."
      };
    }

    const openFormData = new URLSearchParams();
    openFormData.append("scrollLeft", "0");
    openFormData.append("scrollTop", "0");
    openFormData.append("__EVENTTARGET", editKey);
    openFormData.append("__EVENTARGUMENT", "");
    openFormData.append("__VIEWSTATE", searchViewState);
    openFormData.append("__VIEWSTATEGENERATOR", searchViewStateGen);
    openFormData.append("__VIEWSTATEENCRYPTED", "");
    openFormData.append("__EVENTVALIDATION", searchEventValidation);
    openFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    openFormData.append("ctl00$hdnQuickmenu", "1");
    openFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    openFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);
    openFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    openFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    openFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "1000");
    openFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    openFormData.append("ctl00_body_grdsummary_ClientState", "");

    const detailResponse = await fetch(url, {
      method: "POST",
      headers,
      body: openFormData
    });

    const detailHtml = await detailResponse.text();
    const detailDoc = parser.parseFromString(detailHtml, "text/html");

    const detailViewState = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
    const detailEventValidation = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const detailViewStateGen = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    // Read current values (optional)
    const currentCode =
      detailDoc.querySelector("#ctl00_body_txtCode")?.value ||
      matched.code ||
      "";
    const currentName =
      detailDoc.querySelector("#ctl00_body_txtName")?.value ||
      matched.name ||
      "";

    const editFormData = new URLSearchParams();
    editFormData.append("scrollLeft", "0");
    editFormData.append("scrollTop", "0");
    editFormData.append("__EVENTTARGET", "");
    editFormData.append("__EVENTARGUMENT", "");
    editFormData.append("__VIEWSTATE", detailViewState);
    editFormData.append("__VIEWSTATEGENERATOR", detailViewStateGen);
    editFormData.append("__VIEWSTATEENCRYPTED", "");
    editFormData.append("__EVENTVALIDATION", detailEventValidation);
    editFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    editFormData.append("ctl00$hdnQuickmenu", "1");
    editFormData.append("ctl00$body$butEdit", "Edit");

    const editModeResponse = await fetch(url, {
      method: "POST",
      headers,
      body: editFormData
    });

    const editModeHtml = await editModeResponse.text();
    const editModeDoc = parser.parseFromString(editModeHtml, "text/html");

    const saveViewState = editModeDoc.querySelector("#__VIEWSTATE")?.value || "";
    const saveEventValidation = editModeDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const saveViewStateGen = editModeDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    const saveFormData = new URLSearchParams();
    saveFormData.append("scrollLeft", "0");
    saveFormData.append("scrollTop", "0");
    saveFormData.append("__EVENTTARGET", "");
    saveFormData.append("__EVENTARGUMENT", "");
    saveFormData.append("__VIEWSTATE", saveViewState);
    saveFormData.append("__VIEWSTATEGENERATOR", saveViewStateGen);
    saveFormData.append("__VIEWSTATEENCRYPTED", "");
    saveFormData.append("__EVENTVALIDATION", saveEventValidation);
    saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFormData.append("ctl00$hdnQuickmenu", "1");

    // Field to update:
    saveFormData.append("ctl00$body$txtName", newName);
    saveFormData.append("ctl00$body$butSave", "Save");

    const finalResponse = await fetch(url, {
      method: "POST",
      headers,
      body: saveFormData
    });

    await finalResponse.text();

    if (finalResponse.status === 200) {
      return {
        status: "SUCCESS",
        message: `Successfully updated Qualification Type (${currentCode}).`,
        updated: {
          code: currentCode,
          oldQualificationTypeName: currentName,
          newQualificationTypeName: newName
        }
      };
    }

    return {
      status: "FAILED",
      message: "Failed to update Qualification Type. Please verify in the UI."
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unknown error",
      error: err?.toString?.() || String(err)
    };
  }
})
