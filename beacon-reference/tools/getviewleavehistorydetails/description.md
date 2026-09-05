# getViewLeaveHistoryDetails

**Task:** Leave History Details

**Tags:** Absence Management, Headers

**Status:** live

## Description

Before generate View Leave History Details. ,first execute "employeeDetails" API should be called first, then execute by "employeeLogKey" API. Once both APIs have been successfully executed, the tool can then proceed to generate the leave history. The final result is presented in a tabular format. In cases where multiple employees are involved, the tool processes them sequentially—generating the leave history for the first employee, then proceeding to the second, and so on. This continues until the leave history details for all selected employees have been retrieved and displayed. 

## Signature

```
getViewLeaveHistoryDetails
```

## Arguments

- `year` (string, required) — user give which year leave year details get to give the year Example:"2025"


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
