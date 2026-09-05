# getQualificationClassification

**Task:** Fetching Qualification Classifications

**Tags:** EIMAdmin, Qualification Information

**Status:** live

## Description

Retrieves qualification classification records from the system by code, name, or as a full list. Supports partial matching and can return either summary data or detailed records. Also handles “get all/available/existing qualifications” requests using fetchMode. 

## Signature

```
getQualificationClassification
```

## Arguments

- `classificationCode` (string, optional) — Use the provided classification code to search and return the corresponding qualification classification details.
- `classificationName` (string, optional) — Use the provided classification name to search and return the corresponding qualification classification details.
- `includeDetails` (string, optional) — If true, fetches detailed info for each match. Default: false
- `fetchMode` (string, optional) — Returns all qualification classifications instead of searching by code or name. Use values like "ALL", "AVAILABLE", "EXISTING", or "LIST" when the user asks for all or available qualifications. If set, code/name filters are ignored.
- `returnAll` (string, optional) — Returns all qualification classifications instead of searching by code or name. Use values like "ALL", "AVAILABLE", "EXISTING", or "LIST" when the user asks for all or available qualifications. If set, code/name filters are ignored.
- `pageNumber` (string, optional) — when not auto-fetching all, fetch a specific page (default 1)
- `pageSize` (string, optional) — requested size (default 100)
- `autoFetchAllPages` (string, optional) — truthy → fetch all pages (default true when all-mode)
- `maxPages` (string, optional) — safety limit (default 50)


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
