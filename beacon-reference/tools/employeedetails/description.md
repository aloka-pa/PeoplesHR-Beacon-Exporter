# employeeDetails

**Task:** Employee Details

**Tags:** Absence Management, Headers

**Status:** live

## Description

This tool is used to generate employee details. If the query is admin-related queries the system must automatically execute the getAdminInformationDetails tool to retrieve the admin user's display number (e.g., "000001"). In such cases, the user should not be prompted to provide an employee display number. This rule is mandatory and must be applied to all admin-specific queries. The "getAdminInformationDetails" tool should always be used to fetch the required admin information in these scenarios. then after must be  execute in this tool

## Signature

```
employeeDetails
```

## Arguments

- `empId` (string, required) — to give the employee display number example "000001"


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
