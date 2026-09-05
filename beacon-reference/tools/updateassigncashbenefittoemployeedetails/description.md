# UpdateAssignCashBenefitToEmployeeDetails

**Task:** Update Assign Cash Benefit To Employee Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

To update the "Assign Cash Benefit to Employee" details, first execute the getAssignCashBenefitToEmployeeDetails tool. Then, retrieve the assigned benefit name provided by the user and find its corresponding editId in the format ctl00$body$grdallocated$ctlXX$ctl00. if the user manually update the amount to take update amount or date if the user missing that field to get the amount or date of the benefit. example amount to get "GHS 51.00" convert into '51'. if the user ask update related query for assign cash benefit do not ask for order number only order number applicable for "bank details" tool.

## Signature

```
UpdateAssignCashBenefitToEmployeeDetails
```

## Arguments

_None._


## Advanced arguments

- `id` (string, required) — to give the user for employee id '000001'
- `editId` (string, required) — to get the edit id for 'getAssignCashBenefitToEmployeeDetails' api example id:-'ctl00$body$grdallocated$ctl06$ctl00'
- `updateDate` (string, required) — to give the update date format dd/mm/yyyy. and before take the date, execute the date format api the get the date format.
- `updateAmount` (string, required) — to give the update ammount Example '1000' etc.. if the user not update ammount to get current assign amount will be take.


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
