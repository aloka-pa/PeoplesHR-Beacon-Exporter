(async function (data, args, reqOptions) {

  /* -------------------------------------------------
   * Access gate - runs before anything else, so a user without
   * the screen is refused before any argument or network work.
   * This is the admin screen (Employee Manual In & Out,
   * PageMode 0) - a different menu entry from the team screen
   * (1) and the self screen (2). Matched with a substring test
   * because the menu entry can carry extra query parameters.
   * ------------------------------------------------- */
  if (
    !BeaconBar.user?.metaData?.menus?.some(menu =>
      menu.includes("TNAV9/ManualInOut/ManualInOut/0?mvc=1")
    )
  ) {
    return { error: true, message: "You do not have access to submit manual In and Out for employees. Please contact HR Admin." };
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  /* -------------------------------------------------
   * Date helpers - the input format follows the culture, the
   * same way the dateFormat tool decides it.
   * ------------------------------------------------- */
  const culture = BeaconBar.user?.metaData?.culture || "en-GB";
  const isUsFormat = culture === "en-US";
  const dateFormatName = isUsFormat ? "MM/DD/YYYY" : "DD/MM/YYYY";

  function parseCultureDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    const first = parts[0], second = parts[1], yyyy = parts[2];
    const dd = isUsFormat ? second : first;
    const mm = isUsFormat ? first : second;
    const d = Number(dd), m = Number(mm), y = Number(yyyy);
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
    if (d < 1 || d > 31 || m < 1 || m > 12 || String(yyyy).trim().length !== 4) return null;
    return { dd: pad(dd), mm: pad(mm), yyyy: String(yyyy).trim() };
  }

  function formatCultureDate(parsed) {
    return isUsFormat
      ? `${parsed.mm}/${parsed.dd}/${parsed.yyyy}`
      : `${parsed.dd}/${parsed.mm}/${parsed.yyyy}`;
  }

  function fromJsDate(jsDate) {
    return { dd: pad(jsDate.getDate()), mm: pad(jsDate.getMonth() + 1), yyyy: String(jsDate.getFullYear()) };
  }

  // The API expects the range as text in the culture's own format.
  function formatRangeDate(jsDate) {
    return formatCultureDate(fromJsDate(jsDate));
  }

  function formatIsoDateOnly(parsed) {
    return `${parsed.yyyy}-${parsed.mm}-${parsed.dd}T00:00:00`;
  }

  // Comparable YYYYMMDD key so range checks never depend on Date parsing.
  function toDateKey(parsed) {
    return Number(`${parsed.yyyy}${parsed.mm}${parsed.dd}`);
  }

  // Comparable YYYYMMDDHHmm key, for checking a time against the grace window.
  function toMinuteKey(parsed, hhmm) {
    if (!parsed || !hhmm || hhmm.indexOf(":") === -1) return null;
    const [h, m] = hhmm.split(":");
    return Number(`${parsed.yyyy}${parsed.mm}${parsed.dd}${pad(h)}${pad(m)}`);
  }

  // Rows carry DatInDate as an ISO string - the unambiguous way to match a day.
  function isoDayOf(value) {
    if (!value || typeof value !== "string") return null;
    return value.split("T")[0];
  }

  /* -------------------------------------------------
   * ShiftToolTip carries the window the server actually enforces:
   * "19.00 - 03.00 [Grace Start Time - 01/03/24 14:00 Grace End Time 02/03/24 13:00]"
   * ------------------------------------------------- */
  function parseGraceWindow(toolTip) {
    if (!toolTip || typeof toolTip !== "string") return null;
    const rx = /Grace Start Time\s*-?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})\s+Grace End Time\s*-?\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})/;
    const m = toolTip.match(rx);
    if (!m) return null;

    function build(a, b, y, h, min) {
      const dd = isUsFormat ? b : a;
      const mm = isUsFormat ? a : b;
      const yyyy = String(y).length === 2 ? `20${y}` : String(y);
      return Number(`${yyyy}${pad(mm)}${pad(dd)}${pad(h)}${pad(min)}`);
    }

    const start = build(m[1], m[2], m[3], m[4], m[5]);
    const end = build(m[6], m[7], m[8], m[9], m[10]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return null;
    return { start, end, text: toolTip.split("[")[0].trim() };
  }

  /* -------------------------------------------------
   * Time helpers - the user always speaks HH:mm, the wire carries
   * the same clock time as HH.MM (16:52 -> 16.52), which is not
   * decimal hours.
   *
   * A value the user just typed goes out as the zero-padded STRING
   * "08.00", not the number 8 - that is what the captured submit
   * sends for the edited row, while every untouched row keeps the
   * number the server gave it (-1 for empty, 14.43 for a punch).
   * Only newly entered times are built here, so this always returns
   * the string form.
   * ------------------------------------------------- */
  function timeToHHMM(hhmm) {
    if (!hhmm || typeof hhmm !== "string" || !hhmm.includes(":")) return null;
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return `${pad(h)}.${pad(m)}`;
  }

  function hhmmToText(val) {
    if (val === null || val === undefined || val === -1) return "";
    const num = Number(val);
    if (!Number.isFinite(num) || num < 0) return "";
    const h = Math.floor(num);
    const m = Math.round((num - h) * 100);
    return `${pad(h)}:${pad(m)}`;
  }

  function hasTime(val) {
    return val !== undefined && val !== null && val !== -1;
  }

  /* -------------------------------------------------
   * Request helpers
   * ------------------------------------------------- */
  function getPathBase(sl) {
    return `${location.origin}/${sl}`;
  }

  function parseJsonLiteral(html, varName) {
    if (!html) return null;
    const rx = new RegExp(`var\\s+${varName}\\s*=\\s*(\\{[\\s\\S]*?\\});`);
    const match = html.match(rx);
    if (!match || !match[1]) return null;
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      return null;
    }
  }

  async function safePostJson(url, payload, headers) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        redirect: "follow"
      });
      const body = await res.json().catch(function () { return null; });
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      return { ok: false, status: 0, body: null };
    }
  }

  async function safeGetJson(url) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "x-requested-with": "XMLHttpRequest" },
        redirect: "follow"
      });
      const body = await res.json().catch(function () { return null; });
      return { ok: res.ok, status: res.status, body };
    } catch (e) {
      return { ok: false, status: 0, body: null };
    }
  }

  // Mirrors the Search Criteria radios: rdoLast7Days (0), rdoLast30Days (1), rdoPeriod (2).
  function getRangeForMode(mode) {
    const today = new Date();
    if (mode === "last7days") {
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
      return { from: formatRangeDate(from), to: formatRangeDate(today) };
    }
    if (mode === "last30days") {
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
      return { from: formatRangeDate(from), to: formatRangeDate(today) };
    }
    // Wide default period, matching what the page falls back to.
    const startOfYear = new Date(today.getFullYear() - 3, 0, 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: formatRangeDate(startOfYear), to: formatRangeDate(endOfMonth) };
  }

  /* -------------------------------------------------
   * Shapes a grid row into the row the Submit button posts.
   * GetGridDataByCriteria returns a read model; SubmitManualAdjustment
   * wants the edit model, and they are not the same shape - the grid
   * carries ShiftHTCode / RosterCode / SubmitStatus / WFMainId /
   * IsTimeExceedsConfiguredGrace / IsShiftAdjustmentLocked / ErrMessage,
   * none of which the real submit sends, and it omits the Old* snapshot
   * and the enablement flags, all of which the real submit does send.
   *
   * ReasonCode is normalised to "-1" (the "no reason" dropdown value)
   * while OldReasonCode keeps the grid's raw "" - they differ on purpose.
   * ------------------------------------------------- */
  function isRowUnlocked(row) {
    return !(row.IsLockedRecord === true || row.IsTimeAdjLocked === 1 || row.IsPeriodLocked === 1);
  }

  function toSubmitRow(row) {
    const shaped = {
      DatInDate: row.DatInDate,
      EmpNumber: row.EmpNumber,
      EmpDisplayNumber: row.EmpDisplayNumber,
      EmpDisplayName: row.EmpDisplayName,
      EmpHeaderName: row.EmpHeaderName,
      ShiftCode: row.ShiftCode,
      ShiftAbbreviation: row.ShiftAbbreviation,
      ShiftColor: row.ShiftColor,
      IsMidNightShift: row.IsMidNightShift,
      AdjShiftCode: row.AdjShiftCode,
      AdjShiftAbbreviation: row.AdjShiftAbbreviation,
      InDate: row.InDate,
      InTime: row.InTime,
      OutDate: row.OutDate,
      OutTime: row.OutTime,
      InOldDate: row.InOldDate,
      InOldTime: row.InOldTime,
      OutOldDate: row.OutOldDate,
      OutOldTime: row.OutOldTime,
      DABreakList: Array.isArray(row.DABreakList) ? row.DABreakList : [],
      DAUpdatedPurchesList: Array.isArray(row.DAUpdatedPurchesList) ? row.DAUpdatedPurchesList : [],
      BreakCount: row.BreakCount,
      PunchesCount: row.PunchesCount,
      ReasonCode: (row.ReasonCode === "" || row.ReasonCode === null || row.ReasonCode === undefined) ? "-1" : row.ReasonCode,
      Comment: row.Comment,
      DynamicColumnText: row.DynamicColumnText,
      LeaveDays: row.LeaveDays,
      LeaveType: row.LeaveType,
      ShortLeaveMinutes: row.ShortLeaveMinutes,
      LeaveDaysLabelString: row.LeaveDaysLabelString,
      IsTimeAdjLocked: row.IsTimeAdjLocked,
      IsPeriodLocked: row.IsPeriodLocked,
      NextInDate: row.NextInDate,
      NextInTime: row.NextInTime,
      IsShiftAdjApproved: row.IsShiftAdjApproved,
      IsNextDayLocked: row.IsNextDayLocked,
      InOutRecordType: row.InOutRecordType,
      RecordStatus: row.RecordStatus,
      IsLockedRecord: row.IsLockedRecord,
      RecordStatusText: row.RecordStatusText,
      InDateText: row.InDateText,
      OutDateText: row.OutDateText,
      InTimeText: row.InTimeText,
      OutTimeText: row.OutTimeText,
      ShiftToolTip: row.ShiftToolTip,
      DayCaption: row.DayCaption,
      DayAbbreviation: row.DayAbbreviation,
      // Before-snapshot - the server reads this as the "old" half of the change.
      OldInDateText: row.InDateText,
      OldOutDateText: row.OutDateText,
      OldInTimeText: row.InTimeText,
      OldOutTimeText: row.OutTimeText,
      OldReasonCode: row.ReasonCode,
      OldComment: row.Comment,
      OldBreakCount: row.BreakCount,
      OldPunchesCount: row.PunchesCount,
      IsSelected: false,
      Message: "",
      DynamicGridDataList: Array.isArray(row.DynamicGridDataList) ? row.DynamicGridDataList : [],
      /* The grid read model carries neither flag - the client derives both
       * from the lock state. Captured rows with IsLockedRecord true or
       * IsTimeAdjLocked 1 go out as false on both, unlocked rows as true,
       * so deriving them keeps a locked row in the tab list honest instead
       * of defaulting it to editable. */
      IsEnabled: row.IsEnabled !== undefined ? row.IsEnabled : isRowUnlocked(row),
      IsAdjustmentEnabled: row.IsAdjustmentEnabled !== undefined ? row.IsAdjustmentEnabled : isRowUnlocked(row),
      IsConfirmationRequired: row.IsConfirmationRequired === true,
      IsOutTimeExceedConfirmed: row.IsOutTimeExceedConfirmed === true,
      IsHighlightInTime: row.IsHighlightInTime === true,
      IsHighlightOutTime: row.IsHighlightOutTime === true,
      AbsentDays: row.AbsentDays,
      NopayHours: row.NopayHours,
      IsShiftOffShift: row.IsShiftOffShift === true
    };

    // A row the server flagged as manually fixed carries the highlight
    // classes back with it - both halves, not just the In.
    if (shaped.IsHighlightInTime) shaped.InTimeHighlightCSS = "ManualTime_Highlight";
    if (shaped.IsHighlightOutTime) shaped.OutTimeHighlightCSS = "ManualTime_Highlight";
    return shaped;
  }

  function pickRowDebug(row) {
    if (!row) return null;
    return {
      DatInDate: row.DatInDate,
      InDateText: row.InDateText,
      OutDateText: row.OutDateText,
      InTime: row.InTime,
      OutTime: row.OutTime,
      InTimeText: row.InTimeText,
      OutTimeText: row.OutTimeText,
      OldInTimeText: row.OldInTimeText,
      OldOutTimeText: row.OldOutTimeText,
      IsSelected: row.IsSelected,
      Comment: row.Comment,
      ReasonCode: row.ReasonCode,
      OldReasonCode: row.OldReasonCode,
      InOutRecordType: row.InOutRecordType,
      RecordStatus: row.RecordStatus,
      IsEnabled: row.IsEnabled,
      IsAdjustmentEnabled: row.IsAdjustmentEnabled,
      IsOutTimeExceedConfirmed: row.IsOutTimeExceedConfirmed,
      BreakCount: row.BreakCount,
      DABreakListCount: Array.isArray(row.DABreakList) ? row.DABreakList.length : 0
    };
  }

  /* -------------------------------------------------
   * Step 1: identify the employee and the date.
   * ------------------------------------------------- */
  if (!args || (!args.employeeNumber && !args.employeeName)) {
    return {
      needsInput: true,
      message: "Please tell me which employee this manual In and Out is for - their employee number or name.",
      missingFields: ["Employee"]
    };
  }

  if (!args.date) {
    return {
      needsInput: true,
      message: `Please tell me the date (${dateFormatName}) you want to add the manual In and Out for.`,
      missingFields: ["Date"],
      expectedDateFormat: dateFormatName
    };
  }

  const parsedDate = parseCultureDate(args.date);
  if (!parsedDate) {
    return { error: true, message: `Invalid date format. Please provide the date as ${dateFormatName}.` };
  }
  const dateText = formatCultureDate(parsedDate);
  const targetIsoDay = `${parsedDate.yyyy}-${parsedDate.mm}-${parsedDate.dd}`;

  const sl = reqOptions.sl;
  const baseUrl = getPathBase(sl);
  const jsonHeaders = {
    "accept": "*/*",
    "content-type": "application/json",
    "x-requested-with": "XMLHttpRequest"
  };
  const ajaxHeaders = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "content-type": "application/json",
    "x-requested-with": "XMLHttpRequest"
  };

  /* -------------------------------------------------
   * Step 2: load the admin "Employee Manual In & Out" page
   * (PageMode 0). updateUrlParams appends the digest the route
   * needs - the raw path returns an incomplete page.
   * ------------------------------------------------- */
  const updateUrl = await BeaconBar.executeFunction("updateUrlParams")(
    "TNAV9/ManualInOut/ManualInOut/0?mvc=1"
  );
  const pageUrl = updateUrl && updateUrl.updateUrl
    ? `${baseUrl}/${updateUrl.updateUrl}`
    : `${baseUrl}/TNAV9/ManualInOut/ManualInOut/0?mvc=1`;

  const pageRes = await fetch(pageUrl, {
    method: "GET",
    headers: { "x-requested-with": "XMLHttpRequest" },
    redirect: "follow"
  });
  const pageHtml = await pageRes.text();

  // filterModel is the page's own search state - LoginEmpNumber is the
  // encoded token every search call on this screen is keyed by.
  const filterModel = parseJsonLiteral(pageHtml, "filterModel") || {};
  const loginEmpMatch = pageHtml.match(/"LoginEmpNumber"\s*:\s*"([^"]+)"/);
  const loggedEmpNumber = filterModel.LoginEmpNumber || (loginEmpMatch ? loginEmpMatch[1] : null);

  if (!loggedEmpNumber) {
    return {
      error: true,
      message: "Unable to initialize the employee search. Please try again.",
      // Structural signals only - no cookies or tokens.
      diagnostics: {
        pageUrl,
        updateUrlProvidedDigest: !!(updateUrl && updateUrl.updateUrl),
        httpStatus: pageRes.status,
        htmlLength: pageHtml.length,
        containsFilterModel: pageHtml.includes("filterModel"),
        containsLoginEmpNumber: pageHtml.includes("LoginEmpNumber"),
        looksLikeLoginPage: /login/i.test(pageHtml.slice(0, 500))
      }
    };
  }

  /* -------------------------------------------------
   * The search dropdown is not part of the page HTML - divSearch comes
   * back empty and the page fills it by loading filterModel's
   * EmployeeSearchURL. That render is what issues the key the feed is
   * keyed by, and it carries its own empNumber token, which is a
   * different nonce from filterModel.LoginEmpNumber. Inventing a key
   * gets a 200 with an empty result set, so the component has to be
   * loaded exactly as the page loads it.
   * ------------------------------------------------- */
  function resolveSearchUrl(rawUrl) {
    if (!rawUrl) return null;
    // The model stores it relative to window.$ROOT (/<sl>/TNAV9/).
    const path = String(rawUrl).replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
    return `${baseUrl}/${path}`;
  }

  function getQueryParam(url, name) {
    const m = String(url || "").match(new RegExp("[?&]" + name + "=([^&]*)"));
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch (e) {
      return m[1];
    }
  }

  function parseSearchKey(html) {
    if (!html) return null;
    const patterns = [
      /data-key="([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})"/,
      /"KeyValue"\s*:\s*"([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})"/,
      /\bkey\s*[:=]\s*['"]([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})['"]/,
      /[?&]key=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
    ];
    for (let i = 0; i < patterns.length; i++) {
      const m = html.match(patterns[i]);
      if (m) return m[1];
    }
    // The component renders exactly one guid - take it rather than fail.
    const anyGuid = html.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    return anyGuid ? anyGuid[0] : null;
  }

  const searchComponentUrl = resolveSearchUrl(filterModel.EmployeeSearchURL || filterModel.EmployeeSearchModalUrl);
  let searchHtml = "";
  let searchStatus = 0;

  if (searchComponentUrl) {
    try {
      const searchRes = await fetch(searchComponentUrl, {
        method: "GET",
        headers: { "x-requested-with": "XMLHttpRequest" },
        redirect: "follow"
      });
      searchStatus = searchRes.status;
      searchHtml = await searchRes.text();
    } catch (e) {
      searchHtml = "";
    }
  }

  const componentKey = parseSearchKey(searchHtml);
  const pageSearchKey = componentKey || parseSearchKey(pageHtml);
  const searchKey = pageSearchKey
    || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  // The component's own empNumber is the token the feed expects; the
  // page-level LoginEmpNumber is the fallback.
  const searchEmpNumber = getQueryParam(filterModel.EmployeeSearchURL || filterModel.EmployeeSearchModalUrl, "empNumber")
    || loggedEmpNumber;

  /* -------------------------------------------------
   * Step 3: find the employee. The dropdown feed takes no search
   * term - it hands back the whole scope 50 at a time with
   * pagination.more, and the widget filters what it has client
   * side. So the matching happens here, page by page, and the
   * first page is requested exactly as the page requests it.
   *
   * Which (empNumber, key) pair the feed accepts is the one thing
   * the captures cannot settle, since both are per-session nonces -
   * so the pairs are tried in order of how the page builds them and
   * the first one that answers with rows wins.
   * ------------------------------------------------- */
  const searchContexts = [];
  function addContext(empNumber, key, label) {
    if (!empNumber || !key) return;
    const duplicate = searchContexts.some(function (c) { return c.empNumber === empNumber && c.key === key; });
    if (!duplicate) searchContexts.push({ empNumber, key, label });
  }
  addContext(searchEmpNumber, searchKey, "component");
  addContext(loggedEmpNumber, searchKey, "loginEmpNumber");
  if (pageSearchKey) {
    const generated = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    addContext(searchEmpNumber, generated, "generatedKey");
  }

  async function fetchTypeaheadPage(context, page) {
    const params = new URLSearchParams({
      empNumber: context.empNumber,
      key: context.key,
      _: String(Date.now())
    });
    // Page 1 is the captured call verbatim; later pages are the
    // select2 infinite-scroll continuation.
    if (page > 1) params.set("page", String(page));

    const result = await safeGetJson(`${baseUrl}/CommonComponents/Search/GetPaginatedTypeaheadList/?${params.toString()}`);
    const body = result.body || {};
    return {
      status: result.status,
      results: Array.isArray(body.results) ? body.results : [],
      hasMore: !!(body.pagination && body.pagination.more)
    };
  }

  /* The feed's id is an internal key, not the employee number on
   * screen - {"id":"00010325","text":"00000007 - George Silva"}.
   * The number the user types is the one in text, so split it out
   * and match on that; id stays the value the token call needs. */
  function displayNumberOf(r) {
    const text = String(r && r.text || "");
    const sep = text.indexOf(" - ");
    return (sep === -1 ? text : text.slice(0, sep)).trim();
  }

  function displayNameOf(r) {
    const text = String(r && r.text || "");
    const sep = text.indexOf(" - ");
    return (sep === -1 ? text : text.slice(sep + 3)).trim();
  }

  function stripZeros(value) {
    return String(value || "").replace(/^0+/, "").toLowerCase();
  }

  const searchTerm = (args.employeeNumber || args.employeeName || "").trim();
  const wantedNumber = (args.employeeNumber || "").toLowerCase().trim();
  const wantedName = (args.employeeName || "").toLowerCase().trim();

  function findMatches(pool) {
    let found = [];
    if (wantedNumber) {
      found = pool.filter(function (r) {
        return displayNumberOf(r).toLowerCase() === wantedNumber;
      });
      // An employee number is often typed without its leading zeros.
      if (found.length === 0) {
        found = pool.filter(function (r) {
          return stripZeros(displayNumberOf(r)) === stripZeros(wantedNumber);
        });
      }
      // Last resort: the internal id, for a caller that already has one.
      if (found.length === 0) {
        found = pool.filter(function (r) {
          return String(r.id || "").toLowerCase().trim() === wantedNumber;
        });
      }
    }
    if (found.length === 0 && wantedName) {
      found = pool.filter(function (r) {
        return displayNameOf(r).toLowerCase() === wantedName;
      });
      if (found.length === 0) {
        found = pool.filter(function (r) {
          return String(r.text || "").toLowerCase().trim() === wantedName;
        });
      }
      if (found.length === 0) {
        found = pool.filter(function (r) {
          return String(r.text || "").toLowerCase().includes(wantedName);
        });
      }
    }
    return found;
  }

  const MAX_SEARCH_PAGES = 40;
  const seenIds = {};
  const candidates = [];
  let matches = [];
  let pagesFetched = 0;
  let moreAvailable = false;
  let firstPageStatus = 0;

  /* Settle on a context first: whichever pair the feed answers with rows
   * for is the one the page itself would have used. */
  let activeContext = null;
  let firstPage = null;
  const contextAttempts = [];

  for (let i = 0; i < searchContexts.length; i++) {
    const attempt = await fetchTypeaheadPage(searchContexts[i], 1);
    contextAttempts.push({
      context: searchContexts[i].label,
      status: attempt.status,
      rows: attempt.results.length
    });
    if (i === 0) firstPageStatus = attempt.status;
    if (attempt.results.length > 0) {
      activeContext = searchContexts[i];
      firstPage = attempt;
      firstPageStatus = attempt.status;
      break;
    }
  }

  if (!activeContext) {
    return {
      error: true,
      message: "The employee search returned nobody, so the employee list could not be read. Please try again, or contact HR Admin if this persists.",
      diagnostics: {
        loadedSearchComponent: !!searchComponentUrl,
        searchComponentStatus: searchStatus,
        foundComponentKey: !!componentKey,
        usedPageSearchKey: !!pageSearchKey,
        contextAttempts
      }
    };
  }

  for (let page = 1; page <= MAX_SEARCH_PAGES; page++) {
    const pageResult = page === 1 ? firstPage : await fetchTypeaheadPage(activeContext, page);
    pagesFetched = page;
    moreAvailable = pageResult.hasMore;

    let added = 0;
    pageResult.results.forEach(function (r) {
      const id = String(r.id || "");
      if (id && seenIds[id]) return;
      if (id) seenIds[id] = true;
      candidates.push(r);
      added++;
    });

    // A page that repeats what we already hold means the feed ignored
    // the page parameter - keep going would loop on the same 50 rows.
    if (added === 0) break;

    matches = findMatches(candidates);
    // An employee number is unique, so a hit on it ends the search, and
    // two hits are already an ambiguity to put to the user. A single
    // name hit is not enough - the same name can sit on a later page,
    // and stopping here would silently pick one of two people.
    if (wantedNumber && matches.length > 0) break;
    if (matches.length > 1) break;
    if (!pageResult.hasMore) break;
  }

  if (matches.length === 0) {
    return {
      error: true,
      message: `Could not find "${searchTerm}" among the employees available to you. Please check the employee number or name.`,
      availableEmployees: candidates.slice(0, 50).map(function (r) { return { employeeNumber: displayNumberOf(r), employee: r.text }; }),
      diagnostics: {
        searchContext: activeContext.label,
        listStatus: firstPageStatus,
        pagesFetched,
        employeesRead: candidates.length,
        moreResultsAvailable: moreAvailable
      }
    };
  }

  // Never guess between people - a wrong pick writes to the wrong person's attendance.
  if (matches.length > 1) {
    return {
      needsInput: true,
      message: `"${searchTerm}" matches more than one employee. Please tell me which one.`,
      missingFields: ["Employee"],
      candidates: matches.slice(0, 25).map(function (r) { return { employeeNumber: displayNumberOf(r), employee: r.text }; })
    };
  }

  const match = matches[0];

  // Identity shown to the user. The typeahead text is the starting point;
  // the grid's EmployeeList and GetDynamicEmployeeSummary refine it once
  // the search has run.
  let employeeLabel = String(match.text || "").trim();
  let employeeDisplayNumber = displayNumberOf(match);
  let employeeDesignation = null;

  /* -------------------------------------------------
   * Step 4: resolve the encoded EmpNumber token the ManualInOut
   * APIs require for the selected employee. This call takes the
   * feed's own id - the internal key, not the display number.
   * ------------------------------------------------- */
  // Same pair the list came back on - a token asked for under a different
  // key belongs to a search context the server does not have.
  const tokenResult = await safeGetJson(
    `${baseUrl}/CommonComponents/Search/GetEmpNumberFromTypeahead/?loggedEmpNumber=${encodeURIComponent(activeContext.empNumber)}&empNumber=${encodeURIComponent(match.id)}&key=${encodeURIComponent(activeContext.key)}&_=${Date.now()}`
  );
  const empToken = tokenResult.body && tokenResult.body.Status ? tokenResult.body.Message : null;

  if (!empToken) {
    return {
      error: true,
      message: `Unable to resolve ${employeeLabel}. Please try again.`,
      diagnostics: {
        tokenStatus: tokenResult.status,
        searchContext: activeContext.label,
        apiMessage: (tokenResult.body && tokenResult.body.Message) || null
      }
    };
  }
  BeaconBar.setSharedData("empNumber", empToken);

  /* -------------------------------------------------
   * Page-load parity: load the roster list for the roster group
   * and resolve the roster the user named, if any.
   * ------------------------------------------------- */
  const rosterGroup = args.rosterGroup || "1";
  const rosterResult = await safePostJson(
    `${baseUrl}/TNAV9/api/Common/GetRostersByGroupId/`,
    { rosterGroup: String(rosterGroup) },
    ajaxHeaders
  );
  const rosterList = Array.isArray(rosterResult.body) ? rosterResult.body : [];

  let rosterCode = args.rosterCode || null;
  if (!rosterCode && args.rosterName) {
    const wanted = String(args.rosterName).toLowerCase().trim();
    const rosterMatch = rosterList.find(function (r) {
      return String(r.RosterName || "").toLowerCase().trim() === wanted;
    }) || rosterList.find(function (r) {
      return String(r.RosterName || "").toLowerCase().includes(wanted);
    });

    if (!rosterMatch) {
      return {
        error: true,
        message: `Could not find a roster named "${args.rosterName}". Please pick one of the available rosters.`,
        availableRosters: rosterList.map(function (r) { return { rosterCode: r.RosterCode, rosterName: r.RosterName }; })
      };
    }
    rosterCode = rosterMatch.RosterCode;
  }

  /* -------------------------------------------------
   * Build the search range from the date-selection mode.
   * ------------------------------------------------- */
  let requestedMode = String(args.dateSelectMode || "period").toLowerCase();
  if (["last7days", "last30days", "period"].indexOf(requestedMode) === -1) {
    return { error: true, message: 'dateSelectMode must be one of "last7days", "last30days" or "period".' };
  }

  const modeRange = getRangeForMode(requestedMode);
  let fromDateText = modeRange.from;
  let toDateText = modeRange.to;

  if (requestedMode === "period") {
    if (args.fromDate) {
      const parsedFrom = parseCultureDate(args.fromDate);
      if (!parsedFrom) return { error: true, message: `Invalid fromDate. Please provide it as ${dateFormatName}.` };
      fromDateText = formatCultureDate(parsedFrom);
    }
    if (args.toDate) {
      const parsedTo = parseCultureDate(args.toDate);
      if (!parsedTo) return { error: true, message: `Invalid toDate. Please provide it as ${dateFormatName}.` };
      toDateText = formatCultureDate(parsedTo);
    }
  }

  const targetKey = toDateKey(parsedDate);
  const fromKey = toDateKey(parseCultureDate(fromDateText));
  const toKey = toDateKey(parseCultureDate(toDateText));

  if (fromKey > toKey) {
    return { error: true, message: `The search range is invalid: From Date (${fromDateText}) is after To Date (${toDateText}).` };
  }
  if (targetKey < fromKey || targetKey > toKey) {
    return {
      error: true,
      message: `${dateText} is outside the selected search range (${fromDateText} - ${toDateText}). Please widen the range so it includes ${dateText}.`,
      searchRange: { dateSelectMode: requestedMode, fromDate: fromDateText, toDate: toDateText }
    };
  }

  /* -------------------------------------------------
   * Step 5: search the employee's grid (PageMode 0).
   * FilterMode "1" is the "Select Employee" radio.
   * ------------------------------------------------- */
  const isGroupByEmployee = args.isGroupByEmployee === true;

  function buildGridPayload(roster) {
    return {
      FromDateText: fromDateText,
      ToDateText: toDateText,
      IsGroupByEmployee: isGroupByEmployee,
      FilterMode: "1",
      EmpNumber: empToken,
      RosterCode: roster,
      callBackId: 1,
      isShowShiftHoursInShiftAdjEnabled: false,
      IsClientUoc: false,
      PageMode: 0
    };
  }

  // The roster dropdown is pre-selected on "000017 - Default Yes", which
  // is what the page sends when nobody touches it, so that is the default
  // here too. An empty code is the fallback, so a roster mismatch never
  // reads as "the day does not exist".
  const rosterAttempts = [];
  if (rosterCode) rosterAttempts.push(rosterCode);
  if (rosterAttempts.indexOf("000017") === -1) rosterAttempts.push("000017");
  rosterAttempts.push("");

  let gridPayload = null;
  let recordList = [];
  let gridEmployeeList = [];
  let usedRosterCode = null;

  for (let i = 0; i < rosterAttempts.length; i++) {
    const attemptPayload = buildGridPayload(rosterAttempts[i]);
    const attempt = await safePostJson(`${baseUrl}/TNAV9/api/ManualInOut/GetGridDataByCriteria/`, attemptPayload, jsonHeaders);
    const rows = (attempt.body && attempt.body.ManualInOutDetailList) || [];
    if (rows.length > 0) {
      gridPayload = attemptPayload;
      recordList = rows;
      gridEmployeeList = (attempt.body && attempt.body.EmployeeList) || [];
      usedRosterCode = rosterAttempts[i];
      break;
    }
    if (gridPayload === null) {
      gridPayload = attemptPayload;
      usedRosterCode = rosterAttempts[i];
    }
    // An explicit roster the user named is not silently replaced.
    if (args.rosterCode || args.rosterName) break;
  }

  /* -------------------------------------------------
   * Search parity: the page loads the employee summary straight after
   * the grid comes back. Its EmployeeData is the authoritative identity
   * for whoever the search actually resolved to - worth showing before
   * an admin confirms a change to someone else's attendance.
   *
   * The EmpNumber tokens are per-response nonces - the grid rows come
   * back with a different one than the typeahead handed us, and the page
   * always uses the freshest.
   * ------------------------------------------------- */
  const gridEmpToken = (recordList[0] && recordList[0].EmpNumber) || empToken;

  /* The grid answers with EmployeeList alongside the rows - the identity
   * of whoever the search actually resolved to. Read it first, so a
   * mismatch between the person asked for and the person found shows up
   * even if the summary call fails. */
  const gridEmployee = gridEmployeeList[0] || null;
  if (gridEmployee) {
    employeeLabel = gridEmployee.EmpCompleteName || gridEmployee.EmpDisplayName || employeeLabel;
    employeeDisplayNumber = gridEmployee.EmpDisplayNumber || employeeDisplayNumber;
    employeeDesignation = gridEmployee.Designation || employeeDesignation;
  }

  const summaryResult = await safePostJson(
    `${baseUrl}/TNAV9/api/Common/GetDynamicEmployeeSummary/`,
    { pageId: 1, empNumber: gridEmpToken, fromDateText, toDateText },
    ajaxHeaders
  );
  const employeeData = (summaryResult.body && summaryResult.body.EmployeeData) || null;
  if (employeeData) {
    employeeLabel = employeeData.EmpCompleteName || employeeData.EmpDisplayName || employeeLabel;
    employeeDisplayNumber = employeeData.EmpDisplayNumber || employeeDisplayNumber;
    employeeDesignation = employeeData.Designation || null;
  }

  const gridRow = recordList.find(function (item) {
    return isoDayOf(item.DatInDate) === targetIsoDay;
  });

  /* -------------------------------------------------
   * The day-state gate. Which grid the date landed in decides
   * everything that follows, so it is settled here - before any time
   * or reason is asked for - rather than after the user has typed them.
   * ------------------------------------------------- */
  if (!gridRow) {
    return {
      error: true,
      message: `${dateText} is not in the Manual In and Out page for ${employeeLabel} - there is no attendance day recorded for that date. Please check the date and try again.`,
      diagnostics: {
        employee: employeeLabel,
        searchedDate: dateText,
        dateSelectMode: requestedMode,
        fromDateText,
        toDateText,
        rosterCode: usedRosterCode,
        rowsReturned: recordList.length
      }
    };
  }

  /* A day sitting in the Valid Swipes grid already has its In and Out
   * recorded - it is an edit, not an add. Hand it to the edit tool with
   * what is on the record so the user can decide. */
  const EDIT_TOOL = "editManualInAndOutByAdmin";

  function handOffToEdit(row) {
    const inText = hasTime(row.InTime) ? (row.InTimeText || hhmmToText(row.InTime)) : null;
    const outText = hasTime(row.OutTime) ? (row.OutTimeText || hhmmToText(row.OutTime)) : null;
    return {
      alreadyExists: true,
      useTool: EDIT_TOOL,
      message: `You have already submitted the manual In and Out for ${employeeLabel} on ${dateText} (In: ${inText || "-"}, Out: ${outText || "-"}). There is nothing to add - to change it, use the ${EDIT_TOOL} tool.`,
      current: {
        employee: employeeLabel,
        employeeNumber: employeeDisplayNumber,
        designation: employeeDesignation,
        date: dateText,
        inDate: row.InDateText || null,
        outDate: row.OutDateText || null,
        inTime: inText,
        outTime: outText,
        shift: row.ShiftAbbreviation || null,
        status: row.RecordStatusText || null,
        comment: row.Comment || null,
        breakCount: row.BreakCount
      }
    };
  }

  if (gridRow.InOutRecordType === 3) {
    return handOffToEdit(gridRow);
  }

  /* -------------------------------------------------
   * The grid is split across tabs by InOutRecordType, and the
   * Submit button posts only the rows of the tab you are on -
   * mixing types in one submit is what the server rejects, so
   * scope the list to the tab the selected day actually lives in.
   * ------------------------------------------------- */
  const tabRecordType = gridRow.InOutRecordType;
  const tabSourceRows = recordList.filter(function (r) { return r.InOutRecordType === tabRecordType; });
  const tabRows = tabSourceRows.map(toSubmitRow);
  const tabIndex = tabSourceRows.findIndex(function (r) { return isoDayOf(r.DatInDate) === targetIsoDay; });
  const targetRow = tabRows[tabIndex];

  /* -------------------------------------------------
   * Valid Swipes parity: the page posts the whole valid-swipe
   * array to GetManuallyTimeFixedData when that tab is opened.
   * ------------------------------------------------- */
  const validSwipeRows = recordList
    .filter(function (r) { return r.InOutRecordType === 3; })
    .map(toSubmitRow);

  const fixedResult = await safePostJson(
    `${baseUrl}/TNAV9/api/ManualInOut/GetManuallyTimeFixedData/`,
    validSwipeRows,
    jsonHeaders
  );
  const fixedList = Array.isArray(fixedResult.body) ? fixedResult.body : [];
  const previouslyManuallyFixed = fixedList.some(function (r) {
    return isoDayOf(r.DatInDate) === targetIsoDay
      && (!gridRow.EmpDisplayNumber || r.EmpDisplayNumber === gridRow.EmpDisplayNumber);
  });

  /* -------------------------------------------------
   * Locked or disabled rows cannot be written to. Catch this
   * here so the user gets a reason instead of a server error
   * after they have already confirmed.
   * ------------------------------------------------- */
  const blockers = [];
  if (targetRow.IsLockedRecord === true) blockers.push("the record is locked");
  if (targetRow.IsTimeAdjLocked === 1) blockers.push("time adjustment is locked");
  if (targetRow.IsPeriodLocked === 1) blockers.push("the attendance period is locked");
  if (targetRow.IsEnabled === false) blockers.push("the record is not editable");
  if (targetRow.IsAdjustmentEnabled === false) blockers.push("adjustments are disabled for this record");

  if (blockers.length > 0) {
    return {
      error: true,
      message: `A manual In and Out cannot be added for ${employeeLabel} on ${dateText} because ${blockers.join(" and ")}. Please contact HR Admin.`,
      current: {
        employee: employeeLabel,
        date: dateText,
        inTime: targetRow.InTimeText || hhmmToText(targetRow.InTime),
        outTime: targetRow.OutTimeText || hhmmToText(targetRow.OutTime)
      }
    };
  }

  /* -------------------------------------------------
   * Step 6: work out what is already there and what is missing.
   * ------------------------------------------------- */
  const hasExistingIn = hasTime(targetRow.InTime);
  const hasExistingOut = hasTime(targetRow.OutTime);

  const currentInText = hasExistingIn ? (targetRow.InTimeText || hhmmToText(targetRow.InTime)) : null;
  const currentOutText = hasExistingOut ? (targetRow.OutTimeText || hhmmToText(targetRow.OutTime)) : null;

  // Backstop for a submitting-grid row that already carries both halves -
  // same answer as the Valid Swipes gate above, there is nothing to add.
  if (hasExistingIn && hasExistingOut) {
    const handOff = handOffToEdit(targetRow);
    handOff.current.previouslyManuallyFixed = previouslyManuallyFixed;
    return handOff;
  }

  // Adding must not silently overwrite the half that is already there.
  if (hasExistingIn && args.inTime && args.inTime !== currentInText) {
    return {
      error: true,
      message: `${dateText} already has an In time of ${currentInText} for ${employeeLabel}. This tool only adds a missing time - changing ${currentInText} to ${args.inTime} is an edit.`,
      current: { employee: employeeLabel, date: dateText, inTime: currentInText, outTime: currentOutText }
    };
  }
  if (hasExistingOut && args.outTime && args.outTime !== currentOutText) {
    return {
      error: true,
      message: `${dateText} already has an Out time of ${currentOutText} for ${employeeLabel}. This tool only adds a missing time - changing ${currentOutText} to ${args.outTime} is an edit.`,
      current: { employee: employeeLabel, date: dateText, inTime: currentInText, outTime: currentOutText }
    };
  }

  /* -------------------------------------------------
   * Step 7: collect In Time, Out Time, reason, and the
   * optional break pair.
   * ------------------------------------------------- */
  const missing = [];
  if (!hasExistingIn && !args.inTime) missing.push("In Time");
  if (!hasExistingOut && !args.outTime) missing.push("Out Time");
  if (!args.reason) missing.push("Reason");

  const shiftWindow = parseGraceWindow(targetRow.ShiftToolTip);

  if (missing.length > 0) {
    return {
      needsInput: true,
      message: `Please give me the following to add the manual In and Out for ${employeeLabel} on ${dateText}: ${missing.join(", ")}. Times are HH:mm. Break In Time and Break Out Time are optional - add them only if you want to.`,
      missingFields: missing,
      current: {
        employee: employeeLabel,
        employeeNumber: employeeDisplayNumber,
        designation: employeeDesignation,
        date: dateText,
        inTime: currentInText,
        outTime: currentOutText,
        shift: targetRow.ShiftAbbreviation || null,
        shiftPeriod: shiftWindow ? shiftWindow.text : null,
        shiftToolTip: targetRow.ShiftToolTip || null,
        status: targetRow.RecordStatusText || null,
        previouslyManuallyFixed
      }
    };
  }

  if ((args.breakInTime && !args.breakOutTime) || (!args.breakInTime && args.breakOutTime)) {
    return {
      needsInput: true,
      message: "You gave only one break time. Please provide both Break In Time and Break Out Time (HH:mm), or leave both out to continue without a break.",
      missingFields: [args.breakInTime ? "Break Out Time" : "Break In Time"]
    };
  }

  /* -------------------------------------------------
   * Validate the new values (HH:mm in, HH.MM on the wire).
   * ------------------------------------------------- */
  let newIn = null;
  if (!hasExistingIn) {
    newIn = timeToHHMM(args.inTime);
    if (newIn === null) {
      return { error: true, message: "In Time must be in HH:mm 24-hour format, e.g. 08:30." };
    }
  }

  let newOut = null;
  if (!hasExistingOut) {
    newOut = timeToHHMM(args.outTime);
    if (newOut === null) {
      return { error: true, message: "Out Time must be in HH:mm 24-hour format, e.g. 17:30." };
    }
  }

  let breakIn = null;
  let breakOut = null;
  if (args.breakInTime) {
    breakIn = timeToHHMM(args.breakInTime);
    if (breakIn === null) {
      return { error: true, message: "Break In Time must be in HH:mm 24-hour format, e.g. 12:00." };
    }
  }
  if (args.breakOutTime) {
    breakOut = timeToHHMM(args.breakOutTime);
    if (breakOut === null) {
      return { error: true, message: "Break Out Time must be in HH:mm 24-hour format, e.g. 13:00." };
    }
  }

  // Whatever is already recorded stays exactly as the grid returned it.
  const finalInTime = hasExistingIn ? targetRow.InTime : newIn;
  const finalOutTime = hasExistingOut ? targetRow.OutTime : newOut;
  const finalInText = hasExistingIn ? currentInText : args.inTime;
  const finalOutText = hasExistingOut ? currentOutText : args.outTime;

  /* -------------------------------------------------
   * The In/Out dates default to whatever the grid pre-filled -
   * on a midnight shift the Out date is legitimately the next
   * day, so never force both to the selected date.
   * ------------------------------------------------- */
  let finalInDateText = targetRow.InDateText;
  let finalOutDateText = targetRow.OutDateText;

  if (args.inDate) {
    const parsedInDate = parseCultureDate(args.inDate);
    if (!parsedInDate) return { error: true, message: `Invalid inDate. Please provide it as ${dateFormatName}.` };
    finalInDateText = formatCultureDate(parsedInDate);
  }
  if (args.outDate) {
    const parsedOutDate = parseCultureDate(args.outDate);
    if (!parsedOutDate) return { error: true, message: `Invalid outDate. Please provide it as ${dateFormatName}.` };
    finalOutDateText = formatCultureDate(parsedOutDate);
  }

  /* -------------------------------------------------
   * Check the times against the shift's grace window. The server
   * enforces this, so surface it in the preview rather than
   * letting the user confirm into a rejection.
   * ------------------------------------------------- */
  const warnings = [];
  let outTimeExceedsGrace = false;

  if (shiftWindow) {
    const inKey = toMinuteKey(parseCultureDate(finalInDateText), finalInText);
    const outKey = toMinuteKey(parseCultureDate(finalOutDateText), finalOutText);

    if (!hasExistingIn && inKey !== null && (inKey < shiftWindow.start || inKey > shiftWindow.end)) {
      warnings.push(`The In time ${finalInText} on ${finalInDateText} falls outside the shift's allowed window (${targetRow.ShiftToolTip}).`);
    }
    if (!hasExistingOut && outKey !== null && (outKey < shiftWindow.start || outKey > shiftWindow.end)) {
      outTimeExceedsGrace = true;
      warnings.push(`The Out time ${finalOutText} on ${finalOutDateText} falls outside the shift's allowed window (${targetRow.ShiftToolTip}). Confirming will submit it anyway, the same as accepting the warning in the UI.`);
    }
    /* A break outside the shift's allowed window is refused outright, not
     * warned about - the record must not be submitted with it. */
    if (breakIn !== null && breakOut !== null) {
      const bInKey = toMinuteKey(parsedDate, args.breakInTime);
      const bOutKey = toMinuteKey(parsedDate, args.breakOutTime);
      const outside = [];
      if (bInKey !== null && (bInKey < shiftWindow.start || bInKey > shiftWindow.end)) {
        outside.push(`Break In Time ${args.breakInTime}`);
      }
      if (bOutKey !== null && (bOutKey < shiftWindow.start || bOutKey > shiftWindow.end)) {
        outside.push(`Break Out Time ${args.breakOutTime}`);
      }
      if (outside.length > 0) {
        return {
          error: true,
          message: `${outside.join(" and ")} ${outside.length > 1 ? "are" : "is"} not within the shift's allowed period, so this cannot be submitted. The shift and its allowed window are: ${targetRow.ShiftToolTip}. Please give break times inside that window.`,
          current: {
            employee: employeeLabel,
            date: dateText,
            shift: targetRow.ShiftAbbreviation || null,
            shiftPeriod: shiftWindow.text,
            shiftToolTip: targetRow.ShiftToolTip || null,
            breakInTime: args.breakInTime,
            breakOutTime: args.breakOutTime
          }
        };
      }
    }
  }

  /* -------------------------------------------------
   * Comment cell parity: opening it loads the day's comment
   * history, keyed by the row's own EmpNumber token - which is
   * not the same token the search was filtered by.
   * ------------------------------------------------- */
  const rowEmpToken = targetRow.EmpNumber || empToken;
  const commentHistoryResult = await safePostJson(
    `${baseUrl}/TNAV9/api/ManualInOut/GetCommentHistoryByDate/`,
    { empNumber: rowEmpToken, datInDateText: dateText },
    ajaxHeaders
  );
  const commentHistory = Array.isArray(commentHistoryResult.body) ? commentHistoryResult.body : [];

  /* -------------------------------------------------
   * Break cell parity: the grid row carries DABreakList null, the
   * real break list comes from GetEmployeeBreaksByDate. It is loaded
   * whether or not a break is being added, because the submitted row
   * carries the day's existing breaks back either way - posting []
   * against a non-zero BreakCount would read as "the break was removed".
   * ------------------------------------------------- */
  const breaksResult = await safePostJson(
    `${baseUrl}/TNAV9/api/ManualInOut/GetEmployeeBreaksByDate/`,
    { empNumber: rowEmpToken, datInDateText: dateText },
    ajaxHeaders
  );
  const existingBreaks = Array.isArray(breaksResult.body) ? breaksResult.body : [];

  const previewData = {
    employee: employeeLabel,
    employeeNumber: employeeDisplayNumber,
    designation: employeeDesignation,
    date: dateText,
    shift: targetRow.ShiftAbbreviation || null,
    shiftPeriod: shiftWindow ? shiftWindow.text : null,
    inDate: finalInDateText,
    outDate: finalOutDateText,
    inTime: { current: currentInText, submitted: finalInText },
    outTime: { current: currentOutText, submitted: finalOutText },
    breakInTime: args.breakInTime || null,
    breakOutTime: args.breakOutTime || null,
    reason: args.reason,
    existingBreakCount: existingBreaks.length,
    commentHistoryCount: commentHistory.length,
    previouslyManuallyFixed,
    warnings
  };

  /* -------------------------------------------------
   * Step 8: nothing is written until the user confirms. This
   * writes to someone else's attendance, so the confirmation
   * names them.
   * ------------------------------------------------- */
  if (!args.confirmed) {
    return {
      needsConfirmation: true,
      preview: previewData,
      message: warnings.length > 0
        ? `Please review the manual In and Out for ${employeeLabel} below - note the warnings - and confirm before I submit it.`
        : `Please review the manual In and Out for ${employeeLabel} below and confirm before I submit it.`,
      confirmationPrompt: `Are you sure you want to submit this for ${employeeLabel}? Reply yes to submit, or no to make changes.`
    };
  }

  /* -------------------------------------------------
   * Step 9: submit. IsSelected is the row checkbox and is true
   * only on the row being written to. Every Old* field keeps its
   * pre-submit value so the server sees the before/after pair.
   * ------------------------------------------------- */
  function buildUpdatedRow(row, forceOutTimeExceedConfirmed) {
    const updated = Object.assign({}, row, {
      InTime: finalInTime,
      OutTime: finalOutTime,
      InTimeText: finalInText || "",
      OutTimeText: finalOutText || "",
      InDateText: finalInDateText,
      OutDateText: finalOutDateText,
      Comment: args.reason,
      IsSelected: true,
      IsOutTimeExceedConfirmed: forceOutTimeExceedConfirmed === true ? true : row.IsOutTimeExceedConfirmed === true
    });

    // The knockout binding stamps the "changed cell" class on whichever
    // half was actually typed into, and the submit carries it along.
    if (!hasExistingIn) updated.InTimeHighlightCSS = "ChangeCell_Highlight";
    if (!hasExistingOut) updated.OutTimeHighlightCSS = "ChangeCell_Highlight";

    // The day's existing breaks ride along untouched (ActionType 0), the
    // way the captured submit carries whatever the break cell had loaded.
    updated.DABreakList = existingBreaks.slice();
    updated.BreakCount = existingBreaks.length;

    if (breakIn !== null && breakOut !== null) {
      const datInDate = row.DatInDate || formatIsoDateOnly(parsedDate);
      const baseSeq = existingBreaks.reduce(function (maxVal, br) {
        const seq = Number(br && br.SeqNo);
        return Number.isFinite(seq) && seq > maxVal ? seq : maxVal;
      }, 0);

      // ActionType is 1 on a break added through the grid - the captured
      // submit sends 1 for a break the day did not have before, with the
      // BStart/BEnd Old* pair left empty.
      updated.DABreakList = existingBreaks.concat([{
        DatInDate: datInDate,
        EmpNumber: row.EmpNumber || empToken,
        SeqNo: baseSeq + 1,
        BStartDate: datInDate,
        BStartTime: breakIn,
        BEndDate: datInDate,
        BEndTime: breakOut,
        BStartOldDate: null,
        BStartOldTime: -1,
        BEndOldDate: null,
        BEndOldTime: -1,
        BStartDateText: dateText,
        BEndDateText: dateText,
        BStartTimeText: args.breakInTime,
        BEndTimeText: args.breakOutTime,
        ActionType: 1
      }]);
      updated.BreakCount = updated.DABreakList.length;
    }

    return updated;
  }

  // The captured payload carries exactly these two keys; this screen is
  // the same view model with PageMode 0.
  async function submitList(detailList) {
    const payload = { PageMode: 0, ManualInOutDetailList: detailList };
    const raw = await fetch(`${baseUrl}/TNAV9/api/ManualInOut/SubmitManualAdjustment/`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
      redirect: "follow"
    });
    const result = await raw.json().catch(function () { return {}; });
    return { raw, result, payload };
  }

  function succeeded(attempt) {
    return attempt.raw.ok && attempt.result && attempt.result.Status === true;
  }

  function listWith(updatedRow) {
    return tabRows.map(function (row, idx) {
      if (idx === tabIndex) return updatedRow;
      return Object.assign({}, row, { IsSelected: false });
    });
  }

  let updatedRow = buildUpdatedRow(targetRow, outTimeExceedsGrace);
  let submitAttempt = await submitList(listWith(updatedRow));
  let retriedWithGraceConfirmed = false;
  let retriedWithSingleRow = false;

  /* The page shows an "out time exceeds the configured grace" dialog and
   * resubmits with the flag set once the user clicks OK. Our own confirm
   * step is that OK, so replay it if the server asks and we have not
   * already set the flag from the grace check above. */
  if (!succeeded(submitAttempt) && !outTimeExceedsGrace) {
    const askedForConfirmation = (submitAttempt.result && submitAttempt.result.IsConfirmationRequired === true)
      || (Array.isArray(submitAttempt.result && submitAttempt.result.ManualInOutDetailList)
        && submitAttempt.result.ManualInOutDetailList.some(function (r) { return r && r.IsConfirmationRequired === true; }));

    if (askedForConfirmation || gridRow.IsTimeExceedsConfiguredGrace === true || gridRow.IsConfirmationRequired === true) {
      updatedRow = buildUpdatedRow(targetRow, true);
      submitAttempt = await submitList(listWith(updatedRow));
      retriedWithGraceConfirmed = true;
    }
  }

  // A 5xx on the full tab list can mean the server choked on an unrelated
  // row - retry once with only the row being written to.
  if (!succeeded(submitAttempt) && submitAttempt.raw.status >= 500) {
    submitAttempt = await submitList([updatedRow]);
    retriedWithSingleRow = true;
  }

  const submitRaw = submitAttempt.raw;
  const submitResult = submitAttempt.result;

  if (!succeeded(submitAttempt)) {
    const instance = submitResult && submitResult.instance ? String(submitResult.instance) : "";
    const instanceTrace = instance.includes(":") ? instance.split(":").pop() : null;
    return {
      error: true,
      message: (submitResult && submitResult.Message) || (submitResult && submitResult.detail) || `Failed to submit the manual In and Out for ${employeeLabel}. Please verify in the UI.`,
      apiResponse: submitResult,
      warnings,
      diagnostics: {
        submitHttpStatus: submitRaw.status,
        retriedWithGraceConfirmed,
        retriedWithSingleRow,
        outTimeExceedsGrace,
        employee: employeeLabel,
        employeeNumber: employeeDisplayNumber,
        selectedDate: dateText,
        tabRecordType,
        tabRowCount: tabRows.length,
        tabRowIndex: tabIndex,
        gridRowCount: recordList.length,
        validSwipeCount: validSwipeRows.length,
        previouslyManuallyFixed,
        totalRowsSubmitted: (submitAttempt.payload.ManualInOutDetailList || []).length,
        breakAdded: breakIn !== null && breakOut !== null,
        existingBreakCount: existingBreaks.length,
        addedIn: !hasExistingIn,
        addedOut: !hasExistingOut,
        searchContext: activeContext.label,
        searchPagesFetched: pagesFetched,
        pageUrl,
        culture,
        rosterGroup,
        rosterCode: usedRosterCode,
        dateSelectMode: requestedMode,
        fromDateText,
        toDateText,
        payloadTopLevelKeys: Object.keys(submitAttempt.payload || {}),
        selectedRowBeforeUpdate: pickRowDebug(targetRow),
        selectedRowAfterUpdate: pickRowDebug(updatedRow),
        traceId: (submitResult && submitResult.traceId) || instanceTrace || null,
        errorCode: (submitResult && submitResult.errorCode) || null
      }
    };
  }

  /* -------------------------------------------------
   * Mirror the post-submit UI refresh sequence (best-effort).
   * ------------------------------------------------- */
  const ts = Date.now();
  await safeGetJson(`${baseUrl}/WorkflowV5/WebAPI/V1/Workflow/GetWorkflowConfigurationsForNotification?_=${ts}`);
  await safeGetJson(`${baseUrl}/WorkflowV5/WebAPI/V1/Workflow/GetModuleWisePendingWorkflowSummaryNotification?_=${ts + 1}`);

  const refreshGrid = await safePostJson(`${baseUrl}/TNAV9/api/ManualInOut/GetGridDataByCriteria/`, gridPayload, jsonHeaders);
  const refreshedList = (refreshGrid.body && refreshGrid.body.ManualInOutDetailList) || [];
  /* Both refresh calls get the SAME array - the captured pair posts an
   * identical body of InOutRecordType 1 rows to each, so this is the tab
   * the page lands back on rather than a per-endpoint filter. */
  const refreshedManualRows = refreshedList
    .filter(function (r) { return r.InOutRecordType === 1; })
    .map(toSubmitRow);
  const refreshedEmpToken = (refreshedList[0] && refreshedList[0].EmpNumber) || empToken;

  await safePostJson(`${baseUrl}/TNAV9/api/ManualInOut/GetManuallyTimeFixedData/`, refreshedManualRows, jsonHeaders);
  await safePostJson(`${baseUrl}/TNAV9/api/ManualInOut/GetManualRejectedData/`, refreshedManualRows, jsonHeaders);
  await safePostJson(`${baseUrl}/TNAV9/api/Common/GetDynamicEmployeeSummary/`, {
    pageId: 1,
    empNumber: refreshedEmpToken,
    fromDateText,
    toDateText
  }, ajaxHeaders);

  // Read back the day so the caller reports what the server actually stored.
  const savedRow = refreshedList.find(function (r) { return isoDayOf(r.DatInDate) === targetIsoDay; });

  return {
    success: true,
    message: `The manual In and Out for ${employeeLabel} on ${dateText} has been submitted successfully.`,
    submitted: previewData,
    saved: savedRow ? {
      employee: employeeLabel,
      date: dateText,
      inTime: savedRow.InTimeText || hhmmToText(savedRow.InTime),
      outTime: savedRow.OutTimeText || hhmmToText(savedRow.OutTime),
      breakCount: savedRow.BreakCount,
      status: savedRow.RecordStatusText || null
    } : null,
    apiResponse: submitResult
  };
});
