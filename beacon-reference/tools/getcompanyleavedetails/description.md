# getCompanyLeaveDetails

**Task:** fetching Company Leave Details

**Tags:** Absence Management, Headers

**Status:** live

## Description

getCompanyLeaveDetails , before calling this api you need to call "selectEmployee" api and show all the employees execute this tool for queries related to absent or on leave employees on a specified date.

## Signature

```
getCompanyLeaveDetails
```

## Arguments

- `employeeId` (string, required) — employeeId , takes from the user if does not not give not necessary 
- `fromDate` (string, required) — Ex:- "2025-01-01"
- `toDate` (string, required) — toDate , Ex:-  "2025-12-31"
- `selectingEmployeeIdsOrName` (string, required) — selectingEmployeeIdsOrName  if user gives  the employeeName or Ids only take or else take "allEmployees"


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
