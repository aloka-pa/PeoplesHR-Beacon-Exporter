(async function (data, args, reqOptions) {
  if (
    !BeaconBar.user?.metaData?.menus?.some(menu =>
      menu.includes("GrievanceV9/GrievanceHistorySummary")
    )
  ) {
    return { error: true, message: "You do not have access to view your appeal history. Please contact HR Admin." };
  }

  function formatGrievanceDate(d) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const dd = String(d.getDate()).padStart(2, "0");
    return `${dd}/${months[d.getMonth()]}/${d.getFullYear()}`;
  }

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const frdate = args.fromDate || formatGrievanceDate(startOfYear);
  const todate = args.toDate || formatGrievanceDate(today);

  // Ground resolution reuses the same GetGrievanceSources tree/endpoint already confirmed
  // working for getMyGrievanceHistory and submitMyGrievanceApplication - it's shared across
  // the whole Grievance module, not specific to one screen.
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

  // NOTE: the captured getAppealList request only ever carried {frdate, todate} - grnd was
  // never confirmed against a live "Filter Records" click on the Appeal History tab. It's
  // included here on the strength of getFilterList (the sibling My Grievances endpoint)
  // accepting the exact same field; if the server ignores unrecognized fields, the ground
  // filter will simply have no effect rather than break the whole call.
  const res = await fetch(`${location.origin}/${reqOptions.sl}/GrievanceV9/GrievanceHistorySummary/getAppealList`, {
    method: "POST",
    headers: {
      "accept": "application/json, text/plain, */*",
      "content-type": "application/json;charset=UTF-8"
    },
    body: JSON.stringify({ frdate, todate, grnd }),
    redirect: "follow"
  });
  let records = await res.json();

  if (args.status) {
    const wanted = args.status.toLowerCase();
    records = (records || []).filter(r => {
      if (wanted === "pending") return r.ISCOMPLETED === 0;
      if (wanted === "resolved") return r.ISCOMPLETED === 1;
      return true;
    });
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
    originalGrievanceRecHeadCode: r.RECHEAD_REFCODE,
    attemptsUsed: r.TRIED_ATTEMPTS,
    attemptsAllowed: r.TEMP_ATTEMPTS,
    ground: r.ROOT_SOURCE,
    subGround: r.SUB_SOURCE,
    source: r.GRIEVANCE_SOURCE
  }));
})
