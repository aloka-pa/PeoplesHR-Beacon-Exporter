# getGNDivision

**Task:** Fetching GN Divisions

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Searches GN Divisions in EIM/GNDivision.aspx by GN Division code, GN Division name, or DS Division name. Supports partial, case-insensitive matching for name-based searches and can return all existing GN Divisions using the Show All action. When exactly one record is found, it can optionally open the record to fetch detailed fields, including dsDivisionCode and the resolved DS division name from the dropdown.

## Signature

```
getGNDivision
```

## Arguments

- `gnDivisionCode` (string, optional) — The unique code of the GN Division to search for (e.g., '000001'). Performs exact match search. Either gnDivisionCode or gnDivisionName must be provided.
- `gnDivisionName` (string, optional) — The name of the GN Division to search for (e.g., 'Warahanthuduwa'). Performs partial, case-insensitive match search. Either gnDivisionCode or gnDivisionName must be provided.
- `fetchDetails` (string, optional) — Controls whether to fetch detailed information when only one result is found. Set to 'no' to skip detailed fetch and return only basic search results. Default behavior fetches details, including dsDivisionCode.
- `dsDivisionName` (string, optional) — DS Division name (partial match, case-insensitive). Uses criteria value D.DSDIV_NAME. (optional)
- `returnAll` (string, optional) — "yes" to return all GN Divisions (clicks Show All).
Also auto-triggers if any provided search value equals: "all", "available", "existing", "list", "show all".


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
