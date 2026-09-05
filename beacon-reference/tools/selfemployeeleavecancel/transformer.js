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

  const myHeaders = new Headers();
  myHeaders.append("__cfafvalue", window.csrf);
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/json");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const firstMatch = window.leaveHistort12.find(item => String(item.LeaveAppliedId) === String(args.leaveAppliedId));
  const encypt = firstMatch?.LeaveAppIDEncrypted || "";

  if (encypt) {
    myHeaders.set("content-type", "application/json");

    const raw2 = JSON.stringify({
      "EmpNumber": window.empnumm
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
