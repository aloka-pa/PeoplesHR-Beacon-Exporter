# editQualificationType

**Task:** Editing Qualification Type Details

**Tags:** EIMAdmin, QualificationInformation, Phase1, BugResolved

**Status:** live

## Description

Edits an EIM Qualification Type record by searching with a qualification type code or name, opening the matched row, switching to Edit mode, and saving the updated Qualification Type name. Supports partial name search; returns all matches if multiple.

## Signature

```
editQualificationType
```

## Arguments

- `qualificationTypeCode` (string, optional) — Qualification Type code to identify the record (e.g., 000002). If provided, search will be performed by code and the exact matching row will be opened.
- `qualificationTypeName` (string, optional) — Qualification Type name to identify the record (supports partial match, case-insensitive). If multiple records match, the transformer returns the matching list and does not edit.
- `newQualificationTypeName` (string, required) — New Qualification Type name to save in the record. Required when a single record is matched and you want to update it.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
