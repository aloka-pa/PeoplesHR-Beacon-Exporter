# createStationInformation

**Task:** Creating New Station Record

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Creates a new station information record in the system with name, transport cost, and route assignment.
When creating a record all name, transport cost, and route are required.
When choosing the route, the user must provide either the route code (e.g., "000002") or route name (e.g., "Central Expressway").

## Signature

```
createStationInformation
```

## Arguments

- `stationName` (string, required) — The name of the new station (e.g., "Maharagama")
- `transportCost` (string, required) — The transport cost for the station (e.g., "780" or "780.00")
- `routeCode` (string, optional) — The code of the new route. The user must provide either the route code (e.g., "000002") or route name (e.g., "Central Expressway")
- `routeName` (string, optional) — The name of the new route. The user must provide either the route code (e.g., "000002") or route name (e.g., "Central Expressway")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
