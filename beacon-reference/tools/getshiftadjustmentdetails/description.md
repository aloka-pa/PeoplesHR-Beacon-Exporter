# getShiftAdjustmentDetails

**Task:** Fetching the Shift Adjustment Details

**Tags:** Attendance, Headers

**Status:** live

## Description

Before executing the Shift Adjustment Details process, the agent must follow these steps:
The user must filter by either Employee ID or Roster Name—only one can be provided.
If Employee ID is entered, execute the 'getPaginatedTypeaheadList' API to retrieve matching employees.display a list for the user to select the correct employee. Use the selected ID for then next must and should be execute 'getShiftAdjustmentDetails' api to return shift details.
If Roster Name is provided instead, retrieve the corresponding rosterCode (e.g., “000030”) and execute the rostersDetails API. When a date is specified, display the results in a tabular format. The date format must follow YYYY-MM-DD (e.g., “2025-05-30”).
Finally, execute the 'getShiftAdjustmentDetails' API. The My Manual In & Out API or selfEmployeeManualInAndOutDetails must not be executed under any circumstance.
Note : reasons no need display, only if the user change or update then return reasons display.

## Signature

```
getShiftAdjustmentDetails
```

## Arguments

- `id` (string, required) — to get the employee id for "getPaginatedTypeaheadList" api. Example:-"000006" or "00001" etc...
- `fromDate` (string, required) — to give the fromDate Example:-"2025-05-30" format date "YYYY-MM-DD"
- `toDate` (string, required) — to give the toDate Example:-"2025-05-30" format date "YYYY-MM-DD"
- `rosterCode` (string, optional) — to get the user select roster corresponding id will be take roster CodeExample '000030' execute for "rosetersDetails" tool.


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
