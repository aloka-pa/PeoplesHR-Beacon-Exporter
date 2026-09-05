(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar?.user?.metaData?.menus?.includes("EIM/CurrencyType.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Currency Type screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Input validation
     * - user must provide either currencyCode, currencyName, or currencySymbol
     * - mode default: "search"
     * ------------------------------------------------- */
    const mode = (args?.mode || "search").toString().trim().toLowerCase();
    const currencyCode = args?.currencyCode?.toString()?.trim();
    const currencyName = args?.currencyName?.toString()?.trim();
    const currencySymbol = args?.currencySymbol?.toString()?.trim();

    if (!currencyCode && !currencyName && !currencySymbol && mode !== "showall") {
      return {
        status: "INVALID_ARGS",
        message: "Please provide either currencyCode, currencyName, or currencySymbol (or use mode='showall')"
      };
    }

    /* -------------------------------------------------
     * 3) Helpers
     * ------------------------------------------------- */
    const normalize = (s) =>
      (s ?? "")
        .toString()
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    const parseHtml = (html) => new DOMParser().parseFromString(html, "text/html");

    const getAspState = (doc) => ({
      viewState: doc.querySelector("input[name='__VIEWSTATE']")?.value || "",
      viewStateGen: doc.querySelector("input[name='__VIEWSTATEGENERATOR']")?.value || "",
      eventValidation: doc.querySelector("input[name='__EVENTVALIDATION']")?.value || "",
      radScriptManagerHidden:
        doc.querySelector("input[name='ctl00$body$RadScriptManager1_HiddenField']")?.value ||
        doc.querySelector("#ctl00_body_RadScriptManager1_HiddenField")?.value ||
        ""
    });

    const getPageSizeFromDoc = (doc) => {
      const v =
        doc.querySelector("input[name='ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox']")?.value ||
        doc.querySelector("#ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox")?.value ||
        doc.querySelector("#ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_Value")?.value ||
        doc.querySelector("#ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_text")?.value ||
        "";

      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? String(n) : "10"; // fallback
    };

    const getTotalPagesFromDoc = (doc) => {
      const footer = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const m = footer.match(/of\s+(\d+)\s*,/i);
      if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (Number.isFinite(n) && n > 0) return n;
      }
      return 1;
    };

    const buildBaseForm = (state, pageSize) => {
      const fd = new FormData();
      fd.append("ctl00$body$RadScriptManager1_HiddenField", state.radScriptManagerHidden || "");
      fd.append("scrollLeft", "0");
      fd.append("scrollTop", "0");
      fd.append("__EVENTTARGET", "");
      fd.append("__EVENTARGUMENT", "");
      fd.append("__VIEWSTATE", state.viewState);
      fd.append("__VIEWSTATEGENERATOR", state.viewStateGen);
      fd.append("__VIEWSTATEENCRYPTED", "");
      fd.append("__EVENTVALIDATION", state.eventValidation);

      fd.append("ctl00$hdnDateFormat", "dd/mm/yy");
      fd.append("ctl00$hdnQuickmenu", "1");

      fd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      fd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      fd.append("ctl00_body_grdsummary_ClientState", "");

      fd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      fd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");

      return fd;
    };

    const extractRows = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const list = [];
      for (const row of rows) {
        const tds = row.querySelectorAll("td");
        const code = tds[0]?.textContent?.trim() || "";
        const name = tds[1]?.textContent?.trim() || "";
        const symbol = tds[2]?.textContent?.trim() || "";
        if (code || name || symbol) {
          list.push({ code, currencyName: name, currencySymbol: symbol });
        }
      }
      return list;
    };

    const isMatch = (r) => {
      // If mode=showall and no filters, return all
      if (mode === "showall" && !currencyCode && !currencyName && !currencySymbol) return true;

      if (currencyCode) return normalize(r.code) === normalize(currencyCode);
      if (currencyName) return normalize(r.currencyName).includes(normalize(currencyName)); // smooth partial
      if (currencySymbol) return normalize(r.currencySymbol).includes(normalize(currencySymbol)); // smooth partial
      return false;
    };

    /* -------------------------------------------------
     * 4) URL + headers
     * ------------------------------------------------- */
    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/CurrencyType.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/CurrencyType.aspx`;

    /* -------------------------------------------------
     * 5) Initial state (VIEWSTATE etc.)
     * ------------------------------------------------- */
    const initial = await BeaconBar.executeFunction("getApiList")("CurrencyType");

    let pageSize = "10";

    /* -------------------------------------------------
     * 6) First POST: Search or Show All (lands on page 1)
     * ------------------------------------------------- */
    let searchCriteria = "";
    let searchValue = "";

    if (currencyCode) {
      searchCriteria = "CURRENCY_ID";
      searchValue = currencyCode;
    } else if (currencyName) {
      searchCriteria = "CURRENCY_NAME";
      searchValue = currencyName;
    } else if (currencySymbol) {
      searchCriteria = "CURRENCY_SYMBOL";
      searchValue = currencySymbol;
    } else {
      searchCriteria = "CURRENCY_ID";
      searchValue = "";
    }

    const state0 = {
      viewState: initial.viewState,
      viewStateGen: initial.viewStateGen,
      eventValidation: initial.eventValidation,
      radScriptManagerHidden: "" 
    };

    const fd1 = buildBaseForm(state0, pageSize);

    fd1.set("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
    fd1.set("ctl00$body$ContentSearch$txtContent", searchValue);

    if (mode === "showall") {
      fd1.set("ctl00$body$ContentSearch$butAll", "Show All");
    } else {
      fd1.set("ctl00$body$ContentSearch$butSearch", "Search");
    }

    fd1.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");

    const resp1 = await fetch(url, { method: "POST", headers, body: fd1 });
    const html1 = await resp1.text();
    let doc = parseHtml(html1);

    let state = getAspState(doc);
    pageSize = getPageSizeFromDoc(doc);
    let totalPages = getTotalPagesFromDoc(doc);

    /* -------------------------------------------------
     * 7) Collect from page 1 + loop all pages
     * ------------------------------------------------- */
    const resultsByCode = new Map();

    const collectMatches = (doc) => {
      const rows = extractRows(doc);
      for (const r of rows) {
        if (isMatch(r)) {
          const key = normalize(r.code || `${r.currencyName}|${r.currencySymbol}`);
          resultsByCode.set(key, r);
        }
      }
    };

    collectMatches(doc);

    for (let page = 2; page <= totalPages; page++) {
      const fdPage = buildBaseForm(state, pageSize);

      fdPage.set("__EVENTTARGET", "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton");
      fdPage.set("__EVENTARGUMENT", "");
      fdPage.set("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(page));

      const resp = await fetch(url, { method: "POST", headers, body: fdPage });
      const html = await resp.text();
      doc = parseHtml(html);

      state = getAspState(doc);
      pageSize = getPageSizeFromDoc(doc);

      totalPages = Math.max(totalPages, getTotalPagesFromDoc(doc));

      collectMatches(doc);
    }

    const currencies = Array.from(resultsByCode.values()).sort((a, b) =>
      (a.code || "").localeCompare(b.code || "")
    );

    if (!currencies.length) {
      return { status: "NOT_FOUND", message: "No Currency Types found matching the search criteria" };
    }

    return { status: "SUCCESS", count: currencies.length, currencies };
  } catch (e) {
    return { status: "ERROR", message: `Unexpected error: ${e?.message || e}` };
  }
});
