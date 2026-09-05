(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/Province.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Province screen. Please contact HR Admin."
      };
    }

    const parser = new DOMParser();

    /* -------------------------------------------------
     * 2) Helpers
     * ------------------------------------------------- */
    const normalize = (v) => (v ?? "").toString().trim();
    const lower = (v) => normalize(v).toLowerCase();

    const truthy = (v) => {
      if (typeof v === "boolean") return v;
      const s = lower(v);
      return ["1", "true", "yes", "y", "all", "show all", "return all", "get all"].some(
        (k) => s === k || s.includes(k)
      );
    };

    const extractHidden = (doc) => ({
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || ""
    });

    const extractRowsFromGrid = (doc) => {
      const rows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
      const results = [];
      for (const r of rows) {
        const tds = r.querySelectorAll("td");
        const code = normalize(tds[0]?.textContent);
        const name = normalize(tds[1]?.textContent);
        if (code || name) results.push({ provinceCode: code, provinceName: name });
      }
      return results;
    };

    const extractPagerInfo = (doc) => {
      const text = doc.querySelector(".PagerRight_Default")?.textContent || "";
      const m = text.match(
        /Displaying page\s+(\d+)\s+of\s+(\d+),\s+items\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i
      );
      if (!m) return null;
      return {
        currentPage: Number(m[1]),
        totalPages: Number(m[2]),
        from: Number(m[3]),
        to: Number(m[4]),
        totalItems: Number(m[5])
      };
    };

    const buildBaseForm = (viewState, viewStateGen, eventValidation) => {
      const fd = new FormData();
      fd.append("scrollLeft", "0");
      fd.append("scrollTop", "0");
      fd.append("__EVENTTARGET", "");
      fd.append("__EVENTARGUMENT", "");
      fd.append("__VIEWSTATE", viewState || "");
      fd.append("__VIEWSTATEGENERATOR", viewStateGen || "");
      fd.append("__VIEWSTATEENCRYPTED", "");
      fd.append("__EVENTVALIDATION", eventValidation || "");
      fd.append("ctl00$hdnDateFormat", "dd/mm/yy");
      fd.append("ctl00$hdnQuickmenu", "1");
      fd.append("ctl00_body_grdsummary_ClientState", "");
      return fd;
    };

    /* -------------------------------------------------
     * 3) URL + headers + initial state
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("Province");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Province.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Province.aspx`;

    /* -------------------------------------------------
     * 4) Decide mode (LIST vs SEARCH)
     * ------------------------------------------------- */
    const provinceCode = normalize(args?.provinceCode);
    const provinceName = normalize(args?.provinceName);

    const listMode =
      truthy(args?.returnAll) ||
      (Number.isFinite(Number(args?.page)) && Number(args?.page) > 0);

    /* -------------------------------------------------
     * 5) LIST mode
     * ------------------------------------------------- */
    if (listMode) {
      const pageSize = Math.min(40, Math.max(1, Number(args?.pageSize) || 40));
      const page = Math.max(1, Number(args?.page) || 1);

      let fd = buildBaseForm(details.viewState, details.viewStateGen, details.eventValidation);

      fd.append("ctl00$body$ContentSearch$cboCriteria", "PROVINCE_CODE");
      fd.append("ctl00$body$ContentSearch$txtContent", "");
      fd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", String(page));
      fd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      fd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      fd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");

      if (page === 1) {
        fd.append("ctl00$body$ContentSearch$butAll", "Show All");
      } else {
        fd.set(
          "__EVENTTARGET",
          "ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageLinkButton"
        );
      }

      const resp = await fetch(url, { method: "POST", headers, body: fd });
      const html = await resp.text();
      const doc = parser.parseFromString(html, "text/html");

      const pager = extractPagerInfo(doc);
      const rows = extractRowsFromGrid(doc);
      const pageItems = rows.slice(0, pageSize);

      const hasMore = !!(pager && pager.currentPage < pager.totalPages);
      const nextPage = hasMore ? pager.currentPage + 1 : null;

      return {
        status: "SUCCESS",
        mode: "LIST",
        pageSize,
        currentPage: pager?.currentPage ?? page,
        totalPages: pager?.totalPages ?? null,
        totalItems: pager?.totalItems ?? null,
        count: pageItems.length,
        hasMore,
        nextPage,
        provinces: pageItems
      };
    }

    /* -------------------------------------------------
     * 6) SEARCH mode (fixed – no Show All)
     * ------------------------------------------------- */
    if (!provinceCode && !provinceName) {
      return {
        status: "INVALID_ARGS",
        message: "Provide provinceCode or provinceName, or set returnAll=true to list provinces."
      };
    }

    const criteria = provinceCode ? "PROVINCE_CODE" : "PROVINCE_NAME";
    const value = provinceCode || provinceName;

    const matchType = lower(args?.matchType);
    const codeMatch = matchType === "partial" ? "partial" : "exact";
    const nameMatch = matchType === "exact" ? "exact" : "partial";

    let searchFd = buildBaseForm(details.viewState, details.viewStateGen, details.eventValidation);
    searchFd.append("ctl00$body$ContentSearch$cboCriteria", criteria);
    searchFd.append("ctl00$body$ContentSearch$txtContent", value);
    searchFd.append("ctl00$body$ContentSearch$butSearch", "Search");
    searchFd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
    searchFd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
    searchFd.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", "300");
    searchFd.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");

    const searchResp = await fetch(url, { method: "POST", headers, body: searchFd });
    const searchHtml = await searchResp.text();
    const searchDoc = parser.parseFromString(searchHtml, "text/html");

    const rows = extractRowsFromGrid(searchDoc);

    let matches = [];
    if (provinceCode) {
      const q = lower(provinceCode);
      matches = rows.filter((r) =>
        codeMatch === "partial"
          ? lower(r.provinceCode).includes(q)
          : lower(r.provinceCode) === q
      );
    } else {
      const q = lower(provinceName);
      matches = rows.filter((r) =>
        nameMatch === "partial"
          ? lower(r.provinceName).includes(q)
          : lower(r.provinceName) === q
      );
    }

    if (!matches.length) {
      return {
        status: "NOT_FOUND",
        mode: "SEARCH",
        message: `No provinces found for ${criteria} = "${value}".`,
        searchedFor: value
      };
    }

    return {
      status: "SUCCESS",
      mode: "SEARCH",
      criteria,
      matchType: provinceCode ? codeMatch : nameMatch,
      count: matches.length,
      provinces: matches
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: e?.message || "Unknown error",
      error: e?.toString?.() || String(e)
    };
  }
});
