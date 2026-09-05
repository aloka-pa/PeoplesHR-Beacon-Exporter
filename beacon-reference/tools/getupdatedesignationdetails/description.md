# getUpdateDesignationDetails

**Task:** Update Designation Details

**Tags:** EIM, Headers

**Status:** live

## Description

 If the user updates the Salary Grade field, first execute the getEIMAttributeList tool, followed by the must be execute "gradeSalaryDetails" tool. The corporate titles will be displayed, and the selected corporate title's corresponding value will be used.If the user updates fields other than Salary Grade, then skip the not execute "gradeSalaryDetails" tool and directly execute the update in the tool.  and If the user triggers the humanupdate prompt for the Salary Grade field, the corresponding Corporate Title must be displayed and updated. The user should then select the appropriate Corporate Title. If no Corporate Title is associated with the selected Salary Grade, an error message should be shown: "Please specify the Corporate Title.

## Signature

```
getUpdateDesignationDetails
```

## Arguments

_None._


## Advanced arguments

- `humanUpdateType` (string, optional) — if the user update for salary grade in the 'humanUpdateType' field value is return 'humanUpdate' keyword
- `ctl00_body_txtName` (string, required) — Designation name (e.g., 'Human Resources Manager').
- `ctl00_body_chksenior` (string, required) — selsect senior management 'on' or 'off'.
- `ctl00_body_dpSalary` (string, required) — Selected Salary Grade code (e.g., '000005').
- `ctl00_body_dpNextUpgrade` (string, required) — Selected Corporate Title code (e.g., '000001'). if the user update salry grade under the fields update for corporate title is will take.
- `ctl00_body_dpnextupgradedsg` (string, required) — Selected Next Designation in Career Progression code (e.g., '000034').if the user missing fields to get data for getDesignationDetails api.
- `ctl00_body_cbofunctionRole` (string, required) — Selected Functional Role code (e.g., '000001').if the user missing fields to get data for getDesignationDetails api


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
