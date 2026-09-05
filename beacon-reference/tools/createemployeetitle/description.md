# createEmployeeTitle

**Task:** Create Employee Title

**Status:** unlive

## Description

To create an employee title, the only required field is "ctl00$body$txtName" (Employee Title). All other fields—such as gender and marital status—are optional and should only be processed if provided by the user. For gender, use the corresponding value: 0 for Female, 1 for Male, and 2 for Other. If marital status is included, map each selected status to its appropriate key: "Undisclosed" – ctl00$body$chkMaritalStatus$0, "Others" – chkMaritalStatus$4, "Unmarried" – chkMaritalStatus$1, "Solo Parent" – chkMaritalStatus$5, "Married" – chkMaritalStatus$2, "Single" – chkMaritalStatus$6, "Divorced" – chkMaritalStatus$3, and "It Is Complicated" – chkMaritalStatus$7. This ensures that only the relevant data is applied, and each user input is accurately mapped and submitted.

## Signature

```
createEmployeeTitle
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — name of the employee title for example:'Mr.,Ms. etc..'.
- `ctl00_body_chkGenderValid` (string, optional) — Checkbox indicating whether gender validation is enabled.
- `ctl00_body_cboGender` (string, optional) — Selected gender value (0: Female, 1: Male, 2: Other).
- `ctl00_body_chkMaritalStatus_0` (string, optional) — Undisclosed marital status selected.
- `ctl00_body_chkMaritalStatus_1` (string, optional) — Unmarried marital status selected.
- `ctl00_body_chkMaritalStatus_2` (string, optional) — Married marital status selected.
- `ctl00_body_chkMaritalStatus_3` (string, optional) — Divorced marital status selected.
- `ctl00_body_chkMaritalStatus_4` (string, optional) — Others marital status selected.
- `ctl00_body_chkMaritalStatus_5` (string, optional) — Solo Parent marital status selected.
- `ctl00_body_chkMaritalStatus_6` (string, optional) — Single marital status selected.
- `ctl00_body_chkMaritalStatus_7` (string, optional) — It Is Complicated marital status selected.

