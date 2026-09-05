# getTeamShiftAdjustmentDetails

**Task:** Fetching Team Shift Adjustment Details

**Tags:** Attendance, Headers

**Status:** live

## Description

To generate the Team shift Adjustment In And Out Details using this tool, it is crucial to first cross-check the provided employee ID by executing the "getPaginatedTypeaheadList" API. If the search returns multiple employee records, display the corresponding employee names for the user to accurately select the intended employee. Only the selected employee’s ID will be used for further processing. Once the correct employee ID is verified, proceed to the next step by using this ID to execute the relevant API calls within the tool, following the specified workflow. This step-by-step approach ensures accurate and reliable retrieval of the employee's benefit history. and give response is table format.Analyze the user's query, and if it includes any reference or filter to subordinates, return the data under the "Subordinates" key. if the user subordinates related query dont ask for employee id or name only ask for date range. Always maintain the date format as "YYYY-MM-DD"

## Signature

```
getTeamShiftAdjustmentDetails
```

## Arguments

- `id` (string, required) — to get the employee id for "getPaginatedTypeaheadList" api. Example:-"000006" or "00001" etc...
- `fromDate` (string, required) — to give the fromDate Example:-"2025-05-31" format date "YYYY-MM-DD"
- `toDate` (string, required) — to give the toDate Example:-"2025-06-06" format date "YYYY-MM-DD"
- `filterMode` (string, optional) — Analyze the user's query, and if it includes any reference to subordinates, return the data under the "Subordinates" key. and in this key field is user query related required or not to anayze to get filter mode.


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
