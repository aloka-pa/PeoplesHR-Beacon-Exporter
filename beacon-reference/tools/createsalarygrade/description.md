# createSalaryGrade

**Task:** Create Salary Grade

**Tags:** EIM, Headers

**Status:** live

## Description

Before Execute in this tool. first execute the "getCurrencyDetails" Api then display available currency name then pic the currency name corresponding value will be take.

## Signature

```
createSalaryGrade
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtsalname` (string, required) — Salary Grade Name (e.g., GCB Grade 04).
- `ctl00_body_cboCurrType` (string, required) — Selected currency code (e.g., 000001 for AED). display the currency list to selected the currency name to get corresponding value for getCurrencyDetails api
- `ctl00_body_txtMin` (number, required) — Minimum salary point. It must be less than equal to the Mid Point.
- `ctl00_body_txtMid` (number, required) — Mid salary point. It must be greater than the Min Point and less than equal to the Max Point.
- `ctl00_body_txtMax` (number, required) — Maximum salary point. It must be greater than equal to the Mid Point.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
