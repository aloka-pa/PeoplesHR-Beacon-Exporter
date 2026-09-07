(async function (data, args, reqOptions) {
  debugger;
  try {
    // Optional: Allow user to specify loadtype (defaults to "0" for active year)
    const loadtype = args.loadtype || "0";

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("x-requested-with", "XMLHttpRequest");

    const url = `${window.origin}/${reqOptions.sl}/TNDV9/TrainingBudget/GetActiveYearBudgetDetails`;

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ loadtype: loadtype })
    });

    if (!response.ok) {
      return {
        status: "ERROR",
        message: `API request failed with status ${response.status}`
      };
    }

    const data = await response.json();

    // Check if request was successful
    if (!data.Status || !data.Status.IsSuccessfull) {
      return {
        status: "ERROR",
        message: data.Status?.Message || "Failed to retrieve budget details"
      };
    }

    // Extract key information
    const year = data.year;
    const period = data.period;
    const baseCurrency = data.basecurr;
    const totalBudget = data.totalbudget;
    const budgetItems = data.budget || [];

    // Organize budget by hierarchy levels
    const budgetByLevel = {};
    budgetItems.forEach(item => {
      const level = item.deflevel;
      if (!budgetByLevel[level]) {
        budgetByLevel[level] = [];
      }
      budgetByLevel[level].push({
        code: item.hiecode,
        name: item.hiename,
        levelName: item.defname,
        parentCode: item.rel_hiecode,
        parentName: item.rel_hiename,
        amount: item.amount,
        currency: item.currname,
        exchangeRate: item.exrate,
        baseAmount: item.baseamount,
        supplementaryAmount: item.supamount,
        supplementaryCurrency: item.supcurrname,
        totalAmount: item.totalamount,
        approved: item.appapproved === "1",
        workflowId: item.wfmainid,
        hasSupplementary: item.supbudget === 1
      });
    });

    // Calculate summary statistics
    const totalAllocated = budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalBaseAmount = budgetItems.reduce((sum, item) => sum + (item.baseamount || 0), 0);
    const approvedCount = budgetItems.filter(item => item.appapproved === "1").length;
    const pendingCount = budgetItems.filter(item => item.appapproved === "0").length;

    return {
      status: "SUCCESS",
      message: `Budget details retrieved for ${year}`,
      summary: {
        year: year,
        period: period,
        baseCurrency: baseCurrency,
        totalBudget: totalBudget,
        totalAllocated: totalAllocated,
        totalBaseAmount: totalBaseAmount,
        approvedItems: approvedCount,
        pendingItems: pendingCount,
        totalItems: budgetItems.length
      },
      budgetByLevel: budgetByLevel,
      rawBudgetItems: budgetItems,
      availableCurrencies: data.currlst?.map(c => ({ code: c.currcode, name: c.currname })) || []
    };

  } catch (error) {
    return {
      status: "ERROR",
      message: `Failed to retrieve budget details: ${error.message}`,
      error: error.toString()
    };
  }
})