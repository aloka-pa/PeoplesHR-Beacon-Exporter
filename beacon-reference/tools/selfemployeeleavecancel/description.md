# selfEmployeeLeaveCancel

**Task:** Self Employee Leave Cancel

**Tags:** Absent Management, Headers, BugFix

**Status:** live

## Description

Before calling the selfEmployeeLeaveCancel API, first execute the selfEmployeeLeaveHistory API to retrieve the applied leave dates. Use only the leaveAppliedDate to filter records (do not check fromDate or toDate). If the user’s given date exists in the history:
If one record matches, return its leaveAppliedId directly.
If multiple records match, display them and prompt the user to select one, then return the selected record’s leaveAppliedId.
If no records match, inform the user that no leave application exists for that date.
Do not ask the user for a leaveAppliedId; only ask for the leave applied date, and fetch the corresponding ID automatically
once find the applied date then final execute "selfEmployeeLeaveCancel" api.

## Signature

```
selfEmployeeLeaveCancel
```

## Arguments

- `leaveCancelDate` (string, required) — to give the leave cancel Date using in this format date example "06/24/2025" format "dd/mm/yyyy".
- `comment` (string, required) — reason or comment for leave cancel
- `leaveAppliedId` (string, required) — dont user ask for leave id to get user given date or user date corresponding leave applied Id to get example "82.0","71.0" etc..
- `year` (string, required) — to give the leave cancel year


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagementEmployee (`690dc572931a2d61ba0b1c72`)
