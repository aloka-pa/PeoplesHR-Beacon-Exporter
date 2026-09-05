# editSubjectDetails

**Task:** Editing Subject Details

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Updates a subject record. Searches for a subject by code or subject name, opens the record, enters edit mode, and saves the updated values.
The user must provide either subjectCode OR subjectName to identify the record.
The user must provide at least one update field (newSubjectName, qualificationCode, or qualificationName)
Both update fields are optional - only fields the user provides will be changed
For qualification, the user can use either qualificationCode or qualificationName (not both)

## Signature

```
editSubjectDetails
```

## Arguments

- `subjectCode` (string, optional) — The unique subject code to identify which record to update (e.g., "000001", "000008")
- `subjectName` (string, optional) — The subject name or partial name to idenstify which record to update (e.g., "Physics", "Big Data", "OOP")
- `newSubjectName` (string, optional) — The new name for the subject (e.g., "Advanced Physics", "Introduction to Programming")
- `qualificationCode` (string, optional) — The qualification code (6-digit, e.g., "000004") or qualification name (e.g., "G C E Advanced Level Examination 2022") to associate with this subject
- `qualificationName` (string, optional) — The qualification name to associate with this subject (e.g., "BSc (Hons) Computer Science")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
