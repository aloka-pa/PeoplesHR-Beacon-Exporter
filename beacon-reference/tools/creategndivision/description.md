# createGNDivision

**Task:** Creating New GN Division Record

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

create a new GN Division record

## Signature

```
createGNDivision
```

## Arguments

- `gnDivisionName` (string, required) — The name for the new GN Division (e.g., 'Dahampura'). This field is required and cannot be empty.
- `dsDivision` (string, required) — The DS Division code or name to assign to this GN Division. Can be either a 6-digit code (e.g., '000005') or a DS Division name (e.g., 'Moratuwa'). Either dsDivision or dsDivisionName must be provided.
- `dsDivisionName` (string, required) — The DS Division name to assign to this GN Division (e.g., 'Moratuwa'). Performs a case-insensitive exact match to find the corresponding code. Either dsDivision or dsDivisionName must be provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
