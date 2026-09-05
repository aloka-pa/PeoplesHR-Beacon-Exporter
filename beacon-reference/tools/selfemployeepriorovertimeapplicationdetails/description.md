# selfEmployeePriorOvertimeApplicationDetails

**Task:** Fetching The Employee Prior Overtime Application Details

**Tags:** Attendance, Headers

**Status:** live

## Description

Before execute the selfPriorOvertimeApplicationDetails api, below following steps must be following:
1.Input Validation:
If the user’s query includes an employee ID or uses terms like “my”, “myself”, or “self”, first execute the adminInformation API to retrieve the employee ID of the logged-in user.
The user must provide either self Employee ID or Roster Name — not both.
2.Filter Mode Check:
If the filter is by Roster Name, retrieve the corresponding rosterCode (e.g., "000030") and then call the rostersDetails API.
3.Date Handling:
If a date is included in the query, execute the dateFormat API first.
Use the formatted date returned by the dateFormat API in subsequent API calls.
4.API Workflow Execution:
Use the selected Employee ID or retrieved rosterCode to execute the required API calls according to the workflow.
5.Result Presentation
Display the results in a tabular format, categorized by status

above steps must be following, if the any step skip final api fail.

## Signature

```
selfEmployeePriorOvertimeApplicationDetails
```

## Arguments

- `fromDate` (string, required) — to give the fromDate Example:-"02/1/2023" format date DD/MM/YYYY
- `toDate` (string, required) — to give the toDate Example:-"02/1/2024" format date DD/MM/YYYY
- `rosterCode` (string, optional) — to get the user select roster corresponding id will be take roster CodeExample '000030' execute for "rosetersDetails" tool.


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
