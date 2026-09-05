# selfEmployeeLeaveBalance

**Task:** Fetching The Self Employee Leave Balances

**Tags:** Absent Management, Headers

**Status:** live

## Description

in this api return for only self employee leave balance. before execute "selfEmployeeLeaveBalance" tool,
 first check below flow steps.
1. if the user self or myself, self related query execute the "getAdminInformationDetails" api to get the employee id 
2. else other employee related query mention employee name or id provide execute "getGlobalEmployeeSearch" too. to get the employee id.

## Signature

```
selfEmployeeLeaveBalance
```

## Arguments

- `year` (string, required) — user to give the year, if the user not given ai current year will be take.
- `id` (string, required) — to get the employee id.must be execute the 'getAdminInformationDetails' to get the self employee id. must be required field. example id "1234"


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagementEmployee (`690dc572931a2d61ba0b1c72`)
