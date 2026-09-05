(async function (id) {
  const url = await BeaconBar.executeFunction("updateUrlParams")("Benefitv9/Application/Application/?mode=2&mvc=1");

  const digestkey1 = await BeaconBar.executeFunction('getDigest')(url.updateParams);
  const sl = await BeaconBar.getSharedData("sl");

  const jsonHeaders = new Headers();
  jsonHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  jsonHeaders.append("Content-Type", "application/json; charset=UTF-8");
  jsonHeaders.append("X-Requested-With", "XMLHttpRequest");

  const getHeaders = new Headers();
  getHeaders.append("Accept", "*/*");
  getHeaders.append("Accept-Language", "en-US,en;q=0.9");

  const requestOptionsGet = {
    method: "GET",
    headers: getHeaders,
    redirect: "follow"
  };

  const response1 = await fetch(`${location.origin}/${sl}/${url.updateUrl}&digest=${digestkey1.digest}`, requestOptionsGet);
  const data1 = await response1.text();
  const match = data1.match(/window\.BenefitApplicationObj\s*=\s*(['"])(.*?)\1;/s);

  const jsonString = match ? match[2] : null;
  const parsed = JSON.parse(jsonString);

  const empNumber = parsed.LogEmpNumber;
  const callBack = decodeURIComponent(parsed.CallBackMethod);
  const searchToken = parsed.searchToken;

  const digest = await BeaconBar.executeFunction('getDigest')(
    `empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=all&searchQueryState=activeonly&breadCrumbEnable=0&isDivLoading=1&isShowDisplayName=0&divId=searchBenDiv2&searchToken=${searchToken}`
  );

  const searchUrl = `${location.origin}/${sl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=all&searchQueryState=activeonly&breadCrumbEnable=0&isDivLoading=1&isShowDisplayName=0&divId=searchBenDiv2&searchToken=${searchToken}&digest=${digest.digest}&_=${Date.now()}`;

  const response2 = await fetch(searchUrl, requestOptionsGet);
  const data2 = await response2.text();

  const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
  const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

  const empNumber2 = empNumberMatch2 ? empNumberMatch2[1] : "";
  const keyValue = keyValueMatch ? keyValueMatch[1] : "";

  window.empLog = { empNumber2, keyValue };

  const raw = JSON.stringify({
    empNumber: empNumber2,
    criteriaValues: [
      {
        Id: "202",
        Value: id,
        FromDate: "",
        ToDate: "",
        IsAndSelected: false,
        IsOrSelected: false
      }
    ],
    key: keyValue,
    modeId: "2",
    supEmpNumber: null,
    tblPageNo: 1,
    tblSearchText: "",
    sortColumn: "2",
    sortOrder: "asc"
  });

  const requestOptionsPost = {
    method: "POST",
    headers: jsonHeaders,
    body: raw,
    redirect: "follow"
  };

  const response3 = await fetch(`${location.origin}/${sl}/CommonComponents/Search/GetSearchList/`, requestOptionsPost);
  const details = await response3.json();

  const empName = details?.Object?.data[0]?.Col2 || "";
  const empId = details?.Object?.data[0]?.Col1 || "";
  const empDateofJoin = details?.Object?.data[0]?.Col3 || "";
  if (empName) {
    const response4 = await fetch(
      `${location.origin}/${sl}/CommonComponents/Search/GetEmpNumber/?loggedEmpNumber=${empNumber2}&empNumber=${empId}&empDisplayName=${empName}&empDateJoined=${empDateofJoin}&key=${keyValue}&_=${Date.now()}`,
      requestOptionsGet
    );

    const details1 = await response4.json();
    window.benefitdetails = parsed;

    // const benefitTypes = parsed.BmBenefitTypes.map(x => ({
    //   benefitTypeCode: x.BetCode,
    //   benefitTypeName: x.BetName
    // }));

    // const applicationId = decodeURIComponent(parsed.AppId);
    // const benefitYear = parsed.BetAppYear;
    // const benefitApplicationDetails = {
    //   benefitTypes,
    //   applicationId,
    //   benefitYear
    // }

    return {
      empnumber: details1.Message,
      keyvalue: parsed.KeyValue
    }
  } else {
    return `Employee is Not availabel in this employee ${id}`
  }
});
