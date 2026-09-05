(async function (data, args, reqOptions) {
  
  if (
  !BeaconBar.user.metaData.menus.some(menu =>
    menu.includes("AbsenceV9/LeaveApplication/LeaveApplication?mvc=1&isAllEmployee=1")
  ) &&
  !BeaconBar.user.metaData.menus.some(menu =>
    menu.includes("AbsenceV9/LeaveHistory/LeaveHistory?mvc=1")
  )
  ) {
    return "It seems you don't have access. Please check with the HR Admin";
  }


  const digest1 = await BeaconBar.executeFunction('getDigest')(`mvc=1&bs=4&searchMode=4&searchState=0&ApplicationMode=1&empNumber=${window.logKey}`);
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const response = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/LeaveHistory/LeaveHistory?mvc=1&bs=4&searchMode=4&searchState=0&ApplicationMode=1&empNumber=${window.logKey}&digest=${digest1.digest}`, requestOptions);
  const text = await response.text();

  const parse = new DOMParser();
  const dom = parse.parseFromString(text, "text/html");

  const csrfElement = dom.querySelector("#hdbAbsenceV9AFToken")?.value || "";
  const match = text.match(/LeaveStatusVM\.EmpNumber\('([^']+)'\)/);
  const empNumber = match[1];

  myHeaders.append("__cfafvalue", csrfElement);
  myHeaders.append("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
  myHeaders.append("x-requested-with", "XMLHttpRequest");

  const raw = `EmpNumber=${empNumber}&LeaveYear=${args.year}&IsReject=0&_search=false&nd=${Date.now()}&rows=1000&page=1&sidx=&sord=asc`;

  const requestOptions1 = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveHistory/GetLeaveStatusDetails`, requestOptions1);
  const text1 = await response1.json();

  const results = [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  text1.forEach(item => {
    const detail = item.LDetail || {};
    results.push({
      LeaveAppIDEncrypted: detail.LeaveAppIDEncrypted || '-',
      FromDate: formatDate(detail.FromDate),
      ToDate: formatDate(detail.ToDate),
      LeaveAppliedDate: formatDate(detail.EditDate),
      LeaveType: item.LeaveTypeName || '-',
      Days: detail.LeaveAmountText || '-',
      LeaveHours: item.LeaveMinutes ? (item.LeaveMinutes / 60).toFixed(2) : '-',
      Status: item.Status?.replace(/<[^>]*>?/gm, '') || '-', // strip HTML
      ReasonForLeave: detail.Comment || '-',
      CoveringEmployee: item.LeaveActingEmp || '-',
      LeaveAppliedId: detail.LeaveAppID || " "
    });
  });
  // const targetDate = args.leaveCancelDate;
  const firstMatch = results.find(item => item.LeaveAppliedId === args.leaveAppliedId);
  const encypt = firstMatch?.LeaveAppIDEncrypted || "";

  if (encypt) {
    myHeaders.set("content-type", "application/json");

    const raw2 = JSON.stringify({
      "EmpNumber": empNumber
    });

    const requestOptions2 = {
      method: "POST",
      headers: myHeaders,
      body: raw2,
      redirect: "follow"
    };
    const response2 = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/ShortLeaveApplication/GetEmployeeData/`, requestOptions2);
    const text2 = await response2.json();

    const cancilEmpnum = text2.EmpNumber;

    const raw1 = JSON.stringify({
      "EncryptedAppID": encypt,
      "Comment": args.comment,
      "EmpNumber": cancilEmpnum,
      "LeaveYear": args.year
    });

    const requestOptions3 = {
      method: "POST",
      headers: myHeaders,
      body: raw1,
      redirect: "follow"
    };

    const response3 = await fetch(`${location.origin}/${reqOptions.sl}/AbsenceV9/api/LeaveHistory/LeaveCancellation/`, requestOptions3);
    const text3 = await response3.json();

    return text3;
  } else {
    return "not in leave application date"
  }

})
