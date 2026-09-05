# getUpdateCorporateTitleDetails

**Task:** Update Corporate Title Details

**Tags:** EIM, Headers

**Status:** live

## Description

To update Corporate Title details, must and should be first execute or calling the "getEIMAttributeList" API. The response from this API will be used to fill any missing fields provided by the user. Additionally, the Salary Grade and Next Upgrade Level options will be displayed, allowing the user to select the appropriate name, and the corresponding value will be used for the getEIMAttributeList API. and if the user top in hierarchy is off to choice the next upgrade level else don not ask the next upgrade level . if the user update the salary grade user give the salary grade name corresponding value will be take.

## Signature

```
getUpdateCorporateTitleDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Corporate Title Name (e.g., 'Middle Management').
- `ctl00_body_dpSalary` (string, required) — Selected Salary Grade code (e.g., '000005'). All Salary Grades will be displayed for the user to select, and the corresponding value must be picked. to get corresponding value take for salary grade.
- `ctl00_body_chkTop` (string, optional) — Top in Hierarchy flag. If provided as 'on', 'Next Upgrade Level' must NOT be passed.
- `ctl00_body_dpNextUpgrade` (string, optional) — Next Upgrade Level code (e.g., '000008'). This must be provided if 'Top in Hierarchy' is not 'on'.
- `ctl00_body_nuLevel` (integer, required) — Level number (e.g., 3).
- `ctl00_body_ManagePos` (string, required) — Indicates whether it is a Managerial Position. on or off


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
