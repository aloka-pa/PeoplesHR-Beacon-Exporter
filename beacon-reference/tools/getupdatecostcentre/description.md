# getUpdateCostCentre

**Task:** Update Cost Centre Details

**Tags:** EIM, Headers

**Status:** live

## Description

This tool is used to update cost centre details. If the user misses filling any field, the missing data is fetched using the "getEIMAttributeList"  tool and passed to the arguments. If all fields are filled, the tool cross-checks the entered data against existing records using getCostCentreDetails before proceeding.

## Signature

```
getUpdateCostCentre
```

## Arguments

_None._


## Advanced arguments

- `code` (string, required) — Unique identifier for the cost centre.
- `costCentreName` (string, required) — Name of the cost centre.
- `description` (string, required) — Short description of the cost centre.
- `costReferenceNumber` (string, required) — in this cost reference number.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
