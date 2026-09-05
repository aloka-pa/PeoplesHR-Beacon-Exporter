# getStationInformation

**Task:** Fetching Station Information

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

This tool retrieves Station Information records from the EIM → Station Information screen. It supports searching stations by station code (exact match), station name (partial match), transport cost (exact string match), or route name (partial match). It also supports a returnAll string flag to fetch all available station records across all RadGrid pages, ensuring results are not limited to the first page. When required, the tool can operate in a page-by-page mode and guide the user to request the next page if additional results exist.

## Signature

```
getStationInformation
```

## Arguments

- `stationCode` (string, optional) — When the user provides a station code, this performs an exact match search.
Triggers the Search action with criteria = STATION_CODE and returns the matching station record. (e.g., "000004")
- `stationName` (string, optional) — When the user provides a station name (full or partial), this performs a case-insensitive partial match search.
Triggers the Search action with criteria = STATION_NAME and returns all matching station rows. (e.g., "Kandy")
- `transportCost` (string, optional) — When the user provides a transport cost value, this performs an exact match search on the station transport cost.
Triggers the Search action with criteria = STATION_COST and returns stations with that cost. (e.g., "150.00")
- `routeName` (string, optional) — When the user provides a route name, this performs a partial match search against the route group headers.
Returns all stations listed under routes that match the provided route name. (e.g., "Central Expressway")
- `returnAll` (string, optional) — When user asks to return all/available/existing stations, set this to one of:
"true", "yes", "all", "1", "showall", "returnall", "available", "existing", "list"
Triggers Show All and returns every station row from the grid.
- `showAll` (string, optional) — Alias of returnAll (same behavior).
- `autoFetchAllPages` (string, optional) — Controls paging when returnAll is used.
"true" → auto-loop pages and return everything (default when returnAll is truthy)
"false" → return only the requested/current page and include moreAvailable + nextPage Example: "false"
- `pageNumber` (string, optional) — Page number to fetch (used when autoFetchAllPages is "false"). Default: "1"
Example: "2"
- `pageSize` (string, optional) — Page size sent to the grid pager (server may cap). Default: "100"
Example: "50"
- `maxPages` (string, optional) — Safety limit for page looping to avoid infinite loops. Default: "50"
Example: "10"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
