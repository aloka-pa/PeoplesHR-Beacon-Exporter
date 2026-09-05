(async function (data, args, reqOptions) {
  try {

    /* -------------------------------------------------
     * 1) Access validation
     * ------------------------------------------------- */
    if (!BeaconBar?.user?.metaData?.menus?.includes("EIM/Country.aspx")) {
      return {
        status: "NO_ACCESS",
        message: "You do not have access to Country screen. Please contact HR Admin."
      };
    }

    /* -------------------------------------------------
     * 2) Navigate to the Country page
     * ------------------------------------------------- */
    const updateUrl = await BeaconBar.executeFunction("updateUrlParams")("EIM/Country.aspx");
    const url = updateUrl.updateUrl
      ? `${window.origin}/${reqOptions.sl}/${updateUrl.updateUrl}`
      : `${window.origin}/${reqOptions.sl}/EIM/Country.aspx`;


    // Open the page in an iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    try {
      // Load the page
      await new Promise((resolve, reject) => {
        iframe.onload = resolve;
        iframe.onerror = reject;
        iframe.src = url;
        setTimeout(() => reject(new Error('Page load timeout')), 10000);
      });

      // Wait for JavaScript execution
      await new Promise(resolve => setTimeout(resolve, 1500));

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      /* -------------------------------------------------
       * 3) Find base country row (BurlyWood background)
       * ------------------------------------------------- */
      
      // Method 1: Look for BurlyWood in inline style (most reliable)
      let baseRow = doc.querySelector("tr[style*='BurlyWood' i]");
      
      if (!baseRow) {
        // Method 2: Check all grid rows for BurlyWood style
        const allRows = doc.querySelectorAll("tr[id^='ctl00_body_grdsummary_ctl00__']");
        
        for (const row of allRows) {
          const style = row.getAttribute("style") || "";
          if (style.toLowerCase().includes("burlywood")) {
            baseRow = row;
            break;
          }
        }
      }

      if (!baseRow) {
        return {
          status: "NOT_FOUND",
          message: "Base country not found. Please ensure a base country is configured."
        };
      }

      // Extract country data
      const tds = baseRow.querySelectorAll("td");
      const result = {
        countryCode: (tds[0]?.textContent || "").trim(),
        countryName: (tds[1]?.textContent || "").trim()
      };


      return {
        status: "SUCCESS",
        baseCountry: result
      };

    } finally {
      document.body.removeChild(iframe);
    }

  } catch (e) {
    return { status: "ERROR", message: e?.message || String(e) };
  }
})