(async function (data, args, reqOptions) {
  if (!BeaconBar.user.metaData.menus.includes("Benefitv9/Application/Application/?mode=2&mvc=1")) {
      return "It seems you don't have access. Please check with the HR Admin";
    }
  const details = await BeaconBar.executeFunction("benefitApplication")(args.id);
  if (details.empnumber) {
    const jsonHeaders = new Headers();
    jsonHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
    jsonHeaders.append("Content-Type", "application/json; charset=UTF-8");
    jsonHeaders.append("X-Requested-With", "XMLHttpRequest");

    const raw = JSON.stringify({
      empNumber: details.empnumber,
      key: details.keyvalue,
      type: "0",
      mode: "2"
    });

    const requestOptions = {
      method: "POST",
      headers: jsonHeaders,
      body: raw,
      redirect: "follow"
    };

    const response = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/ApplicationApi/GetApplicationByEmployee`, requestOptions);
    const details1 = await response.json();

    window.Emp = details1?.Employee?.EmpNumber;

    return details1.benefitTypes;
  } else {
    return details;
  }
})
