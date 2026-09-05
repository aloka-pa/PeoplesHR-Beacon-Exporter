# createProvince

**Task:** Creating New Province Record

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Creates a Province record in EIM/Province.aspx by opening the “New” form, resolving the selected Country (by code or name), and saving the record. Supports country name resolution with case-insensitive matching and helpful suggestions when multiple matches are found. Returns the created record details by verifying through grid search.

## Signature

```
createProvince
```

## Arguments

- `provinceName` (string, required) — Province name to create (e.g., "test prov"). Trimmed before save. Must not be empty.
- `country` (string, required) — Country to assign to the province.
Accepts 6-digit country code or country name ("United States"). Matching is case-insensitive. If a non-code name is provided, the tool tries exact match, then partial match; returns suggestions if ambiguous.
- `anseliCode` (string, optional) — Reference code / anseli code if the screen supports it (maps to ctl00$body$txtrefcode).
If not provided, sends empty.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
