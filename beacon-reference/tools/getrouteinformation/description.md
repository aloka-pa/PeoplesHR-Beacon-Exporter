# getRouteInformation

**Task:** Fetching Route Information

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Retrieves Route Information records from EIM → Route Information (RoutInfo.aspx).
The user can search routes by route code (exact match) or route name (partial match). If the user requests a full list (e.g., “show all routes,” “return all,” “list available routes,” or "what are the existing routes"), the tool triggers the Show All action and returns all available Route records from the results grid.

## Signature

```
getRouteInformation
```

## Arguments

- `routeCode` (string, optional) — Route code to search for (e.g., "000001"). Searches by RT_ID (exact match).
Example: "000003"
- `routeName` (string, optional) — Route name (or partial name) to search for (e.g., "Expressway", "Central"). Searches by RT_NAME and supports partial match.
Example: "Express"
- `returnAll` (string, optional) — When user asks to return all/available/existing routes, set this to one of:
"true", "yes", "all", "1", "showall", "returnall", "available", "existing", "list".
Triggers Show All (ctl00$body$ContentSearch$butAll) and returns every grid row.
- `pageNumber` (string, optional) — Specific page number to fetch when not auto-fetching all pages. Default = "1".
- `pageSize` (string, optional) — Number of records per page to request from grid. Server may cap this. Default = "100".
- `autoFetchAllPages` (string, optional) — Controls whether transformer automatically loops through all pages. Defaults to true when returnAll is used.
- `maxPages` (string, optional) — Safety limit to prevent infinite paging loops. Default "50".


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
