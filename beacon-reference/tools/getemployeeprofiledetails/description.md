# getEmployeeProfileDetails

**Task:** Fetching The Employee Profile Details

**Tags:** EmployeeInformation, Headers, Feat

**Status:** live

## Description

This tool generates employee profile details, including employee lifecycle, profile information, time and attendance, leaveWidgetData, and trainingWidgetData. When the user requests profile-related information, the corresponding API should be called. If the user's query specifically matches any of the profile-related data points, return only the relevant information. If there is no match, do not return any response. for example user ask only life cycle only return life cycle details only. other then not return. If a requested label or field is not found in this tool response or API payload, always execute the 'getNewEmployeeLabelMappings' tool to retrieve the updated label mapping and return the corresponding value from there.

## Signature

```
getEmployeeProfileDetails
```

## Arguments

- `empId` (string, required) — to give employee id example '000001' etc...


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
