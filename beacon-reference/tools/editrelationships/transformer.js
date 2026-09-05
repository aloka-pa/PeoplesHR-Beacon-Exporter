(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Relationship.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Relationship screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args validation
     * ------------------------------------------------- */
    const relationshipCode = (args?.relationshipCode || "").toString().trim();
    const relationshipName = (args?.relationshipName || "").toString().trim();
    const newRelationshipName = (args?.newRelationshipName || "").toString().trim();

    if (!relationshipCode && !relationshipName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: either relationshipCode or relationshipName is required to identify the record"
      };
    }

    if (!newRelationshipName) {
      return {
        status: "INVALID_ARGS",
        message: "Error: newRelationshipName is required to update the record"
      };
    }

    if (newRelationshipName.length > 20) {
      return {
        status: "INVALID_ARGS",
        message: "Error: newRelationshipName must be 20 characters or less"
      };
    }

    /* -------------------------------------------------
     * 3) Initial page state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Relationship");

    const headers = new Headers();
    headers.append(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    );
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Relationship.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Relationship.aspx`;

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 4) Search
     * ------------------------------------------------- */
    let searchCriteria = relationshipCode ? "REL_ID" : "REL_NAME";
    let searchValue = relationshipCode ? relationshipCode : relationshipName;

    const searchFormData = new FormData();
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

    // These exist on this page (from your earlier transformer)
    searchFormData.append("ctl00$body$hdnIsHead", "");
    searchFormData.append("ctl00$body$hdnEditItemIndex", "");
    searchFormData.append("ctl00_body_RadWindowManager1_ClientState", "");
    searchFormData.append("ctl00$body$hdnDefCountry", "");

    // Search fields
    searchFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    searchFormData.append("ctl00$body$ContentSearch$txtContent", searchValue);
    searchFormData.append("ctl00$body$ContentSearch$butSearch", "Search");

    // Grid pager
    searchFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    searchFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "100");
    searchFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    searchFormData.append("ctl00_body_grdSummary_ClientState", "");

    const searchResp = await fetch(url, { method: "POST", headers, body: searchFormData });
    const searchHtml = await searchResp.text();
    const searchDoc = parser.parseFromString(searchHtml, "text/html");

    const searchViewState = searchDoc.querySelector("#__VIEWSTATE")?.value || "";
    const searchEventValidation = searchDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const searchViewStateGen = searchDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    const gridRows = searchDoc.querySelectorAll("tr[id^='ctl00_body_grdSummary_ctl00__']");
    if (!gridRows || gridRows.length === 0) {
      return {
        status: "NOT_FOUND",
        message: `No Relationships found matching "${searchValue}"`
      };
    }

    // Find matching row(s)
    const matches = [];
    const targetNameLower = relationshipName.toLowerCase();

    for (const r of gridRows) {
      const tds = r.querySelectorAll("td");
      const rowCode = (tds[0]?.textContent || "").trim();
      const rowName = (tds[1]?.textContent || "").trim();

      if (relationshipCode && rowCode === relationshipCode) {
        matches.push(r);
      } else if (!relationshipCode && relationshipName && rowName.toLowerCase() === targetNameLower) {
        matches.push(r);
      }
    }

    if (matches.length === 0) {
      return {
        status: "NOT_FOUND",
        message: `Relationship not found: "${searchValue}"`
      };
    }

    if (!relationshipCode && matches.length > 1) {
      // avoid updating the wrong record
      const sample = matches.slice(0, 5).map(r => {
        const tds = r.querySelectorAll("td");
        return { code: (tds[0]?.textContent || "").trim(), relationshipName: (tds[1]?.textContent || "").trim() };
      });

      return {
        status: "AMBIGUOUS",
        message: `Multiple relationships matched the name "${relationshipName}". Please use relationshipCode.`,
        matchesPreview: sample
      };
    }

    const matchRow = matches[0];

    const editKey = matchRow
      .querySelector("a")
      ?.getAttribute("href")
      ?.match(/__doPostBack\('([^']+)'/)?.[1];

    if (!editKey) {
      return {
        status: "ERROR",
        message: "Unable to open relationship record (editKey not found in grid row)"
      };
    }

    /* -------------------------------------------------
     * 5) Row select 
     * ------------------------------------------------- */
    const rowSelectFormData = new FormData();
    rowSelectFormData.append("scrollLeft", "0");
    rowSelectFormData.append("scrollTop", "0");
    rowSelectFormData.append("__EVENTTARGET", editKey);
    rowSelectFormData.append("__EVENTARGUMENT", "");
    rowSelectFormData.append("__VIEWSTATE", searchViewState);
    rowSelectFormData.append("__VIEWSTATEGENERATOR", searchViewStateGen);
    rowSelectFormData.append("__VIEWSTATEENCRYPTED", "");
    rowSelectFormData.append("__EVENTVALIDATION", searchEventValidation);

    rowSelectFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    rowSelectFormData.append("ctl00$hdnQuickmenu", "1");
    rowSelectFormData.append("ctl00$body$hdnIsHead", "");
    rowSelectFormData.append("ctl00$body$hdnEditItemIndex", "");
    rowSelectFormData.append("ctl00_body_RadWindowManager1_ClientState", "");
    rowSelectFormData.append("ctl00$body$hdnDefCountry", "");

    // keep these like your request (present in row select request)
    rowSelectFormData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    rowSelectFormData.append("ctl00$body$ContentSearch$txtContent", "");
    rowSelectFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    rowSelectFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    rowSelectFormData.append("ctl00$body$grdSummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "9");
    rowSelectFormData.append("ctl00_body_grdSummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    rowSelectFormData.append("ctl00_body_grdSummary_ClientState", "");

    const detailResp = await fetch(url, { method: "POST", headers, body: rowSelectFormData });
    const detailHtml = await detailResp.text();
    const detailDoc = parser.parseFromString(detailHtml, "text/html");

    // Pull viewstate from detail screen
    const detailViewState = detailDoc.querySelector("#__VIEWSTATE")?.value || "";
    const detailEventValidation = detailDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const detailViewStateGen = detailDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    // Extract current field values
    const currentCode =
      detailDoc.querySelector("#ctl00_body_txtCode")?.value ||
      detailDoc.querySelector("#ctl00_body_txtcode")?.value ||
      relationshipCode ||
      "";

    const currentRelationshipName =
      detailDoc.querySelector("#ctl00_body_txtName")?.value ||
      detailDoc.querySelector("#ctl00_body_txtname")?.value ||
      "";

    // IMPORTANT: carry these through (server uses them)
    const hdnIsHead = detailDoc.querySelector("#ctl00_body_hdnIsHead")?.value || "";
    const hdnEditItemIndex = detailDoc.querySelector("#ctl00_body_hdnEditItemIndex")?.value || "";
    const radWinState = detailDoc.querySelector("#ctl00_body_RadWindowManager1_ClientState")?.value || "";
    const hdnDefCountry = detailDoc.querySelector("#ctl00_body_hdnDefCountry")?.value || "";

    /* -------------------------------------------------
     * 6) Click Edit (mirror Network tab: only button + hidden)
     * ------------------------------------------------- */
    const editFormData = new FormData();
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
    editFormData.append("ctl00$body$hdnIsHead", hdnIsHead);
    editFormData.append("ctl00$body$hdnEditItemIndex", hdnEditItemIndex);
    editFormData.append("ctl00_body_RadWindowManager1_ClientState", radWinState);
    editFormData.append("ctl00$body$butEdit", "Edit");
    editFormData.append("ctl00$body$hdnDefCountry", hdnDefCountry);

    const editModeResp = await fetch(url, { method: "POST", headers, body: editFormData });
    const editModeHtml = await editModeResp.text();
    const editModeDoc = parser.parseFromString(editModeHtml, "text/html");

    const saveViewState = editModeDoc.querySelector("#__VIEWSTATE")?.value || "";
    const saveEventValidation = editModeDoc.querySelector("#__EVENTVALIDATION")?.value || "";
    const saveViewStateGen = editModeDoc.querySelector("#__VIEWSTATEGENERATOR")?.value || "";

    // In edit mode, the hidden values may change; re-read them
    const saveHdnIsHead = editModeDoc.querySelector("#ctl00_body_hdnIsHead")?.value || hdnIsHead;
    const saveHdnEditItemIndex = editModeDoc.querySelector("#ctl00_body_hdnEditItemIndex")?.value || hdnEditItemIndex;
    const saveRadWinState = editModeDoc.querySelector("#ctl00_body_RadWindowManager1_ClientState")?.value || radWinState;
    const saveHdnDefCountry = editModeDoc.querySelector("#ctl00_body_hdnDefCountry")?.value || hdnDefCountry;

    /* -------------------------------------------------
     * 7) Save (mirror Network tab: txtName + butSave + hidden)
     * ------------------------------------------------- */
    const saveFormData = new FormData();
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
    saveFormData.append("ctl00$body$hdnIsHead", saveHdnIsHead);
    saveFormData.append("ctl00$body$hdnEditItemIndex", saveHdnEditItemIndex);
    saveFormData.append("ctl00_body_RadWindowManager1_ClientState", saveRadWinState);

    // Field you showed in network
    saveFormData.append("ctl00$body$txtName", newRelationshipName);

    // Save button
    saveFormData.append("ctl00$body$butSave", "Save");
    saveFormData.append("ctl00$body$hdnDefCountry", saveHdnDefCountry);

    const finalResp = await fetch(url, { method: "POST", headers, body: saveFormData });
    const finalHtml = await finalResp.text();
    const finalDoc = parser.parseFromString(finalHtml, "text/html");

    // Check common error containers
    const errorMsg =
      finalDoc.querySelector(".alert-danger, .error")?.textContent?.trim() ||
      finalDoc.querySelector("#ctl00_body_lblMessage")?.textContent?.trim() ||
      "";

    if (errorMsg) {
      return {
        status: "ERROR",
        message: `Save failed: ${errorMsg}`
      };
    }

    // Optional: verify updated value if page shows it back
    const savedName =
      finalDoc.querySelector("#ctl00_body_txtName")?.value ||
      finalDoc.querySelector("#ctl00_body_txtname")?.value ||
      newRelationshipName;

    return {
      status: "SUCCESS",
      message: `Successfully updated Relationship (${currentCode || "N/A"})`,
      relationshipCode: currentCode,
      previousRelationshipName: currentRelationshipName,
      newRelationshipName: savedName
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
