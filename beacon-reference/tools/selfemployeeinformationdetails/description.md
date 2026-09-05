# selfEmployeeInformationDetails

**Task:** Fetching The Self Employee Information

**Tags:** Employee Information, Headers, Feat

**Status:** live

## Description

in this tool generate the employee information details.in this tool return the  "personal details", "employment details",  "workstation details",  "contact details" and "other details". and if the user employee self or admin related query first execute the "admin information" tool. then get employee id then after execute in the tool. 
Note: in the agent tool only provide the self employee information details. If a requested label or field is not found in this tool response or API payload, always execute the getNewEmployeeLabelMappings tool to retrieve the updated label mapping and return the corresponding value from there.

## Signature

```
selfEmployeeInformationDetails
```

## Arguments

- `id` (string, required) — self employee id Example:- "000001" etc...


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
