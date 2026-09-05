# createExtraCurricularActivityType

**Task:** Creating New Extra Curricular Activity Type Record

**Tags:** EIMAdmin, ExtraCurricularActivities

**Status:** live

## Description

Creates a new Extra Curricular Activity Type record with a specified name and category assignment.

## Signature

```
createExtraCurricularActivityType
```

## Arguments

- `typeName` (string, required) — The name of the activity type to create (e.g., "Theatre / Drama / Stage performances"). Maximum 120 characters.
- `categoryCode` (string, optional) — The code of the category to assign (e.g., "000003" for "Arts / Creative"). Either categoryCode or categoryName must be provided.
- `categoryName` (string, optional) — The name of the category to assign (e.g., "Arts / Creative"). Either categoryCode or categoryName must be provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
