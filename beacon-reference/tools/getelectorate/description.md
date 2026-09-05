# getElectorate

**Task:** Fetching Electorates

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Searches Electorates in EIM/Electorate.aspx by electorate code, electorate name, or district name. Name/district searches use partial, case-insensitive matching and return all matching rows from the grid. Also supports returning all existing electorates via the screen’s Show All action when the user requests “all / available / existing / list”. If exactly one match is found, the tool opens the record and returns detailed fields.

## Signature

```
getElectorate
```

## Arguments

- `electorateCode` (string, optional) — The electorate code to search for (e.g.: "000002")
- `electorateName` (string, optional) — The electorate name to search for (e.g.: "hSenid")
- `districtName` (string, optional) — District name to search for. Uses criteria D.DISTRICT_NAME. Partial match, case-insensitive.
- `returnAll` (string, optional) — "yes" to return all electorates (uses Show All).
Also auto-triggers when electorateCode / electorateName / districtName is: "all", "available", "existing", "list", "show all".
- `fetchDetails` (string, optional) — "yes" / "no" (default "yes").
If exactly 1 result and "yes", opens record and returns detailed values.
- `pageSize` (string, optional) — Page size used during initial grid load/search (example: "10", "50").
The tool will still adapt to UI page size after the first response.
- `matchMode` (string, optional) — Name matching behavior when searching by electorateName or districtName:
"contains" (default) → partial match
"exact" → exact match only


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
