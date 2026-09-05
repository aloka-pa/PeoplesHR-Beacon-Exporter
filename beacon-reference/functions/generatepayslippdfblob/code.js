(async function (data) {
    await Promise.all([
        new Promise(resolve => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = resolve;
            document.head.appendChild(s);
        }),
        new Promise(resolve => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
            s.onload = resolve;
            document.head.appendChild(s);
        })
    ]);

    await new Promise(resolve => {
        const check = () => {
            if (window.jspdf && window.jspdf.jsPDF) return resolve();
            setTimeout(check, 100);
        };
        check();
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(40, 90, 150);
    doc.text('Payslip Summary', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Employee Name: ${data.employeeName}`, 14, 30);
    doc.text(`Pay Period: ${data.payPeriod}`, 14, 38);

    const tableData = Object.entries(data.payslipDetails).map(([key, value]) => [
        key,
        typeof value === 'number' ? value.toLocaleString() : value
    ]);

    doc.autoTable({
        startY: 45,
        head: [['Description', 'Amount']],
        body: tableData,
        styles: { halign: 'right' },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'right' }
        }
    });

    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);

    return url;

});