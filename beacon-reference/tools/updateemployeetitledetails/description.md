# updateEmployeeTitleDetails

**Task:** Update Employee Title Details

**Tags:** EIM, Headers

**Status:** live

## Description

To update employee title details, begin by executing the "getEIMAttributeList" API to fetch the current data. If any required input fields are missing, populate them using the API response. For the gender field, use the appropriate value: 0 for Female, 1 for Male, and 2 for Other. If updating marital status, map each option to its corresponding key as follows: "Undisclosed" – ctl00$body$chkMaritalStatus$0, "Unmarried" – chkMaritalStatus$1, "Married" – chkMaritalStatus$2, "Divorced" – chkMaritalStatus$3, "Others" – chkMaritalStatus$4, "Solo Parent" – chkMaritalStatus$5, "Single" – chkMaritalStatus$6, and "It Is Complicated" – chkMaritalStatus$7. This ensures accurate mapping and submission of user selections.
If the user requests an update to the "Employee Title" field, them that it is a hidden field and cannot be modified. However, all other fields like gender validate, marital status can be updated as needed.

## Signature

```
updateEmployeeTitleDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_chkGenderValid` (string, required) — Checkbox indicating whether gender validation is enabled.
- `ctl00_body_cboGender` (string, required) — Selected gender value (0: Female, 1: Male, 2: Other).
- `ctl00_body_chkMaritalStatus_0` (string, required) — Undisclosed marital status selected.
- `ctl00_body_chkMaritalStatus_1` (string, required) — Unmarried marital status selected.
- `ctl00_body_chkMaritalStatus_2` (string, required) — Married marital status selected.
- `ctl00_body_chkMaritalStatus_3` (string, required) — Divorced marital status selected.
- `ctl00_body_chkMaritalStatus_4` (string, required) — Others marital status selected.
- `ctl00_body_chkMaritalStatus_5` (string, required) — Solo Parent marital status selected.
- `ctl00_body_chkMaritalStatus_6` (string, required) — Single marital status selected.
- `ctl00_body_chkMaritalStatus_7` (string, required) — It Is Complicated marital status selected.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
