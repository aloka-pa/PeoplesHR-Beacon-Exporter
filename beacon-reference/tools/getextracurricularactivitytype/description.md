# getExtraCurricularActivityType

**Task:** Fetching Extra Curricular Activity Types

**Tags:** EIMAdmin, ExtraCurricularActivities

**Status:** live

## Description

Fetches Extra Curricular Activity Type records from EIM → ExtraCulActivityType screen.
Supports:
Search by code or type name
Partial matching for both (and returns all matching rows, across pages)
Show All using returnAll (string) with page-based pagination (page, pageSize, hasMore, nextPage) and returns the entire list (all pages) with code + type.
String-only args (Beacon requirement)

## Signature

```
getExtraCurricularActivityType
```

## Arguments

- `code` (string, optional) — The activity type code to search for (e.g., "000001"). If provided, searches by EATYPE_CODE field.
- `typeName` (string, optional) — The activity type name to search for (e.g., "Theatre", "Olympiad"). If provided, searches by EATYPE_NAME field. Either code or typeName must be provided.
- `returnAll` (string, optional) — If user asks show all / list / available / existing / return all, set this to that phrase to trigger Show All mode.
- `pageSize` (string, optional) — Page size used while paging (string). Default "10" (UI default).
- `maxPages` (string, optional) — Safety cap when collecting search results across pages (search mode). String number. Default: "50"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
