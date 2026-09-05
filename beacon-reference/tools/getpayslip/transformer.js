(async function (data, args, reqOptions) {
  debugger;

  if (BeaconBar.user.metaData.empNo !== args.employeeid) {
    return `Showing details only for the logged-in employee. Current employee: ${BeaconBar.user.metaData.empNo} - ${BeaconBar.user.metaData.empName}`;
  }


  const paysliputil = await BeaconBar.executeFunction("paysliputils")(args);
  const params = new URLSearchParams(paysliputil.query);
  const extracted = Object.fromEntries(params.entries());

  const payslipHTML = await BeaconBar.executeFunction("payslipDownload")(extracted , args);

  function extractPayslipDetailsFromHTML(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const employeeName = doc.querySelector('#txtName')?.value?.trim() || '';
    const payPeriod = doc.querySelector('#txtPayPeriod')?.value?.trim() || '';

    const rows = doc.querySelectorAll('#grdSummary_ctl00 tbody tr');
    const summary = {};

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length === 2) {
        const key = cells[0].textContent.trim();
        const value = cells[1].textContent.trim();
        summary[key] = parseFloat(value.replace(/,/g, '')) || 0;
      }
    });

    return { employeeName, payPeriod, payslipDetails: summary };
  }

  const payslipData = extractPayslipDetailsFromHTML(payslipHTML);

  // PDF generation is kept here if you need in future
  /*
  async function loadScriptOnce(src) { ... }
  async function generatePayslipPDFBlob(data) { ... }
  */

  if (
    payslipData &&
    payslipData.payslipDetails &&
    Object.keys(payslipData.payslipDetails).length > 0
  ) {
    // --- COMMENTED OUT download confirmation + PDF creation ---
    /*
    const userWantsDownload = confirm(
      `Payslip for ${payslipData.employeeName} (${payslipData.payPeriod}) is ready.\n\nDo you want to download it as a PDF?`
    );
    if (userWantsDownload) {
      try {
        const blob = await generatePayslipPDFBlob(payslipData);
        ...
      } catch (err) {
        return { payslipData, message: err.message };
      }
    } else {
      return { payslipData, message: "Download cancelled by user." };
    }
    */

    // Just return the parsed data
    return {
      payslipData,
      message: "Payslip parsed successfully (download skipped)."
    };
  } else {
    return {
      payslipData,
      message: "No payslip data found."
    };
  }
})
