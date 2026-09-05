# updateStatutoryClassificationDetails

**Task:** update Statutory Classification Details

**Tags:** EIM, Headers

**Status:** live

## Description

Before calling this api, must and should be first execute for "getEIMAttributeList" API, then after in this tool execute. to retrieve existing data. Then, compare the updated Statutory Classification name with the previous name from the getEIMAttributeList response before proceeding with the update.

## Signature

```
updateStatutoryClassificationDetails
```

## Arguments

- `statutoryClassification` (string, required) — to give the statutory Classification name or description.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
