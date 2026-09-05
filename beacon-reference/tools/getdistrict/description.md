# getDistrict

**Task:** Fetching Districts

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Fetches District master records from PeoplesHR EIM → District screen. Supports: Exact lookup by District Code. Partial search by District Name or Province Name. Show All listing with pagination
Returns matched rows from the grid (and for searches, can automatically collect matches across all pages).

If districtCode is provided → exact match search (returns only that matching row if exists).
If districtName or provinceName is provided → partial match search and returns all matching rows across all pages.
If returnAll indicates “show all/list/available/existing” → Show All mode with pagination.

## Signature

```
getDistrict
```

## Arguments

- `districtCode` (string, optional) — District code to search (exact match). Example: "000153"
- `districtName` (string, optional) — District name to search (partial match). Example: "alt"
- `provinceName` (string, optional) — Province name to search (partial match). Example: "Aklan"
- `returnAll` (string, optional) — If user asks show all/list/available/existing, set this to that phrase. Triggers Show All mode.
- `page` (string, optional) — For Show All mode only. Page number to fetch (default 1).
- `pageSize` (string, optional) — Page size (defaults to 10 to match UI). Keep as 10 unless needed.
- `maxPages` (string, optional) — Safety limit when auto-collecting search results across pages (default 50).


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
