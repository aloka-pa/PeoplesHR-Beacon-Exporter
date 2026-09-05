# createDesignation

**Task:** Create Designation

**Status:** unlive

## Description

This tool is used to create a Designation. First, it executes the gradeDetails API to retrieve and select the appropriate salary grade value. After selecting the salary grade, it then executes the getTitle API to retrieve and select the corresponding corporate title value. The steps must be followed in sequence: first execute gradeDetails, then execute getTitle.

## Signature

```
createDesignation
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Designation name (e.g., 'Human Resources Manager').
- `ctl00_body_chksenior` (string, required) — selsect senior management 'on' or 'off'.
- `ctl00_body_dpSalary` (string, required) — Selected Salary Grade code (e.g., '000005').
- `ctl00_body_dpNextUpgrade` (string, required) — Selected Corporate Title or Next Upgrade Level code (e.g., '000001').
- `ctl00_body_dpnextupgradedsg` (string, optional) — Selected Next Designation in Career Progression code (e.g., '000034').if the user missing fields to get data for gradeDetails api.
- `ctl00_body_cbofunctionRole` (string, optional) — Selected Functional Role code (e.g., '000001').if the user missing fields to get data for getTitle api

