(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 0) Helpers (STRING ARGS ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const toLower = (v) => okText(v).toLowerCase();
    const isEmpty = (v) => okText(v) === "";
    const isNumStr = (v) => /^[0-9]+$/.test(okText(v));
    const clampInt = (n, min, max) => Math.max(min, Math.min(max, n));

    const parseIntSafe = (v, def) => {
      const t = okText(v);
      if (!isNumStr(t)) return def;
      const n = Number(t);
      return Number.isFinite(n) ? n : def;
    };

    const isTrue = (v) => ["true", "1", "yes", "y"].includes(toLower(v));

    const isAllRequest = (nameVal, returnAllVal) => {
      if (isTrue(returnAllVal)) return true;
      const t = toLower(nameVal);
      return t === "all" || t === "show all" || t === "*" || t === "showall";
    };

    const getHidden = (doc, sel) => doc.querySelector(sel)?.value ?? "";

    const getPagerText = (doc) => {
      const el = doc.querySelector(".PagerRight_Default");
      return el ? okText(el.textContent) : "";
    };

    const parsePagerMeta = (pagerText) => {
      // Example: "Displaying page 2 of 6, items 6 to 10 of 28."
      const m = pagerText.match(/page\s+(\d+)\s+of\s+(\d+).*?of\s+(\d+)\./i);
      if (!m) return { page: 1, totalPages: 1, totalItems: null };
      return {
        page: Number(m[1]),
        totalPages: Number(m[2]),
        totalItems: Number(m[3])
      };
    };

    const extractUiPageSize = (doc) => {
      // The actual posted value comes from the *name* input:
      // name="ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox"
      const nameSel =
        'input[name="ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox"]';
      const v = okText(doc.querySelector(nameSel)?.value);

      if (isNumStr(v)) return Number(v);

      // Fallback: sometimes only _Value exists
      const valueSel = 'input[id$="_ChangePageSizeTextBox_Value"]';
      const v2 = okText(doc.querySelector(valueSel)?.value);
      if (isNumStr(v2)) return Number(v2);

      // Default fallback
      return 10;
    };

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const out = [];
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          out.push({
            code: okText(cells[0]?.textContent),
            religionName: okText(cells[1]?.textContent)
          });
        }
      }
      return out;
    };

    const buildBaseForm = (docOrDetails) => {
      // docOrDetails may be the initial "details" object or a parsed doc
      const vs =
        docOrDetails?.viewState ?? getHidden(docOrDetails, "#__VIEWSTATE");
      const vsg =
        docOrDetails?.viewStateGen ?? getHidden(docOrDetails, "#__VIEWSTATEGENERATOR");
      const ev =
        docOrDetails?.eventValidation ?? getHidden(docOrDetails, "#__EVENTVALIDATION");

      const fd = new FormData();
      fd.append("scrollLeft", "0");
      fd.append("scrollTop", "0");
      fd.append("__EVENTTARGET", "");
      fd.append("__EVENTARGUMENT", "");
      fd.append("__VIEWSTATE", vs);
      fd.append("__VIEWSTATEGENERATOR", vsg);
      fd.append("__VIEWSTATEENCRYPTED", "");
      fd.append("__EVENTVALIDATION", ev);

      fd.append("ctl00$hdnDateFormat", "dd/mm/yy");
      fd.append("ctl00$hdnQuickmenu", "1");

      // Grid hidden client state
      fd.append("ctl00_body_grdsummary_ClientState", "");

      // These exist in the UI post, keep them present
      fd.append(
        "ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState",
        ""
      );
      fd.append(
        "ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState",
        ""
      );

      return fd;
    };

    const post = async (url, headers, formData) => {
      const res = await fetch(url, { method: "POST", headers, body: formData });
      return await res.text();
    };

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Religion.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Religion screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Args normalization + intent
     * ------------------------------------------------- */
    const religionCode = okText(args?.religionCode);
    const religionName = okText(args?.religionName);
    const pageArg = okText(args?.page);
    const currentPageArg = okText(args?.currentPage);
    const batchSizeArg = okText(args?.batchSize);
    const useUiPageSizeArg = okText(args?.useUiPageSize);
    const returnAllArg = okText(args?.returnAll);

    const wantAll = isAllRequest(religionName, returnAllArg);

    // Validate: must provide code OR name OR request all
    if (!wantAll && isEmpty(religionCode) && isEmpty(religionName)) {
      return {
        status: "INVALID_ARGS",
        message:
          'Provide either "religionCode" (exact) or "religionName" (partial), or set returnAll="true".'
      };
    }

    /* -------------------------------------------------
     * 3) Build URL + initial state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Religion");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Religion.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Religion.aspx`;

    /* -------------------------------------------------
     * 4) First action: Search (code/name) OR Show All
     * ------------------------------------------------- */
    let firstForm = buildBaseForm(details);

    // Default criteria + content
    let searchCriteria = "RLG_NAME";
    let searchValue = religionName;

    if (!isEmpty(religionCode)) {
      searchCriteria = "RLG_CODE";
      searchValue = religionCode;
    }

    // Always set these controls (safe even for Show All)
    firstForm.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    firstForm.append("ctl00$body$ContentSearch$txtContent", wantAll ? "" : searchValue);

    // If Show All requested, click the UI button butAll; otherwise click Search
    if (wantAll) {
      firstForm.append("ctl00$body$ContentSearch$butAll", "Show All");
      // In some screens criteria still required; keep it present
      if (!firstForm.get("ctl00$body$ContentSearch$cboCriteria")) {
        firstForm.append("ctl00$body$ContentSearch$cboCriteria", "RLG_CODE");
      }
    } else {
      firstForm.append("ctl00$body$ContentSearch$butSearch", "Search");
    }

    // Start at page 1
    firstForm.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");

    // Do NOT hardcode 100. Let UI decide first; we will adapt after parsing UI page size.
    // Still must post a value (UI always posts it). Use a safe default 10.
    firstForm.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "10");

    const firstHtml = await post(url, headers, firstForm);
    let doc = parser.parseFromString(firstHtml, "text/html");

    // If no grid rows, return NOT_FOUND
    let rows = extractRows(doc);
    if (rows.length === 0) {
      return {
        status: "NOT_FOUND",
        message: wantAll
          ? "No Religions found."
          : `No Religions found matching "${searchValue}"`,
        searchCriteria,
        searchValue
      };
    }

    /* -------------------------------------------------
     * 5) Decide page size behavior (UI page size vs batch)
     * ------------------------------------------------- */
    const uiPageSize = extractUiPageSize(doc);
    const useUiPageSize = isEmpty(useUiPageSizeArg) ? true : isTrue(useUiPageSizeArg);

    // If using UI page size, we will return exactly that page.
    // If not using UI page size, we keep returning "batchSize" from that page (trim),
    // and user can ask for next page.
    const batchSize = isNumStr(batchSizeArg) ? Number(batchSizeArg) : 10;
    const effectiveReturnSize = useUiPageSize ? uiPageSize : clampInt(batchSize, 1, 500);

    /* -------------------------------------------------
     * 6) Navigate to requested page (supports: "6", "next", "prev")
     * ------------------------------------------------- */
    const pagerMeta1 = parsePagerMeta(getPagerText(doc));
    const totalPagesKnown = pagerMeta1.totalPages || 1;

    let targetPage = 1;

    if (isEmpty(pageArg)) {
      targetPage = 1;
    } else {
      const p = toLower(pageArg);
      if (p === "next") {
        const cur = parseIntSafe(currentPageArg, pagerMeta1.page || 1);
        targetPage = cur + 1;
      } else if (p === "prev" || p === "previous") {
        const cur = parseIntSafe(currentPageArg, pagerMeta1.page || 1);
        targetPage = cur - 1;
      } else if (isNumStr(pageArg)) {
        targetPage = Number(pageArg);
      } else {
        targetPage = 1;
      }
    }

    targetPage = clampInt(targetPage, 1, totalPagesKnown);

    const goToPage = async (desiredPage) => {
      if (desiredPage === (parsePagerMeta(getPagerText(doc)).page || 1)) return;

      const fd = buildBaseForm(doc);

      // Keep current search fields (important on ASP.NET)
      fd.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      fd.append("ctl00$body$ContentSearch$txtContent", wantAll ? "" : searchValue);

      // Preserve / post current page size (UI uses this)
      fd.append(
        "ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox",
        String(uiPageSize)
      );

      // Set page textbox + trigger Go button postback
      fd.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(desiredPage));
      fd.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      fd.set("__EVENTARGUMENT", "");

      const html = await post(url, headers, fd);
      doc = parser.parseFromString(html, "text/html");
    };

    await goToPage(targetPage);

    /* -------------------------------------------------
     * 7) If returnAll=true (or "all"), aggregate ALL pages
     * ------------------------------------------------- */
    const pagerMetaAfter = parsePagerMeta(getPagerText(doc));
    const totalPages = pagerMetaAfter.totalPages || 1;
    const totalItems = pagerMetaAfter.totalItems ?? null;

    if (wantAll) {
      const all = [];
      // Start from page 1 and iterate to totalPages
      for (let p = 1; p <= totalPages; p++) {
        await goToPage(p);
        const pageRows = extractRows(doc);
        all.push(...pageRows);
      }

      return {
        status: "SUCCESS",
        message: `Found ${all.length} Religion(s) (all pages)`,
        searchCriteria: wantAll ? "SHOW_ALL" : searchCriteria,
        searchValue: wantAll ? "ALL" : searchValue,
        page: 1,
        totalPages,
        totalItems,
        pageSize: uiPageSize,
        count: all.length,
        religions: all
      };
    }

    /* -------------------------------------------------
     * 8) Normal mode: return ONE page (UI page size) OR 10-set
     * ------------------------------------------------- */
    rows = extractRows(doc);

    // If user wants 10-per-set, trim the page results
    const returned = rows.slice(0, effectiveReturnSize);

    const pagerMetaFinal = parsePagerMeta(getPagerText(doc));
    const currentPage = pagerMetaFinal.page || targetPage || 1;

    const hasNext = currentPage < (pagerMetaFinal.totalPages || totalPages || 1);
    const hasPrev = currentPage > 1;

    return {
      status: "SUCCESS",
      message: useUiPageSize
        ? `Found ${returned.length} Religion(s) on page ${currentPage} (UI page size = ${uiPageSize}).`
        : `Found ${returned.length} Religion(s) on page ${currentPage} (returned ${effectiveReturnSize} records; UI page size = ${uiPageSize}).`,
      searchCriteria,
      searchValue,
      page: currentPage,
      totalPages,
      totalItems,
      uiPageSize,
      returnedPageSize: effectiveReturnSize,
      count: returned.length,
      religions: returned,
      navigation: {
        hasPrev,
        hasNext,
        nextPage: hasNext ? currentPage + 1 : null,
        prevPage: hasPrev ? currentPage - 1 : null,
        hint: hasNext
          ? `Ask: "get all religions in page ${currentPage + 1}" or set returnAll="true" for all records.`
          : "No more pages."
      }
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message ?? "Unknown error",
      error: err?.toString?.() ?? String(err)
    };
  }
});
