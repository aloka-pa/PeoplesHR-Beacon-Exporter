# updateSelfEmployeeWorkExperienceDetails

**Task:** Update The Self Employee Work Experience Details

**Tags:** Employee Information, Headers

**Status:** live

## Description

Before calling the updateSelfEmployeeWorkExperienceDetails API, first fetch existing data using the selfEmployeeWorkExperienceDetails API. When updating, only replace the fields modified by the user, while retaining the unchanged values from the previously fetched work experience details.

## Signature

```
updateSelfEmployeeWorkExperienceDetails
```

## Arguments

_None._


## Advanced arguments

- `WorkExperienceRecords` (array, required) — Array of work experience records. All fields are required. If any value is missing during update, the system should use existing values from previously fetched records.


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
