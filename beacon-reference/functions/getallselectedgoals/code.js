(async function(args) {


const employeeData = await (async function extractFullEmployeeInfo() {
    const iframe = document.querySelector('#ifrmPage');
    if (!iframe) {
        return null;
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const container = iframeDoc.querySelector('#perfv8-goalplanning-partial-employeeinformationheader-7');
    if (!container) {
        return null;
    }

    const img = container.querySelector('img');
    const imageSrc = img?.getAttribute('src') || '';
    let empNumber = null;

    if (imageSrc) {
        const url = new URL(imageSrc, window.location.origin); // handles relative URLs
        empNumber = new URLSearchParams(url.search).get('Emp_number');
    }

    const nameSpans = Array.from(container.querySelectorAll('span.V2_perName'));
    const empName = nameSpans[0]?.innerText?.trim() || '';
    const separator = nameSpans[1]?.innerText?.trim() || '';
    const empCode = nameSpans[2]?.innerText?.trim() || '';

    const designation = container.querySelector('span.notbold')?.innerText?.trim() || '';
    const evaluation = container.querySelectorAll('span.Employee_info_span_center')[0]?.innerText?.trim() || '';
    const corporateTitle = container.querySelectorAll('span.Employee_info_span_center')[1]?.innerText?.trim() || '';
    const personalGrade = container.querySelectorAll('span.Employee_info_span_center')[2]?.innerText?.trim() || '';

    return {
        empImageURL: imageSrc || null,
        empNumber: empNumber || null,
        empName,
        empCode,
        designation,
        evaluation,
        corporateTitle,
        personalGrade
    };
})();

     BeaconBar.setSharedData("employeeNo",employeeData.empNumber );


  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");

  const reqOptions = await BeaconBar.executeFunction("reqOptions")();

  const { Eval_id } = args;

  const url = `${reqOptions}PerfV8/api/GoalPlanning/LoadEmployeeGoals?Eval_id=${encodeURIComponent(Eval_id)}&Emp_number=${encodeURIComponent(employeeData.empNumber)}&GoalVersion=${encodeURIComponent('1')}&_=${Date.now()}`;

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch(url, requestOptions);
  const data = await response.json();
  return data;
 })
// ({
//   Eval_id: "5",
//   Emp_number: "TGthOHhQUDBCMkhjNERBbGFLU055cDJlWE1URk9MOEg5eC84MGc4NEFLYWRIS25FdmNTK25CT1lGTHFhWFJ4cC9aWEhNR3YrYXJ5UnlKaklvckNvN2ZOa1RrNGdnU0RuaXVqcVpNUm04RjhHNy83cWw3eVRzSGxYMmZRRENkWDBYb1ZIaFFWTXFFNWlaN2J5NE9DQkorRlo3RWVmL3Q3TkppSlpMQzFGUWtnSlNxMkZSN3RBQStxbzdzNnI4SHB2ZytVT05MNTZjamZTVEF0Tm5GOUpzalczdW1rc2grbmtqQzU1WnhiTThRaDZTQThkYjdkNCtRNTlUWFRpOVJGQXdDRXFIZm5qVlI1S2lWOW1Fak81ODhoaWEvbXBsUHNSVHhSbVZMc1hWcUhqSEgySjlHR1ArVjgxZjBlbllKS0lWcXlJN2RWODF3VEJyWWV2YlFmRXVPc2ZZTFhJRllpY1JpcVdGMUxCY3NqSTFZeFVpNGROWVBiVy9tWHNFanpUaHJ2dGNrUExKanlYRHJ2VVVLeW9leHd1ZlFkSk54eVYvTUEwNGFaWjFIdkhvOEhoV3cwUFJqVG9MNlhQOUp5K3NLNmVBb245TTFjRHZVY2hDUHZ0b2lnajNjMTBWakpiZkhkUm0yQ29jYUhlNjQyL01iQ0V2KzRwbjh6SWM3SXFzQW1PVXZ0aFNLMnlEQ21nZEpIWUM5cWZZZVIyR1BXckFpZzg1TnpMWmlFQ3FxTVF0eFJtSC9LY0FtczZFTkVHbjN0MWNnQ1duME83OGlNQjAvOEt0Zz09",
//   GoalVersion: "1"
// });
