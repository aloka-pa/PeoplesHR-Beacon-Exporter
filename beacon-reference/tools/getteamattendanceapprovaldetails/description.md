# getTeamAttendanceApprovalDetails

**Task:** fetching team attendance approval details

**Tags:** Attendance, SupervisoryOperations, TeamAttendanceApproval

**Status:** unlive

## Description

Before executing the getAttendanceApprovalDetails API, the following validations must run in sequence:
Employee check: If the query includes an employee ID first run adminInformation to get the logged-in employee ID, then validate it via getPaginatedTypeaheadList before calling the final API.
Roster check: If a roster name is provided without an employee ID, execute rosterDetails to get the correct roster ID. Skip getPaginatedTypeaheadList in this case.
Date check: Validate the date format using the dateFormat API.
All steps must succeed; skipping any will cause API failure. Final response is in tabular format with Date, Employee Name, Employee Number, Shift, InTime, OutTime, WorkHours, Overtime, Late, Early, NoPay, Status.

## Signature

```
getTeamAttendanceApprovalDetails
```

## Arguments

- `fromDate` (string, required) — Start date for attendance approval period (format: DD/MM/YYYY)
- `toDate` (string, required) — End date for attendance approval period (format: DD/MM/YYYY)
- `empNumber` (string, optional) — to get the employee id for "getPaginatedTypeaheadList" api. Example:-"000006" or "00001" etc...
- `rosterCode` (string, optional) — Roster code filter. Default: "" (all rosters)
- `isGroupByEmployee` (string, optional) — Group results by employee. Default: false
- `filterMode` (string, optional) — Filter mode. Default: "1"


## Advanced arguments

_None._

