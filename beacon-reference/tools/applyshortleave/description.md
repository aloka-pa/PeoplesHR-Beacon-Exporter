# applyShortLeave

**Task:** Applying Short Leave

**Tags:** Absence Management, Headers

**Status:** live

## Description

applyShortLeave , Before Executing this api you need to call "getShortLeaveApprovalList" and select the approval employee number.

## Signature

```
applyShortLeave
```

## Arguments

_None._


## Advanced arguments

- `reason` (string, required) — Reason ID selected by the user from the 'getShortLeaveApprovalList' API.
- `comment` (string, optional) — Optional comment provided by the user explaining the short leave.
- `approverNumber` (string, required) — Approver's employee ID, selected from the 'getShortLeaveApprovalList' API. ex:- '000001'
- `leaveDate` (string, required) — Leave date in the format DD-MM-YYYY
- `startTime` (string, required) — Start time in 'HH.MM' 24-hour format. Example: '01.00'.
- `Year` (string, required) — takes from the user year like 2025
- `endTime` (string, required) — End time in 'HH.MM' 24-hour format. Example: '09.00'.


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
