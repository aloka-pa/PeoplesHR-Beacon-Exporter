# getDSDivision

**Task:** Fetching DS Divisions

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Searches DS Divisions in EIM/DSDivision.aspx by Code, DS Division name, or District name. Supports partial, case-insensitive matching for name/district, and can return all existing DS Divisions using the screen’s Show All action. Optionally opens a single matched record to fetch districtCode and resolve the district name from the dropdown.

## Signature

```
getDSDivision
```

## Arguments

- `dsDivisionCode` (string, required) — DS Division code to search for (exact match) (optional)
- `dsDivisionName` (string, required) — DS Division name to search for (partial match, case-insensitive) (optional)
- `fetchDetails` (string, optional) — Whether to fetch detailed information (including district code) when a single DS Division is found. Accepts "yes" or "no". Defaults to "yes". Set to "no" to skip the detail fetch and return only grid data. (optional)
- `districtName` (string, optional) — District name (partial match, case-insensitive). Uses criteria value D.DISTRICT_NAME. (optional)
- `returnAll` (string, optional) — "yes" to return all DS Divisions (clicks Show All).
Also auto-triggers if any search value is one of: "all", "available", "existing", "list", "show all".
- `pageSize` (string, optional) — If you want to set the initial page size for the first search request. The tool will still adapt to the UI page size after the first response.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
