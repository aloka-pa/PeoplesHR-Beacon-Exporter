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
    const classificationName = args?.classificationName?.toString()?.trim();
    const rankStr = args?.rank?.toString()?.trim();

    if (!classificationName) {
      return { status: "INVALID_ARGS", message: "Error: classificationName is required" };
    }

    if (!rankStr) {
      return { status: "INVALID_ARGS", message: "Error: rank is required" };
    }

    if (!/^\d+$/.test(rankStr)) {
      return { status: "INVALID_ARGS", message: "Error: rank must be a numeric value" };
    }

    if (rankStr.length > 3) {
      return { status: "INVALID_ARGS", message: "Error: rank must be 3 digits or less" };
    }

    /* -------------------------------------------------
     * 3) Helpers
     * ------------------------------------------------- */
    const parser = new DOMParser();

    const extractHidden = (doc, id) => doc.querySelector(`#${id}`)?.value || "";

    const extractUiMessage = (doc, rawHtml) => {
      // 1) PeoplesHR middleware popup
      const msg1 = doc.querySelector("#idHBSAlertMiddleware-message")?.textContent?.trim();
      if (msg1) return msg1;

      // 2) Same message but only class exists
      const msg2 = doc.querySelector(".clsHBSAlertMiddleware-message")?.textContent?.trim();
      if (msg2) return msg2;

      // 3) Legacy/common error blocks
      const msg3 = doc.querySelector(".alert-danger, .error")?.textContent?.trim();
      if (msg3) return msg3;

      // 4) Last-resort string search (in case DOM structure changes)
      if (rawHtml && /cannot duplicate/i.test(rawHtml)) {
        // return a clean standardized message if needed
        // but prefer to return the actual DOM message when available
        return "Qualification classification rank cannot duplicate, please assign a different rank";
      }

      return null;
    };

    /* -------------------------------------------------
     * 4) Initial page state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("QualificationClassific");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const url = `${window.origin}/${reqOptions.sl}/EIM/QualificationClassific.aspx`;

    /* -------------------------------------------------
     * 5) Click "New"
     * ------------------------------------------------- */
    const newFormData = new URLSearchParams();
    newFormData.append("scrollLeft", "0");
    newFormData.append("scrollTop", "0");
    newFormData.append("__EVENTTARGET", "");
    newFormData.append("__EVENTARGUMENT", "");
    newFormData.append("__VIEWSTATE", details.viewState);
    newFormData.append("__VIEWSTATEGENERATOR", details.viewStateGen);
    newFormData.append("__VIEWSTATEENCRYPTED", "");
    newFormData.append("__EVENTVALIDATION", details.eventValidation);
    newFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    newFormData.append("ctl00$hdnQuickmenu", "1");

    // Keep common page state fields
    newFormData.append("ctl00$body$ContentSearch$cboCriteria", "QUALCLASSIFIC_CODE");
    newFormData.append("ctl00$body$ContentSearch$txtContent", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    newFormData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "8");
    newFormData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
    newFormData.append("ctl00_body_grdsummary_ClientState", "");

    newFormData.append("ctl00$body$butNew", "New");

    const newResponse = await fetch(url, {
      method: "POST",
      headers,
      body: newFormData.toString()
    });

    const newHtml = await newResponse.text();
    const newDoc = parser.parseFromString(newHtml, "text/html");

    const newViewState = extractHidden(newDoc, "__VIEWSTATE");
    const newEventValidation = extractHidden(newDoc, "__EVENTVALIDATION");
    const newViewStateGen = extractHidden(newDoc, "__VIEWSTATEGENERATOR");

    if (!newViewState || !newEventValidation || !newViewStateGen) {
      return {
        status: "ERROR",
        message: "Failed to load New form state (missing ViewState/EventValidation)."
      };
    }

    /* -------------------------------------------------
     * 6) Save
     * ------------------------------------------------- */
    const saveFormData = new URLSearchParams();
    saveFormData.append("scrollLeft", "0");
    saveFormData.append("scrollTop", "0");
    saveFormData.append("__EVENTTARGET", "");
    saveFormData.append("__EVENTARGUMENT", "");
    saveFormData.append("__VIEWSTATE", newViewState);
    saveFormData.append("__VIEWSTATEGENERATOR", newViewStateGen);
    saveFormData.append("__VIEWSTATEENCRYPTED", "");
    saveFormData.append("__EVENTVALIDATION", newEventValidation);
    saveFormData.append("ctl00$hdnDateFormat", "dd/mm/yy");
    saveFormData.append("ctl00$hdnQuickmenu", "1");

    saveFormData.append("ctl00$body$txtName", classificationName);
    saveFormData.append("ctl00$body$txtRate", rankStr);
    saveFormData.append("ctl00$body$butSave", "Save");

    const saveResponse = await fetch(url, {
      method: "POST",
      headers,
      body: saveFormData.toString()
    });

    const saveHtml = await saveResponse.text();

    // Baseline: HTTP 200 -> proceed to parse page outcome
    if (saveResponse.status === 200) {
      const saveDoc = parser.parseFromString(saveHtml, "text/html");

      // Detect popup/validation message FIRST
      const uiMsg = extractUiMessage(saveDoc, saveHtml);
      if (uiMsg) {
        if (/rank cannot duplicate/i.test(uiMsg) || /cannot duplicate/i.test(uiMsg) || /duplicate/i.test(uiMsg)) {
          return {
            status: "DUPLICATE_RANK",
            message: uiMsg,
            classificationName,
            rank: rankStr
          };
        }

        return {
          status: "ERROR",
          message: `Save failed: ${uiMsg}`,
          classificationName,
          rank: rankStr
        };
      }

      // If no UI error message, then extract code
      const generatedCode = saveDoc.querySelector("#ctl00_body_txtCode")?.value?.trim() || null;

      // Extra safety: if code is missing, do NOT claim success
      if (!generatedCode) {
        return {
          status: "ERROR",
          message: "Save returned HTTP 200 but no classification code was generated. Please verify in UI.",
          classificationName,
          rank: rankStr
        };
      }

      return {
        status: "SUCCESS",
        message: "Successfully created qualification classification record!",
        classificationName,
        rank: rankStr,
        classificationCode: generatedCode
      };
    }

    return {
      status: "ERROR",
      message: "Save request failed. Please verify in UI.",
      classificationName,
      rank: rankStr
    };

  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
