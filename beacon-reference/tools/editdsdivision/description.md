# editDSDivision

**Task:** Editing DS Division Details

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Edit an existing DS Division record. Only change the record that the user asked to edit. Do not change any other record.
If both dsDivisionCode and dsDivisionName are provided, dsDivisionCode takes priority

## Signature

```
editDSDivision
```

## Arguments

- `dsDivisionCode` (string, required) — The DS Division code to identify the record to edit. Either dsDivisionCode or dsDivisionName must be provided.
- `dsDivisionName` (string, required) — The DS Division name to identify the record to edit. Either dsDivisionCode or dsDivisionName must be provided.
- `newDSDivisionName` (string, optional) — The new name for the DS Division. If not provided, the current name remains unchanged.
- `districtCode` (string, optional) — The district code to assign to the DS Division. If not provided, the current district remains unchanged.
- `districtName` (string, optional) — The district name to assign to the DS Division. The system will look up the corresponding code from the dropdown (case-insensitive exact match). If not provided, the current district remains unchanged.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
