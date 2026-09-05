(async function (data, args, reqOptions) {
  try {
    // Allow user to specify year (empty string "" means current/active year)
    const year = args.year !== undefined ? args.year : "";

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    const url = `${window.origin}/${reqOptions.sl}/TNDV9/TrainingBudget/GetBudgetUtilizationDetails`;

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ year: year })
    });

    if (!response.ok) {
      return {
        status: "ERROR",
        message: `API request failed with status ${response.status}`
      };
    }

    const responseData = await response.json();

    // Check if request was successful
    if (!responseData.Status || !responseData.Status.IsSuccessfull) {
      return {
        status: "ERROR",
        message: responseData.Status?.Message || "Failed to retrieve budget utilization details"
      };
    }

    // Extract key information
    const utilizationData = responseData.utilbudget || [];
    const availableYears = responseData.yearlst || [];
    const activeYear = responseData.year;
    const period = responseData.period;
    const totalBudget = responseData.totalbudget;
    const baseCurrency = responseData.basecurr;

    // Process utilization details
    const utilization = utilizationData.map(item => {
      const schedules = item.schlst || [];
      
      // Calculate total utilization from schedules
      const totalScheduleUtilization = schedules.reduce((sum, sch) => sum + (sch.hieutilize || 0), 0);
      const totalEmployees = schedules.reduce((sum, sch) => sum + (sch.empcount || 0), 0);

      return {
        year: item.year,
        hierarchyLevel: item.deflevel,
        levelName: item.defname,
        code: item.hiecode,
        name: item.hiename,
        parentCode: item.rel_hiecode,
        parentName: item.rel_hiename,
        isActive: item.inactive === 1,
        allocatedAmount: item.alloamount,
        utilizedAmount: item.utilamount,
        availableAmount: item.avaiamount,
        utilizationPercentage: item.alloamount > 0 
          ? ((item.utilamount / item.alloamount) * 100).toFixed(2)
          : 0,
        scheduleCount: schedules.length,
        totalEmployeesEnrolled: totalEmployees,
        schedules: schedules.map(sch => ({
          scheduleId: sch.schid,
          courseCode: sch.coscode,
          courseName: sch.cosname,
          startDate: sch.startdate,
          endDate: sch.enddate,
          capacity: sch.capacity,
          enrolledCount: sch.empcount,
          budgetHierarchyCode: sch.budhiecode,
          utilizationAmount: sch.hieutilize,
          costs: sch.costlst || []
        }))
      };
    });

    // Calculate summary statistics
    const totalAllocated = utilization.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0);
    const totalUtilized = utilization.reduce((sum, item) => sum + (item.utilizedAmount || 0), 0);
    const totalAvailable = utilization.reduce((sum, item) => sum + (item.availableAmount || 0), 0);
    const totalSchedules = utilization.reduce((sum, item) => sum + item.scheduleCount, 0);
    const totalEmployees = utilization.reduce((sum, item) => sum + item.totalEmployeesEnrolled, 0);

    return {
      status: "SUCCESS",
      message: `Budget utilization details retrieved for ${activeYear}`,
      summary: {
        year: activeYear,
        period: period,
        baseCurrency: baseCurrency,
        totalBudget: totalBudget,
        totalAllocated: totalAllocated,
        totalUtilized: totalUtilized,
        totalAvailable: totalAvailable,
        utilizationRate: totalAllocated > 0 
          ? ((totalUtilized / totalAllocated) * 100).toFixed(2) + '%'
          : '0%',
        totalSchedules: totalSchedules,
        totalEmployeesEnrolled: totalEmployees,
        itemsCount: utilization.length
      },
      utilization: utilization,
      availableYears: availableYears.map(y => ({ code: y.yearcode, name: y.yearname })),
      config: responseData.config
    };

  } catch (error) {
    return {
      status: "ERROR",
      message: `Failed to retrieve budget utilization details: ${error.message}`,
      error: error.toString()
    };
  }
})