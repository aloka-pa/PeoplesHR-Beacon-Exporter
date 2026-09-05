# editExtraCurricularActivityType

**Task:** Editing Extra Curricular Activity Type Details

**Tags:** EIMAdmin, ExtraCurricularActivities

**Status:** live

## Description

Update an existing Extra Curricular Activity Type record by modifying its type name and/or category assignment. Only update the user-provided details; otherwise, remain unchanged.

## Signature

```
editExtraCurricularActivityType
```

## Arguments

- `ecaTypeCode` (string, optional) — The activity type code to identify the record to edit (e.g., "000001"). Either ecaTypeCode or ecaTypeName must be provided.
- `ecaTypeName` (string, optional) — The activity type name to identify the record to edit (e.g., "Learning"). Either ecaTypeCode or ecaTypeName must be provided.
- `newTypeName` (string, optional) — The new name for the activity type. If not provided, the type name will remain unchanged. Maximum 120 characters.
- `newCategoryCode` (string, optional) — The code of the new category to assign (e.g., "000003" for "Arts / Creative"). The user must provide either newCategoryCode or newCategoryName.
- `newCategoryName` (string, optional) — The name of the new category to assign (e.g., "Arts / Creative"). The user must provide either newCategoryCode or newCategoryName.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
