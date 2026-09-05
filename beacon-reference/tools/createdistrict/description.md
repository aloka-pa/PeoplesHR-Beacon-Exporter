# createDistrict

**Task:** Creating New District Record

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Creates a new District record in EIM → District. The tool opens the “New” form, fills mandatory fields (District Name and Province), and saves the record.
Return all matching provinces and ask which province user would assign to the new district record.

## Signature

```
createDistrict
```

## Arguments

- `districtName` (string, required) — name of the district to create
- `provinceCode` (string, optional) — Province code to select (recommended). Maps to ctl00$body$dpcountry. Example: "000087".
- `provinceName` (string, optional) — Province name to select (fallback if code not provided). Tool matches option text (case-insensitive, contains).
- `openFromSearch` (string, optional) — "true" / "false" (default "false"). If "true", loads a Search context first, then clicks New.
- `searchDistrictName` (string, optional) — Used only when openFromSearch="true" to prefill search text.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
