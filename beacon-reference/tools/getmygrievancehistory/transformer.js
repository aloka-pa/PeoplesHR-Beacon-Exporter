(async function (data, args, reqOptions) {
   if (
    !BeaconBar.user?.metaData?.menus?.some(menu =>
      menu.includes("GrievanceV9/GrievanceHistorySummary")
    )
  ) {
    return { error: true, message: "You do not have access to view grievance history. Please contact HR Admin." };
  }

  function formatGrievanceDate(d) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const dd = String(d.getDate()).padStart(2, "0");
    return `${dd}/${months[d.getMonth()]}/${d.getFullYear()}`;
  }

  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const frdate = args.fromDate || formatGrievanceDate(threeMonthsAgo);
  const todate = args.toDate || formatGrievanceDate(today);

  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("content-type", "application/json;charset=UTF-8");

  let grnd = "";
  if (args.ground) {
    const sourcesRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/RecordGrievance/GetGrievanceSources`, {
      method: "GET",
      headers: { "accept": "application/json, text/plain, */*" },
      redirect: "follow"
    });
    const sources = await sourcesRes.json();

    const flatGrounds = [];
    (sources || []).forEach(g => {
      flatGrounds.push({ code: g.srcListCode, name: g.srcListName });
      (g.subGrievanceSources || []).forEach(sub => flatGrounds.push({ code: sub.srcListCode, name: sub.srcListName }));
    });

    const wanted = args.ground.toLowerCase();
    const match = flatGrounds.find(g => g.name.toLowerCase() === wanted)
      || flatGrounds.find(g => g.name.toLowerCase().includes(wanted));

    if (match) grnd = match.code;
  }

  const listRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/GrievanceHistorySummary/getFilterList`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ app: "1", frdate, todate, grnd, ctrl: "" }),
    redirect: "follow"
  });
  let records = await listRes.json();

  if (args.status) {
    const wanted = args.status.toLowerCase();
    records = (records || []).filter(r => {
      if (wanted === "pending") return r.ISCOMPLETED === 0;
      if (wanted === "resolved") return r.ISCOMPLETED === 1;
      if (wanted === "appealed") return r.APPEALED === 1;
      return true;
    });
  }

  // appealableOnly uses the authoritative per-record cannotAppeal flag (only exposed by
  // LoadRecordDetails, not by this list endpoint) - not every completed/disagreed record
  // is actually appeal-able (attempts remaining, appeal window, etc. are enforced
  // server-side), so this is checked directly rather than guessed from status/attempts
  // text alone. Pre-filtered to ISCOMPLETED===1 first (you cannot appeal a decision that
  // hasn't been made yet) to avoid an unnecessary LoadRecordDetails call per pending record.
  if (args.appealableOnly) {
    const candidates = (records || []).filter(r => r.ISCOMPLETED === 1);
    const checks = await Promise.all(candidates.map(async r => {
      const params = `recHeadCode=${r.RECHEAD_CODE}&isSummary=true`;
      const digestKey = await BeaconBar.executeFunction("getDigest")(params);
      const detailsRes = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/GrievanceHandle/LoadRecordDetails?${params}&digest=${digestKey.digest}`, {
        method: "GET",
        headers: { "accept": "application/json, text/plain, */*" },
        redirect: "follow"
      });
      const details = await detailsRes.json();
      return { recHeadCode: r.RECHEAD_CODE, canAppeal: !details.cannotAppeal };
    }));
    const appealableCodes = new Set(checks.filter(c => c.canAppeal).map(c => c.recHeadCode));
    records = (records || []).filter(r => appealableCodes.has(r.RECHEAD_CODE));
  }

  return (records || []).map(r => ({
    recHeadCode: r.RECHEAD_CODE,
    tempHeadCode: r.TEMPHEAD_CODE,
    empNumber: r.EMP_NUMBER,
    name: r.RECHEAD_NAME,
    comment: r.RECHEAD_COMMENT,
    submittedDate: r.SUBMITDATE,
    status: r.status,
    isCompleted: !!r.ISCOMPLETED,
    appealed: !!r.APPEALED,
    attemptsUsed: r.TRIED_ATTEMPTS,
    attemptsAllowed: r.TEMP_ATTEMPTS,
    ground: r.ROOT_SOURCE,
    subGround: r.SUB_SOURCE,
    source: r.GRIEVANCE_SOURCE
  }));
})
