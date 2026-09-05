# editRouteInformation

**Task:** editing route details

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Updates route information. Searches for a route by code or name, opens the record, enters edit mode, and saves the new route name.
The user must provide either routeCode OR routeName to identify the record, AND must provide newRouteName to update it.

## Signature

```
editRouteInformation
```

## Arguments

- `routeCode` (string, optional) — The unique route code/ID to identify which route to update (e.g., "000003")
- `routeName` (string, optional) — The exact route name to identify which route to update (e.g., "Southern Expressway")
- `newRouteName` (string, required) — The new name for the route (e.g., "Outer Circular Highway (OCH) - updated")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
