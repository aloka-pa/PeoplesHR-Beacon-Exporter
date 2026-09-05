# createQualificationDetails

**Task:** Creating New Qualification Record

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Creates a new qualification record in the system with name, rating method, qualification type, classification, and expiration status.

## Signature

```
createQualificationDetails
```

## Arguments

- `qualificationName` (string, required) — The name of the new qualification (e.g., "Batch rep")
- `ratingMethodCode` (string, optional) — The rating method code to assign (e.g., "000001")

- `ratingMethodName` (string, optional) — The rating method name to assign, alternative to ratingMethodCode (e.g., "Rating_01")
Note: the user must provide either ratingMethodCode OR ratingMethodName (not both)
- `qualificationTypeCode` (string, optional) — The qualification type code to assign (e.g., "000008")
- `qualificationTypeName` (string, optional) — The qualification type name to assign, alternative to qualificationTypeCode (e.g., "leadership roles")
Note: the user must provide either qualificationTypeCode OR qualificationTypeName (not both)
- `classificationCode` (string, optional) — The classification code to assign (e.g., "000006")
- `classificationName` (string, optional) — The classification name to assign, alternative to classificationCode (e.g., "Soft skills")
Note: the user must provide either classificationCode OR classificationName (not both)
- `hasExpiration` (string, optional) — Set expiration status, accepts string "true" or "false" (default: "false")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
