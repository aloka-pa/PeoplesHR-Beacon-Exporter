# editGNDivision

**Task:** Editing GN Division Details

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Edit an existing GN Division record. Only change the record that the user asked to edit. Do not change any other record.
If both gnDivisionCode and gnDivisionName are provided, gnDivisionCode takes priority

## Signature

```
editGNDivision
```

## Arguments

- `gnDivisionCode` (string, required) — The unique code of the GN Division to edit (e.g., '000001'). Performs exact match search. Either gnDivisionCode or gnDivisionName must be provided to identify the record.
- `gnDivisionName` (string, required) — The name of the GN Division to edit (e.g., 'Warahanthuduwa'). Performs exact match search. Either gnDivisionCode or gnDivisionName must be provided to identify the record.
- `newGNDivisionName` (string, optional) — The new name for the GN Division (e.g., 'Warahanthuduwa South'). If not provided, the existing name will be retained.
- `dsDivisionCode` (string, optional) — The DS Division code to assign to this GN Division (e.g., '000014'). Direct code value from the dropdown. Either dsDivisionCode or dsDivisionName can be provided. If neither is provided, the existing DS Division will be retained.
- `dsDivisionName` (string, optional) — The DS Division name to assign to the GN Division. Will be looked up in the dropdown to find the corresponding code. Either dsDivisionCode or dsDivisionName can be provided. If neither is provided, the existing DS Division will be retained.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
