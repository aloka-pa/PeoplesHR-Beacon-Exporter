(async function (data, args, reqOptions) {
  const params = JSON.stringify({ "EmpNumber": "0", "FromDate": args.fromDate, "ToDate": args.toDate })

  const requestOptions2 = {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "x-requested-with" : "XMLHttpRequest"
    },
    body: params,
    redirect: "follow"
  };

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/BenefitV9/api/AdminHistoryApi/GetHistoryByEmployee`, requestOptions2);
  const details2 = await response3.json();

  const extractedData = details2.HistoryDataTableVm.DataTableRowVms.map(row => {
    const statusSpan = document.createElement("div");
    statusSpan.innerHTML = row.Status || '';
    const statusText = statusSpan.textContent.trim();

    return {
      Employee: row.Employee || '',
      Reference_No: row.Reference_No || '',
      Benefit_Type: row.Benefit_Type || '',
      Applied_Date: row.Applied_Date || '',
      Applied_Amount_Unit: row["Applied_Amount_/_Unit"] || '',
      Status: statusText,
      ENCRYPT_EMP_NUMBER : row.ENCRYPT_EMP_NUMBER || '',
      BET_CODE : row.BET_CODE || '',
      BET_APP_ID : row.BET_APP_ID || '',
    };
  });

  if(extractedData.length>=5){
    await BeaconBar.executeFunction("downloadcsv")(extractedData);
    return extractedData.slice(0,5);
  }

  return extractedData;
})