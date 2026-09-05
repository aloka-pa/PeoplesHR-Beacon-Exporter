(async function (data, args, reqOptions) {
  debugger;

  // Permission check
  if (!BeaconBar.user.metaData.menus.includes("TNAV9/AttendanceApproval/AttendanceApplication/1?mvc=1")) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  // Validate required parameters
  if (!args.fromDate || !args.toDate) {
    return "Error: fromDate and toDate are required parameters.";
  }

  // Setup headers for MVC API calls
  const apiHeaders = new Headers();
  apiHeaders.append("Accept", "application/json, text/plain, */*");
  apiHeaders.append("Content-Type", "application/json");
  apiHeaders.append("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8");
  apiHeaders.append("x-requested-with", "XMLHttpRequest");

  // Get initial page for authentication (MVC requires digest)
  const pageHeaders = new Headers();
  pageHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
  pageHeaders.append("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8");
  pageHeaders.append("x-requested-with", "XMLHttpRequest");

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")('TNAV9/AttendanceApproval/AttendanceApplication/1?mvc=1');
  const digest = await BeaconBar.executeFunction('getDigest')(updateurl.updateParams);

  const apiBaseUrl = `${location.origin}/${reqOptions.sl}/TNAV9/api/AttendanceApproval`;

  // Load initial page for authentication context
  const pageResponse = await fetch(`${location.origin}/${reqOptions.sl}/${updateurl.updateUrl}&digest=${digest.digest}`, {
    method: "GET",
    headers: pageHeaders,
    redirect: "follow",
    credentials: "include"
  });

  const textPost = await pageResponse.text();
  const parser = new DOMParser();
  const docPost = parser.parseFromString(textPost, "text/html");

  // Get the public key from the page for encryption
  const publicKey = docPost.querySelector("#PublicKey")?.value || "";
  //   const publicKey = `-----BEGIN PUBLIC KEY-----
  // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0hmleU4fnd/CpB2IiheW
  // ncqJJixFvDa3iNmD7w0N+dM9J67NFwgDhStfSdLRdaQNjWC+OPOXIk3WYKx+wo5N
  // dU6KQC4nLkS2ifB8q0hXXjLhq0XFbQipxq5EDRZnU8HN9twXUy5kyMtgFWG2ImCi
  // Ms6rZvDi7eKdTAGI5SvaY6Htba0Dehhfc1WL6c9VUeyK5jYqcUIf5CgUP7xtNJpX
  // 6E6Xi9ByXsiha9TmoCJ04//c6DfgiMc8TBfHE4GqGr+7/ABPhO8ootYmHNoYVDxG
  // 9yWert7qYE0tCIZVau2YmIFFdLUaDmsqB9js6PlyrOcYvRx1FEqiAao/JGgCvsKX
  // gQIDAQAB
  // -----END PUBLIC KEY-----`;

  // Prepare DataFilter payload
  const dataFilter = {
    FromDateText: args.fromDate,
    ToDateText: args.toDate,
    IsGroupByEmployee: args.isGroupByEmployee !== undefined ? args.isGroupByEmployee : false,
    FilterMode: args.filterMode !== undefined ? args.filterMode : "1",  // Changed from "3" to "1" to match UI
    RosterCode: args.rosterCode !== undefined ? args.rosterCode : "",
    callBackId: 3,
    isShowShiftHoursInShiftAdjEnabled: false,
    IsClientUoc: false
  };

  // Encrypt employee number if provided - MOVED BEFORE advancedDataFilter
  if (args.employeeNumber && publicKey) {
    const encryptedEmpNumber = await BeaconBar.executeFunction("employeeEncryptId")(publicKey, args.employeeNumber);
    dataFilter.EmpNumber = encryptedEmpNumber;
  } else if (args.employeeNumber && !publicKey) {
    // If no public key available, but we have empNumber
    return "Error: Unable to encrypt employee number. Public key not found.";
  }

  // Prepare AdvancedDataFilter payload
  const advancedDataFilter = {
    AllInOut: args.allInOut !== undefined ? args.allInOut : true,
    DataWithOT: args.dataWithOT || false,
    DataWithLate: args.dataWithLate || false,
    DataWithNoPay: args.dataWithNoPay || false
  };

  // Call GetGridDataByCriteria API
  const gridDataPayload = {
    DataFilter: dataFilter,
    AdvancedDataFilter: advancedDataFilter
  };

  const gridDataResponse = await fetch(`${apiBaseUrl}/GetGridDataByCriteria/`, {
    method: "POST",
    headers: apiHeaders,
    body: JSON.stringify(gridDataPayload),
    credentials: "include"
  });

  if (!gridDataResponse.ok) {
    return `Error: Failed to fetch attendance data. Status: ${gridDataResponse.status}`;
  }

  const gridData = await gridDataResponse.json();

  // Extract unique employees and their details
  const employeeFields = ['EmpNumber', 'EmployeeNumber', 'empNumber', 'EmpNo', 'EmployeeNo'];
  const employeeNameFields = ['EmpName', 'EmployeeName', 'empName', 'Name'];
  const employeeMap = new Map();

  if (Array.isArray(gridData)) {
    gridData.forEach(record => {
      let empId = null;
      let empName = null;

      // Find employee ID
      for (const field of employeeFields) {
        if (record[field]) {
          empId = record[field];
          break;
        }
      }

      // Find employee name
      for (const field of employeeNameFields) {
        if (record[field]) {
          empName = record[field];
          break;
        }
      }

      if (empId) {
        if (!employeeMap.has(empId)) {
          employeeMap.set(empId, {
            employeeId: empId,
            employeeName: empName || 'Unknown',
            records: []
          });
        }
        employeeMap.get(empId).records.push(record);
      }
    });
  }

  // Calculate summary statistics per employee
  const employeeSummaries = Array.from(employeeMap.values()).map(emp => {
    const pending = emp.records.filter(r =>
      r.RecordStatus === 0 ||
      r.RecordStatusText === "V/R" ||
      r.RecordStatusText === "P/A"
    ).length;

    const approved = emp.records.filter(r =>
      r.RecordStatus === 1 ||
      r.RecordStatusText === "Approved"
    ).length;

    const rejected = emp.records.filter(r =>
      r.RecordStatus === 2 ||
      r.RecordStatusText === "Rejected"
    ).length;

    return {
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      totalRecords: emp.records.length,
      pendingRecords: pending,
      approvedRecords: approved,
      rejectedRecords: rejected,
      // Store records but mark them as "details" so AI knows not to show them initially
      _detailedRecords: emp.records
    };
  });

  // Overall summary
  const overallSummary = {
    totalRecords: gridData.length,
    uniqueEmployees: employeeMap.size,
    pendingRecords: gridData.filter(r =>
      r.RecordStatus === 0 ||
      r.RecordStatusText === "V/R" ||
      r.RecordStatusText === "P/A"
    ).length,
    approvedRecords: gridData.filter(r =>
      r.RecordStatus === 1 ||
      r.RecordStatusText === "Approved"
    ).length,
    rejectedRecords: gridData.filter(r =>
      r.RecordStatus === 2 ||
      r.RecordStatusText === "Rejected"
    ).length
  };

  // Prepare result - SUMMARY FIRST
  const result = {
    period: {
      fromDate: args.fromDate,
      toDate: args.toDate
    },
    filters: {
      rosterCode: args.rosterCode !== undefined ? args.rosterCode : "All",
      filterMode: args.filterMode !== undefined ? args.filterMode : "3",
      isGroupByEmployee: args.isGroupByEmployee !== undefined ? args.isGroupByEmployee : false,
      empNumber: args.employeeNumber || "All Employees"
    },

    // MAIN SUMMARY - Show this first
    summary: overallSummary,

    // PER-EMPLOYEE SUMMARIES - Show this second
    employeeSummaries: employeeSummaries,

    // INSTRUCTION FOR AI
    _instructions: "Show the 'summary' and 'employeeSummaries' first. Only show detailed records from '_detailedRecords' if user explicitly asks for them. Show 10 records at a time.",

    // RAW DATA - Hidden from initial display
    _rawData: gridData
  };

  // Optionally fetch rejected records
  if (args.includeRejected) {
    try {
      const rejectedResponse = await fetch(`${apiBaseUrl}/GetAttendanceRejectedData/`, {
        method: "GET",
        headers: apiHeaders,
        credentials: "include"
      });

      if (rejectedResponse.ok) {
        const rejectedData = await rejectedResponse.json();
        result._rejectedRecords = rejectedData || [];
      }
    } catch (error) {
      result._rejectedRecordsError = "Failed to fetch rejected records";
    }
  }

  return result;
});