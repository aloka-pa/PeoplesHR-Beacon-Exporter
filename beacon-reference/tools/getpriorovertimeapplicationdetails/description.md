# getPriorOvertimeApplicationDetails

**Task:** Fetching Prior Overtime Application Details

**Tags:** Attendance, Headers

**Status:** live

## Description

To generate prior overtime application details using this tool, the user must filter by either "Employee ID" or "Roster Name". If "Employee ID" is provided, it must first be validated using the "getPaginatedTypeaheadList" API. If multiple matches are found, a list of employee names should be shown for the user to select the correct one. The selected ID is then used to execute the required API calls as per the workflow. If "Roster Name" is provided instead, the corresponding "rosterCode" (e.g., "000030") must be retrieved and used to call the "rostersDetails" API. If a date is included, it must first be formatted using the "dateFormat" API before being used in any other API calls. Results should be displayed in a tabular format categorized by status like "Approved", "Pending", or "Unsubmitted". The user must provide either "Employee ID" or "Roster Name"—not both—as input to proceed with the query. to get the date format must and should be execute date format api, then format will be take.

## Signature

```
getPriorOvertimeApplicationDetails
```

## Arguments

- `id` (string, required) — to get the employee id for "getPaginatedTypeaheadList" api. Example:-"000006" or "00001" etc...
- `fromDate` (string, required) — to give the fromDate Example:-"02/1/2023" format date DD/MM/YYYY
- `toDate` (string, required) — to give the toDate Example:-"02/1/2024" format date DD/MM/YYYY
- `rosterCode` (string, optional) — to get the user select roster corresponding id will be take roster CodeExample '000030' execute for "rosetersDetails" tool.


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
