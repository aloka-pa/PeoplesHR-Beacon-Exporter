(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/QualificationClassific.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Qualification Classification screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Input validation
     * ------------------------------------------------- */
    const classificationCode = args?.classificationCode?.toString()?.trim();
    const newNameRaw = args?.classificationName?.toString();
    const rankRaw = args?.rank;

    if (!classificationCode) {
      return { status: "INVALID_ARGS", message: "Error: classificationCode is required" };
    }

    // At least one field must be provided for update
    if (newNameRaw == null && rankRaw == null) {
      return {
        status: "INVALID_ARGS",
        message: "Error: At least one of classificationName or rank must be provided"
      };
    }

    const requestedName = newNameRaw != null ? newNameRaw.toString().trim() : null;
    const requestedRankStr = rankRaw != null ? rankRaw.toString().trim() : null;

    // Validate rank if provided
    if (requestedRankStr != null) {
      if (!/^\d+$/.test(requestedRankStr)) {
        return { status: "INVALID_ARGS", message: "Error: rank must be a numeric value", field: "rank" };
      }
      // Optional: keep your 3-digit rule if needed
      // if (requestedRankStr.length > 3) {
      //   return { status: "INVALID_ARGS", message: "Error: rank must be a maximum of 3 digits", field: "rank" };
      // }
    }

    /* -------------------------------------------------
     * Helpers
     * ------------------------------------------------- */
    const url = `${window.origin}/${reqOptions.sl}/EIM/QualificationClassific.aspx`;
    const parser = new DOMParser();

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    function readState(doc) {
      return {
        viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
        eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || "",
        viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || ""
      };
    }

    function baseForm(state) {
      const f = new URLSearchParams();
      f.append("scrollLeft", "0");
      f.append("scrollTop", "0");
      f.append("__EVENTTARGET", "");
      f.append("__EVENTARGUMENT", "");
      f.append("__VIEWSTATE", state.viewState);
      f.append("__VIEWSTATEGENERATOR", state.viewStateGen);
      f.append("__VIEWSTATEENCRYPTED", "");
      f.append("__EVENTVALIDATION", state.eventValidation);
      f.append("ctl00$hdnDateFormat", "dd/mm/yy");
      f.append("ctl00$hdnQuickmenu", "1");
      return f;
    }

    async function postAndParse(formData) {
      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();
      const doc = parser.parseFromString(html, "text/html");
      return { res, html, doc };
    }

    function getGridRows(doc) {
      return Array.from(doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']"));
    }

    function getCodeFromRow(row) {
      return row.querySelector("td")?.textContent?.trim() || "";
    }

    function findEditTargetFromRow(row) {
      return row
        .querySelector("a")
        ?.getAttribute("href")
        ?.match(/__doPostBack\('([^']+)'/)?.[1] || "";
    }

    function extractMiddlewareError(html, doc) {
      // DOM-based
      const domMsg = doc?.querySelector("#idHBSAlertMiddleware-message")?.textContent?.trim();

      // Regex-based fallback
      const reMsg = html.match(/id="idHBSAlertMiddleware-message"[^>]*>\s*([^<]+)\s*</i)?.[1]?.trim();

      const msg = domMsg || reMsg || "";

      // Keyword fallback (in case the message is rendered differently)
      const keywordHit =
        /rank\s+cannot\s+duplicate|cannot\s+duplicate|duplicate\s+rank/i.test(html);

      if (msg) return msg;
      if (keywordHit) return "Qualification classification rank cannot duplicate, please assign a different rank";

      return "";
    }

    /* -------------------------------------------------
     * 3) Initial page state from Beacon api list
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("QualificationClassific");

    const initialState = {
      viewState: details.viewState,
      viewStateGen: details.viewStateGen,
      eventValidation: details.eventValidation
    };

    /* -------------------------------------------------
     * 4) Search by Classification Code
     * ------------------------------------------------- */
    {
      const f = baseForm(initialState);
      f.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
      f.append("ctl00$body$ContentSearch$txtContent", classificationCode);
      f.append("ctl00$body$ContentSearch$butSearch", "Search");

      // grid paging fields (keep as you had)
      f.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      f.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      f.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
      f.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      f.append("ctl00_body_grdsummary_ClientState", "");

      var searchResult = await postAndParse(f);
    }

    const searchDoc = searchResult.doc;
    const searchState = readState(searchDoc);

    /* -------------------------------------------------
     * 5) Find row & extract edit postback
     * ------------------------------------------------- */
    const rows = getGridRows(searchDoc);
    let row = null;

    for (const r of rows) {
      const code = getCodeFromRow(r);
      if (code === classificationCode) {
        row = r;
        break;
      }
    }

    if (!row) {
      return {
        status: "NOT_FOUND",
        message: "Qualification Classification not found. Please verify the code.",
        classificationCode
      };
    }

    const editTarget = findEditTargetFromRow(row);
    if (!editTarget) {
      return { status: "ERROR", message: "Unable to open qualification classification record." };
    }

    /* -------------------------------------------------
     * 6) Open detail page (click edit icon in grid)
     * ------------------------------------------------- */
    {
      const f = baseForm(searchState);
      f.set("__EVENTTARGET", editTarget);
      f.set("__EVENTARGUMENT", "");

      // keep search fields as you had
      f.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
      f.append("ctl00$body$ContentSearch$txtContent", classificationCode);

      f.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      f.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      f.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "8");
      f.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      f.append("ctl00_body_grdsummary_ClientState", "");

      var detailResult = await postAndParse(f);
    }

    const detailDoc = detailResult.doc;
    const detailState = readState(detailDoc);

    // current values
    const currentName = detailDoc.querySelector("#ctl00_body_txtName")?.value || "";
    const currentRank = detailDoc.querySelector("#ctl00_body_txtRate")?.value || "";

    /* -------------------------------------------------
     * 7) Click Edit button to enter edit mode
     * ------------------------------------------------- */
    {
      const f = baseForm(detailState);
      f.append("ctl00$body$butEdit", "Edit");

      var editModeResult = await postAndParse(f);
    }

    const editModeDoc = editModeResult.doc;
    const editModeState = readState(editModeDoc);

    /* -------------------------------------------------
     * 8) Compute final values
     * ------------------------------------------------- */
    const finalName = (requestedName != null && requestedName !== "") ? requestedName : currentName;
    const finalRank = (requestedRankStr != null && requestedRankStr !== "") ? requestedRankStr : (currentRank?.toString()?.trim() || "");

    /* -------------------------------------------------
     * 9) PRE-CHECK: Prevent duplicate rank BEFORE saving
     * ------------------------------------------------- */
    // Only run duplicate check if user is trying to change rank
    if (requestedRankStr != null && requestedRankStr !== "" && requestedRankStr !== (currentRank?.toString()?.trim() || "")) {
      // Different environments sometimes use different criteria keys for rank.
      const possibleRankCriteria = [
        "QUALCLASSIFIC_RATE",
        "QUALCLASSIFIC_RANK",
        "QUALCLASSIFIC_RAT",
        "RATE",
        "RANK"
      ];

      let duplicateFound = false;

      for (const crit of possibleRankCriteria) {
        const f = baseForm(initialState);
        f.append("ctl00$body$ContentSearch$cboCriteria", crit);
        f.append("ctl00$body$ContentSearch$txtContent", finalRank);
        f.append("ctl00$body$ContentSearch$butSearch", "Search");

        // grid paging fields
        f.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
        f.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
        f.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");
        f.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
        f.append("ctl00_body_grdsummary_ClientState", "");

        const rankSearch = await postAndParse(f);
        const rankRows = getGridRows(rankSearch.doc);

        // If this criteria works, grid will usually show rows.
        // Check if any row code != current code → duplicate.
        if (rankRows.length > 0) {
          for (const rr of rankRows) {
            const code = getCodeFromRow(rr);
            if (code && code !== classificationCode) {
              duplicateFound = true;
              break;
            }
          }
          // If criteria returned meaningful rows, stop trying other criteria
          // (even if it was only the same record).
          if (!duplicateFound) {
            // still stop: criteria worked and returned results (maybe same record)
          }
          if (duplicateFound || rankRows.length > 0) break;
        }
      }

      if (duplicateFound) {
        return {
          status: "INVALID_ARGS",
          field: "rank",
          message: "Qualification classification rank cannot duplicate. Please enter a different (unique) rank."
        };
      }
    }

    /* -------------------------------------------------
     * 10) Save updated classification name and rank
     * ------------------------------------------------- */
    {
      const f = baseForm(editModeState);
      f.append("ctl00$body$txtName", finalName);
      f.append("ctl00$body$txtRate", finalRank);
      f.append("ctl00$body$butSave", "Save");

      const saveResult = await postAndParse(f);

      // Backup check: detect middleware error from response (even though we pre-checked)
      const uiError = extractMiddlewareError(saveResult.html, saveResult.doc);

      if (uiError) {
        // Duplicate rank specific
        if (/rank\s+cannot\s+duplicate|cannot\s+duplicate|duplicate\s+rank/i.test(uiError)) {
          return {
            status: "INVALID_ARGS",
            field: "rank",
            message: `${uiError}. Please enter a unique rank and try again.`
          };
        }

        return { status: "ERROR", message: uiError };
      }

      if (saveResult.res.status === 200) {
        return {
          status: "SUCCESS",
          message: `Successfully updated qualification classification (${classificationCode}).`,
          classificationCode,
          classificationName: finalName,
          rank: finalRank
        };
      }

      return {
        status: "ERROR",
        message: "Failed to update qualification classification. Please verify in the UI."
      };
    }

  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
})
