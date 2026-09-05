# getTeamAttendanceApprovalDetails

**Task:** fetching team attendance approval details

**Tags:** Attendance, DummyL, phase2

**Status:** live

## Description

Retrieves attendance approval data for a specific employee. The AI will extract the employee ID from the user's natural language query (e.g., 'get attendance for Natalie Taylor - ID: 000042').

## Signature

```
getTeamAttendanceApprovalDetails
```

## Arguments

_None._


## Advanced arguments

- `fromDate` (string, required) — Start date for the attendance period in format dd/mm/yyyy (e.g., '23/11/2019')
- `toDate` (string, required) — End date for the attendance period in format dd/mm/yyyy (e.g., '23/12/2025')
- `rosterCode` (string, optional) — Optional roster code to filter by specific roster (e.g., '000017'). Leave empty or omit to get all rosters. Default is empty string (all rosters).
- `filterMode` (string, optional) — Filter mode: '1' for specific employee (requires empNumber), '2' by roster (requires rosterCode), '3' for all records. Default is '3'.
- `isGroupByEmployee` (boolean, optional) — Whether to group results by employee. Default is false.
- `allInOut` (boolean, optional) — Include all in/out records. Default is true.
- `dataWithOT` (boolean, optional) — Include overtime data. Default is false.
- `dataWithLate` (boolean, optional) — Include late records. Default is false.
- `dataWithNoPay` (boolean, optional) — Include no-pay records. Default is false.
- `includeRejected` (boolean, optional) — Whether to also fetch rejected attendance records. Default is false.
- `employeeNumber` (string, optional) — Optional employee ID to filter by specific employee. Will be encrypted before sending to API. Leave empty to get all employees' attendance records.


## Assigned agents

- Training & Development | Workflow Assist | Phase 2 | Agent (`69562bd4e05f6cdd1594bd17`)
