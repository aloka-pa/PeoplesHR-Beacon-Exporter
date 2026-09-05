# bulkEmployeeSelectDetails

**Task:** Fetching Employees Selected List

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

Before executing this tool, you must first run the "bulkEmployees" tool, as the employee name, ID, and their corresponding main index are essential. If the user has not selected any specific employee names or IDs, display the full list of employees. Once the user selects one or more employees, extract the corresponding index values based on the selected employee names or IDs. These index values should then be return string  format "1", "2", "5", ... and index values must should every value string like "0","1" This formatted list must be assigned to the tool’s argument named empList.

## Signature

```
bulkEmployeeSelectDetails
```

## Arguments

- `empList` (string, required) — to get the user select employee index list example "1", "2", "5", ...


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
