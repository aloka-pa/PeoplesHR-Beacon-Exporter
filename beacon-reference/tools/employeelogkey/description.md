# employeeLogKey

**Task:** Employee Logs

**Tags:** Absence Management, Headers

**Status:** live

## Description

Before awaiting and executing the "employeeLogKey" tool, ensure that it depends exclusively on the empId, empName, and empDOB values obtained from the "employeeDetails" tool.
The date of birth must ai not be auto-generated or inferred — it should be directly taken from the "employeeDetails" tool’s response.
"employeeDetails" api execute complete then start execute "employeeLogKey" because before api need dependancy.

Note : No response data from the getGlobalEmployeeSearch API should be accessed or used as input arguments.

## Signature

```
employeeLogKey
```

## Arguments

- `empId` (string, required) — to get the employee id for "employeeDetails" Api.only before api response employee will be take other api response no read
- `empName` (string, required) — to get the employee name for "employeeDetails" Api. only before api response employee will be take other api response no read
- `empDOB` (string, required) — to get the employee data of birth  for "employeeDetails" Api.only before api response employee will be take other api response no read


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
