(async function (data, args, reqOptions) {
  try {

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar?.user?.metaData?.menus?.includes("EIM/CurrencyType.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Currency Type screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Navigate to the Currency Type page
     * ------------------------------------------------- */
    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/CurrencyType.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/CurrencyType.aspx`;


    // Open the page in an iframe to get the rendered DOM
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    try {
      // Load the page
      await new Promise((resolve, reject) => {
        iframe.onload = resolve;
        iframe.onerror = reject;
        iframe.src = url;
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Page load timeout')), 10000);
      });

      // Wait a bit for JavaScript to execute and apply styles
      await new Promise(resolve => setTimeout(resolve, 2000));

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      /* -------------------------------------------------
       * 3) Extract base currency row (row with blue background)
       * ------------------------------------------------- */
      const allRows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");

      // Log first 5 rows
      for (let i = 0; i < Math.min(5, allRows.length); i++) {
        const row = allRows[i];
        const style = row.getAttribute("style") || row.style.cssText;
        const tds = row.querySelectorAll("td");
        const code = (tds[0]?.textContent || "").trim();
        const name = (tds[1]?.textContent || "").trim();
        
      }

      // Look for row with blue background color
      let baseRow = null;
      
      // Method 1: Check inline style attribute
      baseRow = doc.querySelector("tr[style*='C6DEFA' i]");
      
      // Method 2: Check computed style if inline not found
      if (!baseRow) {
        for (const row of allRows) {
          const computedStyle = iframe.contentWindow.getComputedStyle(row);
          const bgColor = computedStyle.backgroundColor;
          
          // Convert rgb to hex to check if it's the blue color
          if (bgColor && bgColor.includes('198, 222, 250')) { // RGB values for #C6DEFA
            baseRow = row;
            break;
          }
        }
      }

      if (!baseRow && allRows.length > 0) {
        baseRow = allRows[0];
      }

      if (!baseRow) {
        return {
          status: "NOT_FOUND",
          message: "No currency records found in the summary grid."
        };
      }

      const tds = baseRow.querySelectorAll("td");
      const result = {
        currencyCode: (tds[0]?.textContent || "").trim(),
        currencyName: (tds[1]?.textContent || "").trim(),
        currencySymbol: (tds[2]?.textContent || "").trim(),
        exchangeRate: "1"
      };


      return {
        status: "SUCCESS",
        baseCurrency: result
      };

    } finally {
      // Clean up iframe
      document.body.removeChild(iframe);
    }

  } catch (e) {
    return { status: "ERROR", message: e?.message || String(e) };
  }
});