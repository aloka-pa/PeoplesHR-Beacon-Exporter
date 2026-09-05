(async function (data, args, reqOptions) {
  try {
    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar.user?.metaData?.menus?.includes("EIM/StationInformation.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Station Information screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Helpers (STRING ONLY)
     * ------------------------------------------------- */
    const okText = (v) => (v ?? "").toString().trim();
    const toLower = (v) => okText(v).toLowerCase();

    const isTruthy = (v) => {
      const t = toLower(v);
      return [
        "true", "1", "yes", "y",
        "all", "available", "existing",
        "list", "showall", "show all", "returnall"
      ].includes(t);
    };

    const stationCode = okText(args?.stationCode);
    const stationName = okText(args?.stationName);
    const transportCost = okText(args?.transportCost);
    const routeName = okText(args?.routeName);

    const returnAll = isTruthy(args?.returnAll) || isTruthy(args?.showAll);

    // If returnAll is used => default to auto-fetch all pages
    const autoFetchAllPages = returnAll ? !isTruthy(args?.autoFetchAllPages) ? true : true : isTruthy(args?.autoFetchAllPages);

    // manual paging support
    const pageNumberRaw = okText(args?.pageNumber) || "1";
    const pageNumber = Number.isFinite(Number(pageNumberRaw)) ? Math.max(1, parseInt(pageNumberRaw, 10)) : 1;

    // keep a reasonable page size; server can cap (your capture shows 2)
    const pageSizeRaw = okText(args?.pageSize) || "100";
    const pageSize = Number.isFinite(Number(pageSizeRaw)) ? Math.max(1, parseInt(pageSizeRaw, 10)) : 100;

    const maxPagesRaw = okText(args?.maxPages) || "50";
    const maxPages = Number.isFinite(Number(maxPagesRaw)) ? Math.max(1, parseInt(maxPagesRaw, 10)) : 50;

    if (!returnAll && !stationCode && !stationName && !transportCost && !routeName) {
      return {
        status: "INVALID_ARGS",
        message:
          "Please provide either stationCode, stationName, transportCost, or routeName. To return all records, pass returnAll as 'true'/'all'/'available'/'existing'/'list'.",
        examples: {
          searchByCode: { stationCode: "000001" },
          searchByName: { stationName: "Kandy" },
          searchByCost: { transportCost: "400.00" },
          searchByRoute: { routeName: "Expressway" },
          returnAll: { returnAll: "all" }
        }
      };
    }

    /* -------------------------------------------------
     * 3) Initial page state + URL
     * ------------------------------------------------- */
    const details = await BeaconBar.executeFunction("getApiList")("StationInformation");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("x-requested-with", "XMLHttpRequest");

    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/StationInformation.aspx");
    const url = updateUrl?.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/StationInformation.aspx`;

    const parser = new DOMParser();

    const extractState = (doc) => ({
      viewState: doc.querySelector("#__VIEWSTATE")?.value || "",
      viewStateGen: doc.querySelector("#__VIEWSTATEGENERATOR")?.value || "",
      eventValidation: doc.querySelector("#__EVENTVALIDATION")?.value || ""
    });

    const extractPagerInfo = (doc) => {
      const pagerText = doc.querySelector(".PagerRight_Default")?.textContent || "";
      // "Displaying page 3 of 4, items 5 to 6 of 8."
      const m = pagerText.match(/Displaying page\s+(\d+)\s+of\s+(\d+).*?of\s+(\d+)/i);
      const currentPage = m ? parseInt(m[1], 10) : 1;
      const totalPages = m ? parseInt(m[2], 10) : 1;
      const totalItems = m ? parseInt(m[3], 10) : null;

      // Map "1","2","3"... -> {target,arg}
      const pageTargets = {};
      doc.querySelectorAll(".PagerLeft_Default a").forEach((a) => {
        const pageNo = (a.textContent || "").trim();
        const href = a.getAttribute("href") || "";
        const mm = href.match(/__doPostBack\('([^']+)','([^']*)'\)/);
        if (pageNo && mm) pageTargets[pageNo] = { target: mm[1], arg: mm[2] || "" };
      });

      return { currentPage, totalPages, totalItems, pageTargets };
    };

    /* -------------------------------------------------
     * 4) Determine search criteria/value (only if not returnAll)
     * ------------------------------------------------- */
    let searchCriteria = "STATION_CODE";
    let searchValue = "";

    if (!returnAll) {
      if (stationCode) {
        searchCriteria = "STATION_CODE";
        searchValue = stationCode;
      } else if (stationName) {
        searchCriteria = "STATION_NAME";
        searchValue = stationName;
      } else if (transportCost) {
        searchCriteria = "STATION_COST";
        searchValue = transportCost;
      } else {
        searchCriteria = "R.RT_NAME";
        searchValue = routeName;
      }
    }

    /* -------------------------------------------------
     * 5) Extract grouped rows (route headers + station rows)
     * ------------------------------------------------- */
    const extractStationsFromDoc = (doc) => {
      const allRows = doc.querySelectorAll("tbody tr");
      const out = [];

      let currentRoute = null;

      const stationNameLower = stationName.toLowerCase();
      const routeNameLower = routeName.toLowerCase();

      for (const row of allRows) {
        // group header row
        if (row.classList.contains("GroupHeader_Default")) {
          const routeText = row.querySelector("p")?.textContent?.trim() || "";
          // "Route : X"
          if (routeText.toLowerCase().includes("route")) {
            currentRoute = routeText.replace(/route\s*:/i, "").trim();
          }
          continue;
        }

        // data row
        if (row.id && row.id.startsWith("ctl00_body_grdsummary_ctl00__")) {
          const cells = row.querySelectorAll("td");

          // layout: [0]=empty, [1]=code, [2]=station, [3]=cost, [4]=edit
          const code = (cells[1]?.textContent || "").trim();
          const name = (cells[2]?.textContent || "").trim();
          const cost = (cells[3]?.querySelector("span")?.textContent || cells[3]?.textContent || "").trim();

          if (!code && !name) continue;

          if (!returnAll) {
            let isMatch = false;

            if (stationCode && code === stationCode) isMatch = true; // exact
            else if (stationName && name.toLowerCase().includes(stationNameLower)) isMatch = true; // partial
            else if (transportCost && cost === transportCost) isMatch = true; // exact string match
            else if (routeName && currentRoute && currentRoute.toLowerCase().includes(routeNameLower)) isMatch = true; // partial route

            if (!isMatch) continue;
          }

          out.push({
            code,
            stationName: name,
            transportCost: cost,
            route: currentRoute
          });
        }
      }

      return out;
    };

    /* -------------------------------------------------
     * 6) POST #1: Search or Show All (page 1)
     * ------------------------------------------------- */
    const postSearchOrAll = async () => {
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
      formData.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

      if (returnAll) formData.append("ctl00$body$ContentSearch$butAll", "Show All");
      else formData.append("ctl00$body$ContentSearch$butSearch", "Search");

      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", "1");
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();
      return parser.parseFromString(html, "text/html");
    };

    /* -------------------------------------------------
     * 7) POST to specific page using numbered pager targets
     * ------------------------------------------------- */
    const postToPage = async (fromDoc, targetPage) => {
      const state = extractState(fromDoc);
      const pager = extractPagerInfo(fromDoc);

      const key = String(targetPage);
      const event = pager.pageTargets[key];
      if (!event?.target) return null;

      const formData = new FormData();
      formData.append("scrollLeft", "0");
      formData.append("scrollTop", "0");
      formData.append("__EVENTTARGET", event.target);
      formData.append("__EVENTARGUMENT", event.arg || "");
      formData.append("__VIEWSTATE", state.viewState);
      formData.append("__VIEWSTATEGENERATOR", state.viewStateGen);
      formData.append("__VIEWSTATEENCRYPTED", "");
      formData.append("__EVENTVALIDATION", state.eventValidation);

      formData.append("ctl00$hdnDateFormat", "dd/mm/yy");
      formData.append("ctl00$hdnQuickmenu", "1");

      // keep search context
      formData.append("ctl00$body$ContentSearch$cboCriteria", searchCriteria);
      formData.append("ctl00$body$ContentSearch$txtContent", returnAll ? "" : searchValue);

      // keep pager fields consistent
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$GoToPageTextBox", key);
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_GoToPageTextBox_ClientState", "");
      formData.append("ctl00$body$grdsummary$ctl00$ctl03$ctl01$ChangePageSizeTextBox", String(pageSize));
      formData.append("ctl00_body_grdsummary_ctl00_ctl03_ctl01_ChangePageSizeTextBox_ClientState", "");
      formData.append("ctl00_body_grdsummary_ClientState", "");

      const res = await fetch(url, { method: "POST", headers, body: formData });
      const html = await res.text();
      return parser.parseFromString(html, "text/html");
    };

    /* -------------------------------------------------
     * 8) Execute
     * ------------------------------------------------- */
    const firstDoc = await postSearchOrAll();
    const pager1 = extractPagerInfo(firstDoc);

    // If returnAll & autoFetchAllPages => loop through every page
    if (returnAll && autoFetchAllPages) {
      const allStations = [];
      let currentDoc = firstDoc;
      let pager = pager1;

      let safety = 0;
      while (safety < maxPages) {
        safety += 1;

        allStations.push(...extractStationsFromDoc(currentDoc));

        if (!(pager.currentPage < pager.totalPages)) break;

        const nextPage = pager.currentPage + 1;
        const nextDoc = await postToPage(currentDoc, nextPage);
        if (!nextDoc) break;

        currentDoc = nextDoc;
        pager = extractPagerInfo(currentDoc);
      }

      if (!allStations.length) {
        return {
          status: "NOT_FOUND",
          message: returnAll
            ? "No Station Information records found."
            : "No Station Information found matching the search criteria."
        };
      }

      return {
        status: "SUCCESS",
        message: `Returned ${allStations.length} Station record(s).`,
        count: allStations.length,
        stations: allStations
      };
    }

    // Manual/single page mode (agent can prompt for next)
    let finalDoc = firstDoc;
    const safePage = Math.min(pageNumber, pager1.totalPages || pageNumber);

    if (safePage > 1) {
      const paged = await postToPage(firstDoc, safePage);
      if (paged) finalDoc = paged;
    }

    const pager = extractPagerInfo(finalDoc);
    const stations = extractStationsFromDoc(finalDoc);

    const moreAvailable = pager.currentPage < pager.totalPages;
    const nextPage = moreAvailable ? String(pager.currentPage + 1) : "";

    if (!stations.length) {
      return {
        status: "NOT_FOUND",
        message: "No Station Information found matching the search criteria.",
        pageNumber: String(pager.currentPage),
        totalPages: String(pager.totalPages || 1),
        moreAvailable: moreAvailable ? "true" : "false",
        nextPage
      };
    }

    return {
      status: "SUCCESS",
      message: moreAvailable
        ? `Returned ${stations.length} station record(s) from page ${pager.currentPage} of ${pager.totalPages}. More are available. Would you like to see the next page?`
        : `Returned ${stations.length} station record(s) from page ${pager.currentPage} of ${pager.totalPages}.`,
      pageNumber: String(pager.currentPage),
      totalPages: String(pager.totalPages || 1),
      moreAvailable: moreAvailable ? "true" : "false",
      nextPage,
      count: stations.length,
      stations
    };
  } catch (err) {
    return {
      status: "ERROR",
      message: err?.message || "Unexpected error",
      error: err?.toString?.() || String(err)
    };
  }
});
