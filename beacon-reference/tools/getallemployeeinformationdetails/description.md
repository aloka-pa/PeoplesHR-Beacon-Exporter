# getAllEmployeeInformationDetails

**Task:** Fetching Employee Information Details

**Tags:** EmployeeInformation, Headers, Feat

**Status:** live

## Description

in this tool generate the employee information details.in this tool return the  "personal details", "employment details",  "workstation details",  "contact details" and "other details". and if the user employee self or admin related query first execute the "admin information" tool. then get employee id then after execute in the tool.
If a requested label or field is not found in this tool response or API payload, execute the getNewEmployeeLabelMappings tool to retrieve the updated label mapping and return the corresponding value from there.

## Signature

```
getAllEmployeeInformationDetails
```

## Arguments

- `id` (string, required) — to give the employee id Example:- "000001" etc...


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
