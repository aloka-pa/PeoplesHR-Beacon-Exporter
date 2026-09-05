# getQualificationDetails

**Task:** Fetching Qualification Details

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Retrieves qualification records from EIM module's Qualification Details page. Supports searching by qualification code or name with partial matching and returns all matches. Also supports returning the full list of qualifications using fetchMode (ALL/AVAILABLE/EXISTING/LIST) by triggering the Show All postback and extracting all grid rows.

## Signature

```
getQualificationDetails
```

## Arguments

- `qualificationCode` (string, optional) — Search qualifications by code. Supports partial matching and returns all matching rows. Ignored when fetchMode is set to return all records.
  
- `qualificationName` (string, optional) — Search qualifications by name. Supports partial matching (case-insensitive) and returns all matching rows. Ignored when fetchMode is set to return all records.
- `fetchMode` (string, optional) — Controls list retrieval. Use "ALL", "AVAILABLE", "EXISTING", or "LIST" to return all qualification records via Show All. When set, code/name search is skipped and all rows are returned.
- `returnAll` (string, optional) — "all" | "available" | "existing" | "list" triggers show-all behavior (your existing style); truthy strings also trigger show-all (optional; supported)
- `pageNumber` (string, optional) — fetch a single page (default "1")
- `pageSize` (string, optional) — requested size (default "100")
- `autoFetchAllPages` (string, optional) — truthy → fetch all pages and return all rows (default "true" when wantsAll)
- `maxPages` (string, optional) — safety limit (default "50")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
