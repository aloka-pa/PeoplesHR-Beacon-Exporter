(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Nationality.aspx")) {
      return { status: "NO_ACCESS", message: "You do not have access to Nationality screen. Please contact HR Admin." };
    }

    /* -------------------------------------------------
     * 2) Args validation (strings)
     * ------------------------------------------------- */
    const nationalityCode = (args?.nationalityCode ?? "").toString().trim();
    const searchNationalityName = (args?.searchNationalityName ?? "").toString().trim();
    const newNationalityName = (args?.nationalityName ?? "").toString().trim();

    const applyTo = ((args?.applyTo ?? "single").toString().trim().toLowerCase()); // "single" | "all" (optional)
    const pageSize = ((args?.pageSize ?? "10").toString().trim() || "10");

    if (!nationalityCode && !searchNationalityName) {
      return { status: "INVALID_ARGS", message: "Either nationalityCode or searchNationalityName is required." };
    }
    if (!newNationalityName) {
      return { status: "INVALID_ARGS", message: "nationalityName (new name) is required." };
    }

    /* -------------------------------------------------
     * 3) URL + headers
     * ------------------------------------------------- */
    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Nationality.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Nationality.aspx`;

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const parser = new DOMParser();
    const getHidden = (doc, sel) => doc.querySelector(sel)?.value || "";

    /* -------------------------------------------------
     * 4) Initial page state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Nationality");

    /* -------------------------------------------------
     * 5) SEARCH (matches your network payload style)
     * ------------------------------------------------- */
    const isSearchByCode = !!nationalityCode;
    const criteria = isSearchByCode ? "NAT_CODE" : "NAT_NAME";
    const txtContent = isSearchByCode ? nationalityCode : searchNationalityName;

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
    searchFormData.append("ctl00$body$ContentSearch$cboCriteria", criteria);
    searchFormData.append("ctl00$body$ContentSearch$txtContent", txtContent);
    searchFormData.append("ctl00$body$ContentSearch$butSearch", "Search");

    // pager fields (you had these in network)
    searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    searchFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", pageSize);
    searchFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    searchFormData.append("ctl00_body_grdsummary_ClientState", "");

    const searchResp = await fetch(url, { method: "POST", headers, body: searchFormData });
    const searchHtml = await searchResp.text();
    const searchDoc = parser.parseFromString(searchHtml, "text/html");

    const searchViewState = getHidden(searchDoc, "#__VIEWSTATE");
    const searchEventValidation = getHidden(searchDoc, "#__EVENTVALIDATION");
    const searchViewStateGen = getHidden(searchDoc, "#__VIEWSTATEGENERATOR");

    /* -------------------------------------------------
     * 6) Collect ALL matches on the grid page
     *    (your HTML shows rows like ctl00_body_grdsummary_ctl00__0, __1)
     * ------------------------------------------------- */
    const rows = searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
    const matches = [];

    const needle = (searchNationalityName || "").trim().toLowerCase();

    for (const r of rows) {
      const tds = r.querySelectorAll("td");
      const code = tds[0]?.textContent?.trim() || "";
      const name = tds[1]?.textContent?.trim() || "";

      const isMatch =
        (isSearchByCode && code === nationalityCode) ||
        (!isSearchByCode && name.trim().toLowerCase() === needle);

      if (!isMatch) continue;

      // <a href="javascript:__doPostBack('ctl00$body$grdsummary$ctl00$ctl04$ctl00','')">
      const href = r.querySelector("a")?.getAttribute("href") || "";
      const target = href.match(/__doPostBack\('([^']+)'/)?.[1] || "";

      if (target) {
        matches.push({ nationalityCode: code, nationalityName: name, eventTarget: target });
      }
    }

    if (matches.length === 0) {
      return { status: "NOT_FOUND", message: "Nationality not found. Please verify the provided code/name." };
    }

    // ✅ KEY REQUIREMENT: if searching by NAME and duplicates exist, STOP and ask user
    if (!isSearchByCode && matches.length > 1 && applyTo !== "all") {
      return {
        status: "MULTIPLE_MATCHES",
        message: `There are multiple nationality records with the name "${searchNationalityName}". Which record should be edited? (or say "edit all")`,
        matches: matches.map(m => ({ nationalityCode: m.nationalityCode, nationalityName: m.nationalityName })),
        hint: "Provide nationalityCode to edit one record. To update all matching records, pass applyTo='all'."
      };
    }

    // Choose targets to update
    const targets = (applyTo === "all") ? matches : [matches[0]];

    /* -------------------------------------------------
     * 7) For each target: Row click -> Edit -> Save
     * ------------------------------------------------- */
    const updated = [];
    const failed = [];

    for (const t of targets) {
      // 7.1 Row click (open detail)
      const rowClickForm = new FormData();
      rowClickForm.append("scrollLeft", "0");
      rowClickForm.append("scrollTop", "0");
      rowClickForm.append("__EVENTTARGET", t.eventTarget);
      rowClickForm.append("__EVENTARGUMENT", "");
      rowClickForm.append("__VIEWSTATE", searchViewState);
      rowClickForm.append("__VIEWSTATEGENERATOR", searchViewStateGen);
      rowClickForm.append("__VIEWSTATEENCRYPTED", "");
      rowClickForm.append("__EVENTVALIDATION", searchEventValidation);
      rowClickForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
      rowClickForm.append("ctl00$hdnQuickmenu", "1");

      const detailResp = await fetch(url, { method: "POST", headers, body: rowClickForm });
      const detailHtml = await detailResp.text();
      const detailDoc = parser.parseFromString(detailHtml, "text/html");

      const detailViewState = getHidden(detailDoc, "#__VIEWSTATE");
      const detailEventValidation = getHidden(detailDoc, "#__EVENTVALIDATION");
      const detailViewStateGen = getHidden(detailDoc, "#__VIEWSTATEGENERATOR");

      // 7.2 Click Edit
      const editForm = new FormData();
      editForm.append("scrollLeft", "0");
      editForm.append("scrollTop", "0");
      editForm.append("__EVENTTARGET", "");
      editForm.append("__EVENTARGUMENT", "");
      editForm.append("__VIEWSTATE", detailViewState);
      editForm.append("__VIEWSTATEGENERATOR", detailViewStateGen);
      editForm.append("__VIEWSTATEENCRYPTED", "");
      editForm.append("__EVENTVALIDATION", detailEventValidation);
      editForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
      editForm.append("ctl00$hdnQuickmenu", "1");
      editForm.append("ctl00$body$butEdit", "Edit");

      const editResp = await fetch(url, { method: "POST", headers, body: editForm });
      const editHtml = await editResp.text();
      const editDoc = parser.parseFromString(editHtml, "text/html");

      const editViewState = getHidden(editDoc, "#__VIEWSTATE");
      const editEventValidation = getHidden(editDoc, "#__EVENTVALIDATION");
      const editViewStateGen = getHidden(editDoc, "#__VIEWSTATEGENERATOR");

      // 7.3 Save new name
      const saveForm = new FormData();
      saveForm.append("scrollLeft", "0");
      saveForm.append("scrollTop", "0");
      saveForm.append("__EVENTTARGET", "");
      saveForm.append("__EVENTARGUMENT", "");
      saveForm.append("__VIEWSTATE", editViewState);
      saveForm.append("__VIEWSTATEGENERATOR", editViewStateGen);
      saveForm.append("__VIEWSTATEENCRYPTED", "");
      saveForm.append("__EVENTVALIDATION", editEventValidation);
      saveForm.append("ctl00$hdnDateFormat", "dd/mm/yy");
      saveForm.append("ctl00$hdnQuickmenu", "1");
      saveForm.append("ctl00$body$txtName", newNationalityName);
      saveForm.append("ctl00$body$butSave", "Save");

      const saveResp = await fetch(url, { method: "POST", headers, body: saveForm });
      await saveResp.text();

      if (saveResp.status === 200) {
        updated.push({ nationalityCode: t.nationalityCode, oldName: t.nationalityName, newName: newNationalityName });
      } else {
        failed.push({ nationalityCode: t.nationalityCode, oldName: t.nationalityName, reason: `HTTP ${saveResp.status}` });
      }
    }

    if (updated.length > 0 && failed.length === 0) {
      return {
        status: "SUCCESS",
        message: (updated.length === 1)
          ? "Successfully updated nationality."
          : `Successfully updated ${updated.length} nationalities.`,
        updated
      };
    }

    if (updated.length > 0 && failed.length > 0) {
      return {
        status: "PARTIAL_SUCCESS",
        message: `Updated ${updated.length} nationalities, but ${failed.length} failed.`,
        updated,
        failed
      };
    }

    return { status: "ERROR", message: "Failed to update nationality. Please verify in the UI.", failed };

  } catch (err) {
    return { status: "ERROR", message: err?.message || "Unexpected error", error: err?.toString?.() || String(err) };
  }
});
