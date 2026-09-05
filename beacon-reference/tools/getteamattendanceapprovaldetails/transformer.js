(async function (data, args, reqOptions) {

  // Permission check
  const hasAccess = BeaconBar.user.metaData.menus.includes("TNAV9/AttendanceApproval/AttendanceApplication/1?mvc=1");
  
  if (!hasAccess) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  // Validate required parameters
  if (!args.fromDate || !args.toDate) {
    return "Error: fromDate and toDate are required parameters.";
  }

  try {
    // Step 3: Initialize window.empLog if not already done
    if (!window.empLog || !window.empLog.empNumber2 || !window.empLog.keyValue) {
      
      const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNAV9/ManualInOut/ManualInOut/0');
      
      let url;
      if(updateurl.updateUrl){
          url = updateurl.updateUrl;
      } else {
          url = "TNAV9/ManualInOut/ManualInOut/0?mvc=1";
      }

      const digestkey1 = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);
      
      const sl = reqOptions.sl;
      
      const myHeaders = new Headers();
      myHeaders.append("accept", "*/*");
      myHeaders.append("accept-language", "en-US,en;q=0.9");
      myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
      myHeaders.append("x-requested-with", "XMLHttpRequest");

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        credentials: "include"
      };

      const pageUrl = `${location.origin}/${sl}/${url}&digest=${digestkey1.digest}&_=${Date.now()}`;
      
      const response1 = await fetch(pageUrl, requestOptions);
      
      if (!response1.ok) {
        return `Error: Failed to initialize. Status: ${response1.status}`;
      }
      
      const data1 = await response1.text();

      // Extract patterns from the page
      const empNumberPattern = /empNumber=([^"&]+)/;
      const callBackPattern = /(?:callBack=|SearchCallBack":")(.*?)(?:&|")/;
      const elgModIdPattern = /elgmodid=([^"&]+)/;
      const elgGrpIdPattern = /elggrpid=([^"&]+)/;
      const elgParamPattern = /ElgParam=([^"&]+)/;
      const searchTokenPattern = /searchToken=([^"&']+)/;

      const empNumberMatch = data1.match(empNumberPattern);
      const callBackMatch = data1.match(callBackPattern);
      const elgModIdMatch = data1.match(elgModIdPattern);
      const elgGrpIdMatch = data1.match(elgGrpIdPattern);
      const elgParamMatch = data1.match(elgParamPattern);
      const searchTokenMatch = data1.match(searchTokenPattern);

      const empNumber = empNumberMatch ? empNumberMatch[1] : "";
      const callBack = callBackMatch ? decodeURIComponent(callBackMatch[1]) : "";
      const elgModId = elgModIdMatch ? elgModIdMatch[1] : "";
      const elgGrpId = elgGrpIdMatch ? elgGrpIdMatch[1] : "";
      const elgParam = elgParamMatch ? elgParamMatch[1] : "";
      const searchToken = searchTokenMatch ? searchTokenMatch[1] : "";


      const searchUrl = `${location.origin}/${sl}/CommonComponents/Search/Search?empNumber=${empNumber}&callBack=${callBack}&searchMode=2&searchQueryMode=All&searchQueryState=ActiveOnly&isMultiple=1&breadCrumbEnable=0&isDivLoading=0&displayName=&elgmodid=${elgModId}&elggrpid=${elgGrpId}&ElgParam=${elgParam}&searchToken=${searchToken}&_=${Date.now()}`;
      
      const response2 = await fetch(searchUrl, requestOptions);
      
      const data2 = await response2.text();

      const empNumberMatch2 = data2.match(/"EmpNumber":"([^"]+)"/);
      const keyValueMatch = data2.match(/"KeyValue":"([^"]+)"/);

      const empNumber2 = empNumberMatch2 ? empNumberMatch2[1] : "";
      const keyValue = keyValueMatch ? keyValueMatch[1] : "";


      if (!empNumber2 || !keyValue) {
        return "Error: Failed to initialize session credentials. Please try again or contact support.";
      }

      window.empLog = {
        empNumber2,
        keyValue
      };
      
    } else {
    }

    // Step 4: Setup headers
    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("cache-control", "no-cache");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
      credentials: "include"
    };

    // Step 5: Get employee credentials
    
    let empNumber2;

    if (args.empNumber) {
      
      const response1 = await fetch(
        `${location.origin}/${reqOptions.sl}/CommonComponents/Search/GetEmpNumberFromTypeahead/?loggedEmpNumber=${window.empLog.empNumber2}&empNumber=${args.empNumber}&key=${window.empLog.keyValue}&_=${Date.now()}`,
        requestOptions
      );


      if (!response1.ok) {
        const errorText = await response1.text();
        return `Error: Failed to get employee credentials. Status: ${response1.status}. Please ensure you have proper access.`;
      }

      const details = await response1.json();

      // Check if the response indicates an error or invalid employee
      if (!details.Status || (details.Message && details.Message.includes("not valid"))) {
        return `Error: Employee number "${args.empNumber}" is not valid. Please check the employee number and try again.`;
      }

      empNumber2 = details?.Message || args.empNumber;
    } else {
      // Use logged-in user's credentials
      empNumber2 = window.empLog.empNumber2;
    }

    // Step 6: Prepare payload for GetGridDataByCriteria (matching the exact network structure)
    
    const rawPayload = {
      DataFilter: {
        FromDateText: args.fromDate,
        ToDateText: args.toDate,
        IsGroupByEmployee: args.isGroupByEmployee !== undefined ? args.isGroupByEmployee : false,
        FilterMode: args.filterMode || "1",
        EmpNumber: empNumber2,
        RosterCode: args.rosterCode || "",
        callBackId: args.callBackId || 3,
        isShowShiftHoursInShiftAdjEnabled: false,
        IsClientUoc: false
      },
      AdvancedDataFilter: {
        AllInOut: args.allInOut !== undefined ? args.allInOut : true,
        DataWithOT: args.dataWithOT !== undefined ? args.dataWithOT : false,
        DataWithLate: args.dataWithLate !== undefined ? args.dataWithLate : false,
        DataWithNoPay: args.dataWithNoPay !== undefined ? args.dataWithNoPay : false
      }
    };


    // Step 7: Call GetGridDataByCriteria API with complete headers
    
    const requestOptions1 = {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "origin": location.origin,
        "referer": `${location.origin}/${reqOptions.sl}/home/index`,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      },
      body: JSON.stringify(rawPayload),
      redirect: "follow",
      credentials: "include"
    };

    const apiUrl = `${location.origin}/${reqOptions.sl}/tnav9/api/AttendanceApproval/GetGridDataByCriteria/`;

    const response2 = await fetch(apiUrl, requestOptions1);

    if (!response2.ok) {
      const errorText = await response2.text();
      return `Error: Failed to fetch attendance data. Status: ${response2.status}. Response: ${errorText}`;
    }

    const details1 = await response2.json();

    // Step 8: Process attendance records
    
    const attendanceRecords = details1.AttendanceSummaryDetailList?.map((entry) => {
      return {
        Date: entry.DatInDateString?.split(" ")[0] || "-",
        Shift: entry.ShiftAbbreviation || "OFF",
        InDate: entry.InDateText || "-",
        InTime: entry.InTimeText || "-",
        OutDate: entry.OutDateText || "-",
        OutTime: entry.OutTimeText || "-",
        Breaks: entry.BreakCount || 0,
        Overtime: formatTime(entry.TotalOvertime),
        EarlyMin: formatTime(entry.StartLate),
        LateMin: formatTime(entry.EndLate),
        WorkHours: formatTime(entry.WorkHours),
        Nopay: entry.NopayDays ? entry.NopayDays.toFixed(2) : "0.00",
        Leave: entry.LeaveDaysLabelString || "",
        RecordStatus: entry.RecordStatus,
        RecordStatusText: entry.RecordStatusText || "Unknown",
        _original: entry
      };
    }) || [];


    // Step 9: Calculate summaries
    
    const pendingRecords = attendanceRecords.filter(r => 
      r.RecordStatus === 0 || 
      r.RecordStatusText === "V/R" || 
      r.RecordStatusText === "P/A" ||
      r.RecordStatusText === "Pending"
    );
    
    const approvedRecords = attendanceRecords.filter(r => 
      r.RecordStatus === 1 || 
      r.RecordStatusText === "Approved"
    );
    
    const rejectedRecords = attendanceRecords.filter(r => 
      r.RecordStatus === 2 || 
      r.RecordStatusText === "Rejected"
    );

    const summary = {
      totalRecords: attendanceRecords.length,
      pendingRecords: pendingRecords.length,
      approvedRecords: approvedRecords.length,
      rejectedRecords: rejectedRecords.length
    };


    // Step 10: Prepare result
    
    const result = {
      period: {
        fromDate: args.fromDate,
        toDate: args.toDate
      },
      employee: {
        empNumber: empNumber2,
        empNumberInput: args.empNumber || "Current User"
      },
      summary: summary,
      records: attendanceRecords,
      _instructions: "Show summary first. Then show records in a table. Highlight pending records that need approval.",
      _rawData: details1
    };

    return result;

  } catch (error) {
    return `Critical Error: ${error.message || error}`;
  }

  // Helper function
  function formatTime(value) {
    if (!value || value === 0) return "00:00";
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
});