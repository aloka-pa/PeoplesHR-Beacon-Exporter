# selfEmployeeAttendanceSummaryDetails

**Task:** Fetching Self Employee Attendance Summary Details

**Tags:** Attendance, Headers

**Status:** live

## Description

Before executing the getAttendanceSummaryDetails API:
1.If the user’s query includes an employee ID or uses terms like “my”, “myself”, or “self”, first execute the adminInformation API to retrieve the employee ID of the logged-in user.
2.Before processing any dates, you must first execute the dateFormat API to get the correct date format from its response and then use that format in subsequent API calls.
3.If the query includes a roster filter (e.g., a roster name is mentioned without any employee ID), execute the rostersDetails API to get the correct roster ID. 
above steps must be following other then final api is fail. date format must be take in the format example "DD/MM/YYYY", "22/01/2023".


## Signature

```
selfEmployeeAttendanceSummaryDetails
```

## Arguments

- `fromDate` (string, required) — to give the fromDate Example:-"22/01/2023" format date DD/MM/YYYY
- `toDate` (string, required) — to give the toDate Example:-"25/12/2024" format date DD/MM/YYYY
- `rosterCode` (string, optional) — to get the user select roster corresponding id will be take roster CodeExample '000030' execute for "rosetersDetails" tool.


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
