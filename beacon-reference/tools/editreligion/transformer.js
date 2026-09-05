(async function (data, args, reqOptions) {
  try {
    /* ---------------------------
     * Helpers (STRING ONLY)
     * --------------------------- */
    const ok = (v) => (v ?? "").toString().trim();
    const low = (v) => ok(v).toLowerCase();
    const isEmpty = (v) => ok(v) === "";

    const getHidden = (doc, sel) => doc.querySelector(sel)?.value ?? "";
    const pick = (doc, selector) => doc.querySelector(selector);

    const parser = new DOMParser();

    /* ---------------------------
     * 1) Access
     * --------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Religion.aspx")) {
      return { status: "NO_ACCESS", message: "You do not have access to Religion screen. Please contact HR Admin." };
    }

    /* ---------------------------
     * 2) Args
     * --------------------------- */
    const religionCode = ok(args?.religionCode);
    const religionSearchName = ok(args?.religionSearchName || args?.searchReligionName || args?.religionName); 
    // NOTE: we also fallback to args.religionName if your tool mapping sends old name there.

    const newReligionName = ok(args?.newReligionName || args?.religionNameNew || args?.updatedReligionName || args?.religionName); 
    // If your current tool mapping uses religionName as the new name, keep it compatible.

    // We MUST be able to distinguish search vs new name.
    // If tool mapping only sends religionName once, we can’t safely infer both.
    // So require newReligionName OR code-based edit.
    if (isEmpty(religionCode) && isEmpty(religionSearchName)) {
      return { status: "INVALID_ARGS", message: 'Provide "religionCode" or "religionSearchName" to locate the record.' };
    }
    if (isEmpty(newReligionName)) {
      return { status: "INVALID_ARGS", message: 'Provide "newReligionName" (new name) to update the record.' };
    }

    /* ---------------------------
     * 3) URL + initial state
     * --------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Religion");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Religion.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Religion.aspx`;

    /* ---------------------------
     * 4) Search
     * --------------------------- */
    const searchFd = new FormData();
    searchFd.append("scrollLeft", "0");
    searchFd.append("scrollTop", "0");
    searchFd.append("__EVENTTARGET", "");
    searchFd.append("__EVENTARGUMENT", "");
    searchFd.append("__VIEWSTATE", details.viewState);
    searchFd.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    searchFd.append("__VIEWSTATEENCRYPTED", "");
    searchFd.append("__EVENTVALIDATION", details.eventValidation);
    searchFd.append("ctl00$hdnDateFormat", "dd/mm/yy");
    searchFd.append("ctl00$hdnQuickmenu", "1");

    const isByCode = !isEmpty(religionCode);
    searchFd.append("ctl00$body$ContentSearch$cboCriteria", isByCode ? "RLG_CODE" : "RLG_NAME");
    searchFd.append("ctl00$body$ContentSearch$txtContent", isByCode ? religionCode : religionSearchName);
    searchFd.append("ctl00$body$ContentSearch$butSearch", "Search");
    searchFd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchFd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "50");

    const searchRes = await fetch(url, { method: "POST", headers, body: searchFd });
    const searchHtml = await searchRes.text();
    const searchDoc = parser.parseFromString(searchHtml, "text/html");

    const searchVS = getHidden(searchDoc, "#__VIEWSTATE");
    const searchEV = getHidden(searchDoc, "#__EVENTVALIDATION");
    const searchVSG = getHidden(searchDoc, "#__VIEWSTATEGENERATOR");

    const gridRows = searchDoc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
    if (!gridRows || gridRows.length === 0) {
      return { status: "NOT_FOUND", message: `No religions found for "${isByCode ? religionCode : religionSearchName}".` };
    }

    // Find matching row: exact code OR partial name (includes)
    let matchRow = null;
    for (const r of gridRows) {
      const tds = r.querySelectorAll("td");
      const code = ok(tds[0]?.textContent);
      const name = ok(tds[1]?.textContent);

      if (isByCode) {
        if (code === religionCode) { matchRow = r; break; }
      } else {
        // partial supported
        if (low(name).includes(low(religionSearchName))) { matchRow = r; break; }
      }
    }

    if (!matchRow) {
      return { status: "NOT_FOUND", message: "Religion not found in the search result grid. Please refine the search." };
    }

    const editTarget = matchRow.querySelector("a")?.getAttribute("href")?.match(/__doPostBack\('([^']+)'/)?.[1];
    if (!editTarget) {
      return { status: "ERROR", message: "Unable to extract row postback to open the record." };
    }

    /* ---------------------------
     * 5) Open record (row click)
     * --------------------------- */
    const openFd = new FormData();
    openFd.append("scrollLeft", "0");
    openFd.append("scrollTop", "0");
    openFd.append("__EVENTTARGET", editTarget);
    openFd.append("__EVENTARGUMENT", "");
    openFd.append("__VIEWSTATE", searchVS);
    openFd.append("__VIEWSTATEGENERATOR", searchVSG);
    openFd.append("__VIEWSTATEENCRYPTED", "");
    openFd.append("__EVENTVALIDATION", searchEV);
    openFd.append("ctl00$hdnDateFormat", "dd/mm/yy");
    openFd.append("ctl00$hdnQuickmenu", "1");

    const detailRes = await fetch(url, { method: "POST", headers, body: openFd });
    const detailHtml = await detailRes.text();
    const detailDoc = parser.parseFromString(detailHtml, "text/html");

    const detailVS = getHidden(detailDoc, "#__VIEWSTATE");
    const detailEV = getHidden(detailDoc, "#__EVENTVALIDATION");
    const detailVSG = getHidden(detailDoc, "#__VIEWSTATEGENERATOR");

    /* ---------------------------
     * 6) Click Edit
     * --------------------------- */
    const editFd = new FormData();
    editFd.append("scrollLeft", "0");
    editFd.append("scrollTop", "0");
    editFd.append("__EVENTTARGET", "");
    editFd.append("__EVENTARGUMENT", "");
    editFd.append("__VIEWSTATE", detailVS);
    editFd.append("__VIEWSTATEGENERATOR", detailVSG);
    editFd.append("__VIEWSTATEENCRYPTED", "");
    editFd.append("__EVENTVALIDATION", detailEV);
    editFd.append("ctl00$hdnDateFormat", "dd/mm/yy");
    editFd.append("ctl00$hdnQuickmenu", "1");
    editFd.append("ctl00$body$butEdit", "Edit");

    const editModeRes = await fetch(url, { method: "POST", headers, body: editFd });
    const editModeHtml = await editModeRes.text();
    const editModeDoc = parser.parseFromString(editModeHtml, "text/html");

    const saveVS = getHidden(editModeDoc, "#__VIEWSTATE");
    const saveEV = getHidden(editModeDoc, "#__EVENTVALIDATION");
    const saveVSG = getHidden(editModeDoc, "#__VIEWSTATEGENERATOR");

    // Grab existing values (so we can post them back if required)
    const codeField =
      pick(editModeDoc, "#ctl00_body_txtCode") || pick(editModeDoc, "input[name='ctl00$body$txtCode']");
    const nameField =
      pick(editModeDoc, "#ctl00_body_txtName") || pick(editModeDoc, "input[name='ctl00$body$txtName']");

    const existingCode = ok(codeField?.value);
    const existingName = ok(nameField?.value);

    if (!nameField) {
      return { status: "ERROR", message: "Edit mode did not expose txtName field. Cannot update." };
    }

    /* ---------------------------
     * 7) Save
     * --------------------------- */
    const saveFd = new FormData();
    saveFd.append("scrollLeft", "0");
    saveFd.append("scrollTop", "0");
    saveFd.append("__EVENTTARGET", "");
    saveFd.append("__EVENTARGUMENT", "");
    saveFd.append("__VIEWSTATE", saveVS);
    saveFd.append("__VIEWSTATEGENERATOR", saveVSG);
    saveFd.append("__VIEWSTATEENCRYPTED", "");
    saveFd.append("__EVENTVALIDATION", saveEV);
    saveFd.append("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFd.append("ctl00$hdnQuickmenu", "1");

    // If code textbox exists, re-post it (some screens require it)
    if (codeField && !isEmpty(existingCode)) {
      saveFd.append("ctl00$body$txtCode", existingCode);
    }

    // Set updated name
    saveFd.append("ctl00$body$txtName", newReligionName);
    saveFd.append("ctl00$body$butSave", "Save");

    const finalRes = await fetch(url, { method: "POST", headers, body: saveFd });
    const finalHtml = await finalRes.text();
    const finalDoc = parser.parseFromString(finalHtml, "text/html");

    // ---------- VERIFY SUCCESS ----------
    // Option 1: if there is a message label (adjust selector if your UI has one)
    const msg =
      ok(finalDoc.querySelector(".alert, .validation-summary-errors, .validation-summary-valid")?.textContent);

    // Option 2: re-check name field in view mode (some pages show a label/span)
    const savedName =
      ok(finalDoc.querySelector("#ctl00_body_lblName")?.textContent) ||
      ok(finalDoc.querySelector("#ctl00_body_txtName")?.value);

    const likelyFailed =
      low(msg).includes("error") ||
      low(msg).includes("failed") ||
      low(msg).includes("invalid");

    const likelyOk =
      !likelyFailed &&
      (low(savedName) === low(newReligionName) || low(finalHtml).includes(low(newReligionName)));

    if (!likelyOk) {
      return {
        status: "SAVE_NOT_CONFIRMED",
        message:
          "Save request returned 200 but update could not be confirmed from the response HTML. Please verify UI, or share the success/error message area HTML so we can lock the selector.",
        debug: {
          searchedBy: isByCode ? "code" : "name",
          searchValue: isByCode ? religionCode : religionSearchName,
          existingName,
          attemptedNewName: newReligionName,
          uiMessage: msg || "(no message found)",
          observedName: savedName || "(not found)"
        }
      };
    }

    return {
      status: "SUCCESS",
      message: `The religion "${existingName || (isByCode ? religionCode : religionSearchName)}" has been successfully updated to "${newReligionName}".`,
      previousName: existingName,
      updatedName: newReligionName,
      code: existingCode || religionCode || ""
    };
  } catch (e) {
    return { status: "ERROR", message: e?.message ?? "Unknown error", error: e?.toString?.() ?? String(e) };
  }
});
