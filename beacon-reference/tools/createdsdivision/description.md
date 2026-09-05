# createDSDivision

**Task:** Creating New DS Division Record

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

create a new DS Division record

## Signature

```
createDSDivision
```

## Arguments

- `dsDivisionName` (string, required) — The name of the DS Division to create.
- `district` (string, required) — The district code or name to assign to the DS Division. Can be either a 6-digit code (e.g., "001690") or a district name (e.g., "Kandy"). Either district or districtName must be provided.
- `districtName` (string, optional) — The district name to assign to the DS Division. The system will look up the corresponding code from the dropdown (case-insensitive exact match). Either district or districtName must be provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
