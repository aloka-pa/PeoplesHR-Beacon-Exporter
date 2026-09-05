# updateEmploymentTypeDetails

**Task:** update Employment Type Details

**Tags:** EIM, Headers

**Status:** live

## Description

To update the employee type details using this tool, begin by executing the "getEIMAttributeList" API to retrieve the existing configuration. The system provides predefined duration types along with their corresponding values: "Years" as "000001", "Months" as "000002", "Weeks" as "000003", "Days" as "000004", and "Hours" as "000005". If any field is modified, first verify whether the "Date Limited" checkbox is enabled. If it is, prompt the user to choose a duration type from the available list, and use the corresponding value in the update. Similarly, if the "Retirement Age" option is selected, collect both male and female retirement age inputs from the user. Additionally, ensure that the "Employment Category" is either "Full-Time" or "Part-Time". If any of the required fields are missing during the update process, re-fetch the corresponding data using the getEIMAttributeList API to ensure completeness and accuracy. and if the user any missing field to getEIMAttributeList api.

## Signature

```
updateEmploymentTypeDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtempdesc` (string, required) — Name or label of the Employment Type (e.g., Permanent, Contractual).
- `ctl00_body_cbisdatelimit` (string, required) — Indicates if the employment has a date limit (checkbox).
- `ctl00_body_nuDuration` (string, optional) — Duration of employment (only required if Date Limited is enabled).
- `ctl00_body_dpDurationType` (string, optional) — Duration unit (e.g., Months, Years) (only required if Date Limited is enabled).
- `ctl00_body_chkRetirementAge` (string, required) — Indicates if retirement age is applicable (checkbox).
- `ctl00_body_nuAgeofMale` (string, optional) — Retirement age for males (required if Retirement Age is enabled).
- `ctl00_body_nuAgeofFemale` (string, optional) — Retirement age for females (required if Retirement Age is enabled).
- `ctl00_body_dpempcat` (string, required) — Employment category (e.g., Full-Time, Part-Time).


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
