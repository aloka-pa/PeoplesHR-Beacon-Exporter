# createCorporateTitle

**Task:** Create Corporate Title

**Status:** unlive

## Description

Before creating a Corporate Title, first fetch and display the Salary Grade and Upgrade Level data. The Salary Grade options must be shown to the user, who will then select a name, and the corresponding value must be captured. If the user marks "Top in Hierarchy" as enabled (on), the Next Upgrade Level field should not be displayed. However, if "Top in Hierarchy" is disabled (off), the Next Upgrade Level options must be shown, and the user should select the appropriate value from the list.

## Signature

```
createCorporateTitle
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Corporate Title Name (e.g., 'Middle Management').
- `ctl00_body_dpSalary` (string, required) — Selected Salary Grade code (e.g., '000005'). All Salary Grades data for getUpdateCorporateTitleDetails api will be displayed for the user to select, and the corresponding value must be picked.
- `ctl00_body_chkTop` (string, optional) — Top in Hierarchy flag. If provided as 'on', 'Next Upgrade Level' must NOT be passed.
- `ctl00_body_dpNextUpgrade` (string, optional) — Next Upgrade Level code (e.g., '000008'). This must be provided if 'Top in Hierarchy' is not 'on'. and user off to display the all next upgrade level detaisl for retrive the data for getUpdateCorporateTitleDetails api
- `ctl00_body_nuLevel` (integer, required) — Level number (e.g., 3).
- `ctl00_body_ManagePos` (string, optional) — Indicates whether it is a Managerial Position. on or off

