# editStationInformation

**Task:** Editing Station Details

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Updates station information including name, transport cost, and route assignment in the system.
User must provide ONE identification field and at least ONE update field. When updating the route, user can use either newRouteCode or newRouteName.

## Signature

```
editStationInformation
```

## Arguments

- `stationCode` (string, optional) — The unique code identifier for the station to update (e.g., "000004")
- `stationName` (string, optional) — The current name of the station to update (e.g., "Kottawa")
- `transportCost` (string, optional) — The current transport cost to identify the station (e.g., "150.00")
- `routeName` (string, optional) — The current route name to identify stations on that route (e.g., "Central Expressway")
- `newStationName` (string, optional) — The new name for the station (e.g., "Kottawa-updated")
- `newTransportCost` (string, optional) — The new transport cost value (e.g., "175.50")
- `newRouteCode` (string, optional) — The new route code to assign (e.g., "000004")
- `newRouteName` (string, optional) — The new route name to assign (e.g., "Outer Circular Highway")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
