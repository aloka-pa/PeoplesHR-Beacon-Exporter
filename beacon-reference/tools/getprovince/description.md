# getProvince

**Task:** Fetching Provinces

**Tags:** EIMAdmin, GeographicalLocations, phase2

**Status:** live

## Description

Get provinces (search + show all with paging)
Description: Searches provinces by code or name (supports partial name match and returns all matching rows). Also supports listing provinces using “Show All” with pagination (returns up to 40 per call and provides the next page number when more results exist).
Use partial match when the user gives a keyword (like “southern”, “north”, “island”)
Use exact match only when the user gives the full province name or an exact code
If multiple matches are found, list them and ask the user to pick one

## Signature

```
getProvince
```

## Arguments

- `provinceCode` (string, optional) — Province code to search (e.g., "000085"). Exact match.
- `provinceName` (string, optional) — Province name to search (e.g., "Sabarag"). Partial match, case-insensitive.
- `returnAll` (string, optional) — If set to something like "yes", "true", "all", "list", "available", "existing", etc., the transformer will return a paginated list of provinces (40 per call).
- `pageToken` (string, optional) — Internal paging token returned by the previous call (Option B). If provided, the transformer fetches the next page of 40 from the grid.
- `mode` (string, optional) — "search" default
"showAll" for pagination listing
- `page` (string, optional) — used only for mode="showAll"
- `pageSize` (string, optional) — (optional, fixed internally to 40 to meet requirement)
- `matchType` (string, optional) — "partial" default for name

"exact" for code (and optionally name if needed)


## Advanced arguments

_None._

