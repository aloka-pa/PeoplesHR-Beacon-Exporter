# editProvince

**Task:** Editing Province Details

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Searches a Province record in PeopleHR EIM by province code (exact) or province name (partial, case-insensitive), opens the record, switches to Edit mode, and updates the Province Name and/or Country.
Only fields provided by the user are changed; any missing fields remain unchanged. Returns a structured response with status and the updated values.

## Signature

```
editProvince
```

## Arguments

- `provinceCode` (string, optional) — Province code to search by exact match (e.g., "000005").
If provided, it takes priority over provinceName.
- `provinceName` (string, optional) — Province name to search by partial match, case-insensitive (e.g., "magui" matches "Maguindanao").
Returns the first match for editing, and includes all matches in the response for visibility.
- `newProvinceName` (string, optional) — New province name to set.
If not provided (or empty), the existing name remains unchanged.
- `country` (string, optional) — Country to assign to the Province. Accepts either: a 6-digit country code (e.g., "000175"), or an exact country name as shown in the dropdown (case-insensitive match).
If not provided (or empty), the existing country remains unchanged.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
