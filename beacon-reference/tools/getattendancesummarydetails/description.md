# getAttendanceSummaryDetails

**Task:** Fetching Employee Attendance Summary Details

**Tags:** Attendance, Headers

**Status:** live

## Description

Before executing the getAttendanceSummaryDetails API to retrieve employee attendance data, the following validation steps must be performed in sequence for successful execution.
1.If the user’s query includes an employee ID or uses terms like “my”, “myself”, or “self”, first execute the adminInformation API to get the employee ID of the logged-in user. Then, validate the ID using the getPaginatedTypeaheadList API to ensure it maps to a valid employee. Only after this should the getEmployeeAttendanceInAndOutDetails API be executed.
2.If the query includes a roster filter (e.g., a roster name is mentioned without any employee ID), execute the rosetersDetails API to get the correct roster ID. In this case, do not call the getPaginatedTypeaheadList API.
3.Before take the date first check format, must be execute "dateFormat" API, must using date format
above following steps must execute, if the any step missing  final API execution will fail.
final response MUST be returned in tabular format.

## Signature

```
getAttendanceSummaryDetails
```

## Arguments

- `id` (string, required) — to get the employee id for "getPaginatedTypeaheadList" api. Example:-"000006" or "00001" etc...
- `fromDate` (string, required) — to give the fromDate Example:-"02/01/2023" format date DD/MM/YYYY
- `toDate` (string, required) — to give the toDate Example:-"02/01/2024" format date DD/MM/YYYY
- `rosterCode` (string, optional) — to get the user select roster corresponding id will be take roster CodeExample '000030' execute for "rosetersDetails" tool.


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
