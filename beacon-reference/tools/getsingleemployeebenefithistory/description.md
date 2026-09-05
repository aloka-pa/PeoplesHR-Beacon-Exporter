# getSingleEmployeeBenefitHistory

**Task:** Fetching Employee Benefit History

**Tags:** BenefitManagement, Headers

**Status:** live

## Description

Before calling in this api "getSingleEmployeeBenefitHistory" api, first calling in this api call "getBenefitEmployeeInformation" api. do not ask for employee id my and self employee related query to execute for "getAdminInformationDetails" api to get the employee id. do not ask for employee id.

If user asks employee benefit history for single employee call getEmployeeBenefitHistory  api.
Do not call this api if you user do not provide fromDate and toDate.

ALWAYS TAKE ONLY THE EMPLOYEE ID.

## Signature

```
getSingleEmployeeBenefitHistory
```

## Arguments

- `id` (string, required) — to get the employee id for getBenefitEmployeeInformation api. Example:-"000006"
- `fromDate` (string, required) — Ask user to provide the fromDate D/M/YYYY. If user not provided ask user to provide.
- `toDate` (string, required) — ask user to provide toDate D/M/YYYY. If user not provided ask user to provide.


## Advanced arguments

_None._


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
