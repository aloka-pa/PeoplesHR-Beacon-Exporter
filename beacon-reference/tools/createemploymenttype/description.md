# createEmploymentType

**Task:** Create Employment Type

**Status:** unlive

## Description

To create Employee Type details using this tool, first check if the "Date Limited" checkbox is enabled. If it is, prompt the user to enter both the employment duration and the corresponding duration type, chosen from the predefined list: "Years" ("000001"), "Months" ("000002"), "Weeks" ("000003"), "Days" ("000004"), and "Hours" ("000005"). Similarly, if the "Retirement Age" option is selected, request both male and female retirement age inputs. The "Employment Category" field is optional, but if the user provides it, follow up by ensuring the input is either "Full-Time" or "Part-Time".

## Signature

```
createEmploymentType
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtempdesc` (string, required) — Name or label of the Employment Type (e.g., Permanent, Contractual).
- `ctl00_body_cbisdatelimit` (string, optional) — Indicates if the employment has a date limit (checkbox).
- `ctl00_body_nuDuration` (string, optional) — Duration of employment (only required if Date Limited is enabled).
- `ctl00_body_dpDurationType` (string, optional) — Duration unit (e.g., Months, Years) (only required if Date Limited is enabled).
- `ctl00_body_chkRetirementAge` (string, optional) — Indicates if retirement age is applicable (checkbox).
- `ctl00_body_nuAgeofMale` (string, optional) — Retirement age for males (required if Retirement Age is enabled).
- `ctl00_body_nuAgeofFemale` (string, optional) — Retirement age for females (required if Retirement Age is enabled).
- `ctl00_body_dpempcat` (string, optional) — Employment category (e.g., Full-Time, Part-Time).

