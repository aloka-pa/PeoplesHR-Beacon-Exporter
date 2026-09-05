# createSubjectDetails

**Task:** Creating New Subject Record

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Creates a new subject record. Requires subject name and qualification (either qualification code or name). The subject name must be unique. Qualification names support partial matching (case-insensitive).

## Signature

```
createSubjectDetails
```

## Arguments

- `subjectName` (string, optional) — The name of the subject to create (e.g.: "Trigonometry")
- `qualificationCode` (string, optional) — the 6-digit qualification code (e.g., '000008'). 
- `qualificationName` (string, optional) — The full or partial name of the qualification (e.g., 'BSc', 'Computer Science', 'hons comp sci'). Case-insensitive partial match. Either qualificationCode or qualificationName must be provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
