# editElectorate

**Task:** Editing Electorate Details

**Tags:** EIMAdmin, GeographicalLocations

**Status:** live

## Description

Edit an existing electorate record. Only change the record that the user asked to edit. Do not change any other record.
If both districtCode and districtName are provided, districtCode takes priority

## Signature

```
editElectorate
```

## Arguments

- `electorateCode` (string, optional) — Electorate code to search for
Example: "000002"
- `electorateName` (string, optional) — Electorate name to search for
Example: "Mahara"
- `newElectorateName` (string, optional) — New electorate name

Example: "Updated Electorate Name"
- `districtCode` (string, optional) — District code directly

Example: "000122"
- `districtName` (string, optional) —  District name
Example: "Colombo"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
