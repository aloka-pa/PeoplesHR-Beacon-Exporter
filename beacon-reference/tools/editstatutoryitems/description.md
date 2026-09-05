# editStatutoryItems

**Task:** Editing Statutory Item Details

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Updates an existing Statutory Item record by modifying its name.

## Signature

```
editStatutoryItems
```

## Arguments

- `statutoryCode` (string, optional) — The statutory item code to identify the record to edit (e.g., "000005"). Either statutoryCode or statutoryName must be provided.
- `statutoryName` (string, optional) — The statutory item name to identify the record to edit (e.g., "Pension Scheme"). Either statutoryCode or statutoryName must be provided.
- `newStatutoryName` (string, required) — The new name for the statutory item.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
