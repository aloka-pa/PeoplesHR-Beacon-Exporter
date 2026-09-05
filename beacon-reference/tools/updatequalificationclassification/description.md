# updateQualificationClassification

**Task:** Editing Qualification Classification Details

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Begin by executing "getQualificationClassification" to retrieve the existing record. Use this response as the source of truth. When performing the update, modify only the fields explicitly provided by the user and keep all other fields exactly as they are in the retrieved data. Do not overwrite, nullify, or alter any unspecified fields, and proceed with the update only after confirming that the existing record was successfully fetched.


## Signature

```
updateQualificationClassification
```

## Arguments

- `classificationCode` (string, required) — the code to search for
- `classificationName` (string, optional) — updated classification name (optional)
- `rank` (string, optional) — new rank (optional)


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
