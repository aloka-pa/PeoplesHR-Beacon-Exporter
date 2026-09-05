# editDwellingType

**Task:** Editing Dwelling Type Details

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Updates an existing Dwelling Type record by modifying its name.

## Signature

```
editDwellingType
```

## Arguments

- `dwellingCode` (string, optional) — The dwelling type code to identify the record to edit (e.g., "000006"). Either dwellingCode or dwellingType must be provided.
- `dwellingType` (string, optional) — The dwelling type name to identify the record to edit (e.g., "Apartment"). Either dwellingCode or dwellingType must be provided.
- `newDwellingType` (string, required) — The new name for the dwelling type.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
