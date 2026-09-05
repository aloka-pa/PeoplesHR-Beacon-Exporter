# createEmployeeCoveringDetails

**Task:** Added New Covering Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

This tool is used to create or add covering employee details.To validate this, execute the "getCoveringDetails"api to retrieve the latest covering data. then Begin by executing the "subGroupLevelDetails" tool to retrieve the required reference values. After fetching these, proceed with the remaining steps. The user must provide an effective start date and end date for the covering period, which should come after the most recently recorded period. The new effective from and to dates must be later than the previous effective from date—if not, the update should be halted. While creating the covering details, first display the personal grade and group level to the user. Once selections are made, call the "positionTitle" tool to show all matching position titles and subgroup levels. Finally, prompt the user to enter the effective dates. and ai not auto filling fields this secure reasion user proced action then you will proced. date format must execute to get the format date example "22/10/2025" - "dd/mm/yyyy".

## Signature

```
createEmployeeCoveringDetails
```

## Arguments

- `id` (string, required) — to give the employee id Example:- "000001" etc...
- `personalGradeValue` (string, required) — in this personal Grade Value to get for user selected personal grade name corresponding value will be take "GCB Grade 05" corresponding value "000004"
- `groupLevelValue` (string, required) — in this group value to get for user selected group level name corresponding value will be take example "beacon class 02" corresponding value "000001"
- `positionTitleValue` (string, required) — in this position Title Value to get for user selected position Title name corresponding value will be take example "asdfg" corresponding value "000001"
- `subGroupLevelValue` (string, required) — in this sub Group Level Value to get for user selected position sub Group Level name corresponding value will be take example "beacon text book" corresponding value "000001"
- `effectFromDate` (string, required) — to give effect from date example format  "22/10/2025" - "dd/mm/yyyy" from date must be feature date.

- `effectToDate` (string, required) — to give effect to date example format  "22/10/2025" - "dd/mm/yyyy" and to date is greater then from date
- `remarks` (string, optional) — remark is optional field if user file get the value dont ask the user for remarks field this is optional.


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
