# editDistrict

**Task:** Editing District Information

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Edits an existing District in EIM → District. The tool searches the grid (by code exact or name/province partial), opens the record using the grid edit icon, enters edit mode, updates District Name and/or Province, and saves the changes. Only change the record that the user asked to edit. Do not change any other record.

Must provide (districtCode OR districtName) to identify a record.
Must provide at least one update field: newDistrictName and/or (newProvinceCode or newProvinceName).

## Signature

```
editDistrict
```

## Arguments

- `districtCode` (string, optional) — District code to locate the record (exact match). Recommended.
- `districtName` (string, optional) — District name to locate the record (partial match). Used if code not provided.
- `newDistrictName` (string, optional) — user-provided new district name
- `provinceCode` (string, optional) — user-provided province code (e.g.: 000002)
- `provinceName` (string, optional) — Province name to narrow down the search (partial match). Optional.
If both provinceCode and provinceName are provided, provinceCode takes priority
- `newDistrictName` (string, optional) — New district name to set in ctl00$body$txtName.
- `newProvinceCode` (string, optional) — New province code to select in ctl00$body$dpcountry (preferred for reliability). Example: "000001".
- `newProvinceName` (string, optional) — Province name to select (tool will find matching <option> by text, case-insensitive). Use if you don’t know the code.
- `maxPages` (string, optional) — Safety limit while scanning pages to find the record (default: 75).


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
