# updatethePriorOvertimeApplication

**Task:** updatingPriorOvertimeApplication

**Tags:** Attendance, Headers

**Status:** live

## Description

Before calling updatePriorOvertimeApplication, you must first call the "getPriorOvertimeApplicationDetails" API. Only update the dates that are available in the GET API response and that the user has specifically requested to modify. If the requested dates are not available in the GET API response, do not proceed with the update.Do not show the end user the internal processing steps or explanations of what the system is doing.When a user updates multiple records, the system should prompt for all required fields for each date record before proceeding

## Signature

```
updatethePriorOvertimeApplication
```

## Arguments

_None._


## Advanced arguments

- `updatePriorOvertimeApplication` (array, required) — When a user updates multiple records, the system should prompt for all required fields for each date record before proceeding. This array contains objects for an intelligent overtime application processing system that uses AI-driven validation to ensure policy compliance and accurate time tracking, If the user updates multiple dates, you must ask for Pre OT and Post OT values for each individual date. Each date represents one record, so for bulk date updates, prompt the user to provide Pre OT and Post OT for every single date.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
