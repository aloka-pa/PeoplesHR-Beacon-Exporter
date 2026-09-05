(async function (data, args, reqOptions) {

  if (!BeaconBar.user.metaData.menus.some(x => x.includes("EIMV9/Widget?mode=0&mvc=1"))) {
    return "It seems you don't have access. Please check with the HR Admin";
  }

  const updateurl = await BeaconBar.executeFunction("updateUrlParams")("EIMV9/Widget?mode=0&mvc=1");
  let url;
  let param;
  if (updateurl.updateUrl) {
    url = updateurl.updateUrl;
    param = updateurl.updateParams
  } else {
    url = "EIMV9/Widget?mode=0&mvc=1",
      param = "mode=0&mvc=1"
  }
  const digest = await BeaconBar.executeFunction("getDigest")(param);
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("accept-language", "en-US,en;q=0.9");
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("x-requested-with", "XMLHttpRequest");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(`${location.origin}/${reqOptions.sl}/${url}&digest=${digest.digest}`, requestOptions);
  const text = await response.text();

  const widgetsMatch = text.match(/window\.Widgets\s*=\s*(\{[\s\S]*?\});/);
  const details = JSON.parse(widgetsMatch[1]);

  const formData = new URLSearchParams();
  formData.append("empNumber", details.Employee.EmpNumber);
  formData.append("employeetype", "1");

  const response3 = await fetch(`${location.origin}/${reqOptions.sl}/EIMV9/api/CommonAPI/LoadWidget?empNumber=${details.Employee.EmpNumber}`, {
    method: "POST",
    headers: {
      "Accept": "*/*",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "include",
    body: formData
  });

  const result = await response3.json();

  const parser = new DOMParser();

  // Employee lifecycle
  const response4 = await fetch(`${location.origin}/${reqOptions.sl}/${details.WidgetList[0].WidgetPath}?empNumber=${details.Employee.EmpNumber}`, requestOptions);
  const text2 = await response4.text();
  const document2 = parser.parseFromString(text2, "text/html");
  const html2 = document2.documentElement.innerHTML;

  const elcMatch = html2.match(/window\.EimElcWidget\s*=\s*'([^']+)'/);
  const rawJsonStr = elcMatch[1].replace(/\\u0026/g, '&').replace(/\\"/g, '"');
  const elcData = JSON.parse(rawJsonStr);

  const firstItem = elcData.EimWidgetItemList?.[0];
  const employeelifecycle = {
    year: firstItem.WidgetAppYear,
    type: firstItem.WidgetTypeName,
    date: firstItem.WidgetEffectiveDateStr
  };

  // Time & Attendance
  const response5 = await fetch(`${location.origin}/${reqOptions.sl}/${details.WidgetList[1].WidgetPath}?empNumber=${details.Employee.EmpNumber}`, requestOptions);
  const text3 = await response5.text();
  const document3 = parser.parseFromString(text3, "text/html");

  const timeAndAttenadance = [];

  const avgInTime = document3.querySelector('#TNAV9-AverageTime-7 .f15')?.textContent.trim() || 'N/A';
  const avgOutTime = document3.querySelector('#TNAV9-AverageTime-8 .f15')?.textContent.trim() || 'N/A';
  const avgDuration = document3.querySelector('#TNAV9-AverageTime-9 .f15')?.textContent.trim() || 'N/A';

  timeAndAttenadance.push({ label: "Average In Time", value: avgInTime });
  timeAndAttenadance.push({ label: "Average Out Time", value: avgOutTime });
  timeAndAttenadance.push({ label: "Average Duration", value: avgDuration });

  const lateActual = document3.querySelector('#TNAV9-mtd-10 .f15')?.textContent.trim() + " Min";
  const lateApproved = document3.querySelector('#TNAV9-mtd-12 .f15')?.textContent.trim() + " Min";
  const lateAvg = document3.querySelector('#TNAV9-mtd-14 .f15')?.textContent.trim() + " Min";

  timeAndAttenadance.push({ label: "MTD Total Late - Actual", value: lateActual });
  timeAndAttenadance.push({ label: "MTD Total Late - Approved", value: lateApproved });
  timeAndAttenadance.push({ label: "MTD Total Late - Company Average", value: lateAvg });

  const noPayActual = document3.querySelector('#TNAV9-mtd-17 .f15')?.textContent.trim() + " Day(s)";
  const noPayApproved = document3.querySelector('#TNAV9-mtd-19 .f15')?.textContent.trim() + " Day(s)";
  const noPayAvg = document3.querySelector('#TNAV9-mtd-21 .f15')?.textContent.trim() + " Day(s)";

  timeAndAttenadance.push({ label: "MTD Total No Pay - Actual", value: noPayActual });
  timeAndAttenadance.push({ label: "MTD Total No Pay - Approved", value: noPayApproved });
  timeAndAttenadance.push({ label: "MTD Total No Pay - Company Average", value: noPayAvg });

  const percentage = document3.querySelector('#attCanvasPayble + h3')?.textContent.trim() || "0%";
  const regHours = document3.querySelector('#TNAV9-paydist-8')?.textContent.trim() || "0.00 HH:MM";
  const otHours = document3.querySelector('#TNAV9-paydist-11')?.textContent.trim() || "0.00 HH:MM";

  timeAndAttenadance.push({ label: "Payable Time %", value: percentage });
  timeAndAttenadance.push({ label: "Regular Working Hours (MTD)", value: regHours });
  timeAndAttenadance.push({ label: "Approved Overtime Hours (MTD)", value: otHours });

  // Leave Widget
  const response6 = await fetch(`${location.origin}/${reqOptions.sl}/${details.WidgetList[2].WidgetPath}?empNumber=${details.Employee.EmpNumber}`, requestOptions);
  const text4 = await response6.text();
  const document4 = parser.parseFromString(text4, "text/html");

  const leaveScript = Array.from(document4.querySelectorAll("script"))
    .find(s => s.textContent.includes("var modelLost"));

  const lost = JSON.parse(leaveScript.textContent.match(/var modelLost = '(.*?)';/s)[1]);
  const bradford = JSON.parse(leaveScript.textContent.match(/var modelBradford = '(.*?)';/s)[1]);
  const heatmap = JSON.parse(leaveScript.textContent.match(/var modelHeatmap = '(.*?)';/s)[1]);

  const leaveWidgetData = {
    lostTime: {
      description: "The percentage of productivity lost due to unplanned employee absences.",
      departmentAverage: lost.DepartmentPercentage + "%",
      companyAverage: lost.CompanyPercentage + "%",
      groupAverage: lost.GroupPercentage + "%",
      legend: ["Leave days", "Working Days"]
    },
    bradfordFactor: {
      description: "Ratio of frequent, short absences to measure the impact of employee absences and their disruption.",
      value: bradford.BradfordFactor.toString(),
      departmentAverage: bradford.DepartmentPercentage.toString(),
      companyAverage: bradford.CompanyPercentage.toString(),
      groupAverage: bradford.GroupPercentage.toString(),
      levels: [
        "0 - 200 Low Level",
        "201 - 400 Medium Level",
        "401 - 600 High Level",
        "601 - 1000 Very High Level"
      ]
    },
    unplannedLeaveUtilization: {
      description: "Unplanned employee absences during the working days.",
      totalUnplannedLeaveDays: heatmap.TotalAbsenceCount.toString(),
      peakDayLeaveCount: heatmap.MostAbsenceDayCount.toString(),
      heatmap: {
        SU: heatmap.Sunday?.ColourCode || "",
        MO: heatmap.Monday?.ColourCode || "",
        TU: heatmap.Tuesday?.ColourCode || "",
        WE: heatmap.Wednesday?.ColourCode || "",
        TH: heatmap.Thursday?.ColourCode || "",
        FR: heatmap.Friday?.ColourCode || "",
        SA: heatmap.Saturday?.ColourCode || ""
      },
      intensity: ["Low", "High"]
    }
  };

  // Training Widget
  const response7 = await fetch(`${location.origin}/${reqOptions.sl}/${details.WidgetList[3].WidgetPath}?empNumber=${details.Employee.EmpNumber}`, requestOptions);
  const text5 = await response7.text();
  const document5 = parser.parseFromString(text5, "text/html");

  const trainingScript = Array.from(document5.querySelectorAll("script"))
    .find(s => s.textContent.includes("var modelProfile"));

  let modelProfile = {};
  const trainingMatch = trainingScript.textContent.match(/var modelProfile = '(.*?)';/s);
  if (trainingMatch && trainingMatch[1]) {
    const cleanJson = trainingMatch[1].replace(/\\"/g, '"').replace(/\\u0026/g, '&');
    modelProfile = JSON.parse(cleanJson);
  }

  let formattedDate = "";
  if (modelProfile.lastYrTrn?.[0]?.StartDate) {
    const rawDate = modelProfile.lastYrTrn[0].StartDate;
    const timestamp = parseInt(rawDate.match(/\d+/)[0], 10);
    const dateObj = new Date(timestamp);
    formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
  }

  const financialPeriod = document5.querySelector('#FinancialPeriod')?.value || "";

  const trainingWidgetData = {
    lastTraining: {
      durationSince: "1 Years and 4 Months",
      title: modelProfile.lastYrTrn?.[0]?.CosName || "N/A",
      dateHeld: "Held on :" + formattedDate,
      evaluation: "Last Attended Training - Evaluations Not Available"
    },
    nextTraining: {
      durationLeft: (modelProfile.nxttrain?.nodays || 0) + " Days",
      title: "No Training sessions are scheduled"
    },
    financialPeriod: financialPeriod,
    thisYear: {
      period: modelProfile.thisYrPeriod || "",
      trainingsCompleted: modelProfile.thisYrCount || 0,
      hours: modelProfile.thisYrHours || "0.00",
      cost: modelProfile.thisYrCost || "0.0000",
      cpdPoints: modelProfile.thisCPD || 0
    },
    lastYear: {
      period: modelProfile.lastYrPeriod || "",
      trainingsCompleted: modelProfile.lastYrCount || 0,
      hours: modelProfile.lastYrHours || "0.00",
      cost: modelProfile.lastYrCost || "0.0000",
      cpdPoints: modelProfile.lastCPD || 0
    }
  };
  if (result?.Employee) {
    // Personal
    delete result.Employee.EmpPerTelephone;
    delete result.Employee.EmpPerMobile;

    // Temporary
    delete result.Employee.EmpTemTelephone;
    delete result.Employee.EmpTemMobile;

    // Office
    delete result.Employee.EmpOfficePhone;
    delete result.Employee.EmpOfficeMobile;

    // Other (if present)
    delete result.Employee.EmpNotTelephone;
    delete result.Employee.EmpNotMobile;

    // Optional: remove area code/fax too (only if you want)
    // delete result.Employee.EmpPerFax;
    // delete result.Employee.EmpTemFax;
    // delete result.Employee.EmpOfficeAreaCode;
    // delete result.Employee.EmpPerAreaCode;
    // delete result.Employee.EmpTemAreaCode;
  }
  return {
    result,
    employeelifecycle,
    timeAndAttenadance,
    leaveWidgetData,
    trainingWidgetData
  };

});
