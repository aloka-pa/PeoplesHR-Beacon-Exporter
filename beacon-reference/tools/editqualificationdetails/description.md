# editQualificationDetails

**Task:** Editing Qualification Details

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

This tool updates existing qualification records in the Qualifications module. It safely searches by qualification code or the name, opens the record, enters edit mode, and applies only the fields explicitly provided. 
Unchanged fields are preserved to prevent accidental data loss.
The user must provide either the code OR the name for each dropdown field (not both).
At least one update field must be provided along with one identification field.

## Signature

```
editQualificationDetails
```

## Arguments

- `qualificationCode` (string, optional) — he unique code identifier for the qualification to update (e.g., '000005')
- `qualificationName` (string, optional) — The current name of the qualification to search for and then to update (e.g., "Junior Prefect")
- `newQualificationName` (string, optional) — The new name for the qualification (e.g., "Junior Prefect 2018/2019")
- `ratingMethodCode` (string, optional) — The rating method code to assign (e.g., "000001")
- `ratingMethodName` (string, optional) — The rating method name to assign, alternative to ratingMethodCode (e.g., "Rating_01")
- `qualificationTypeCode` (string, optional) — The qualification type code to assign (e.g., "000008")
- `qualificationTypeName` (string, optional) — The qualification type name to assign, alternative to qualificationTypeCode (e.g., "leadership roles")
- `classificationCode` (string, optional) — The classification code to assign (e.g., "000006")

- `classificationName` (string, optional) — The classification name to assign, alternative to classificationCode (e.g., "Soft skills / Short term qualifications")
- `hasExpiration` (string, optional) —  Set expiration status, accepts string "true" or "false" (e.g., "true")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
