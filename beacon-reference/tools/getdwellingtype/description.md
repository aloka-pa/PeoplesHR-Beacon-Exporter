# getDwellingType

**Task:** Fetching Dwelling Types

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Retrieves Dwelling Type records from EIM → Dwelling Types (DwilingTypes.aspx).
The user can search by dwelling code (exact match) or dwelling name (partial match). If the user asks to see all/available/existing dwelling types, the tool triggers the Show All action and returns every record from the results grid.

## Signature

```
getDwellingType
```

## Arguments

- `dwellingCode` (string, optional) — the dwelling type code to search for (e.g., "000006")
- `dwellingName` (string, optional) — The dwelling type name to search for (e.g., "Annex / Portion", "Apartment"). Either dwellingCode or dwellingType must be provided.
- `returnAll` (string, optional) — When user asks to return all/available/existing dwelling types, set this to one of:
"true", "yes", "all", "1", "showall", "returnall", "available", "existing", "list"
Triggers Show All (ctl00$body$ContentSearch$butAll) and returns every grid row.
- `showAll` (string, optional) — Same behavior as returnAll (alias).
- `pageNumber` (string, optional) — Specific page number to fetch (used when not auto-fetching all pages). Default "1".
- `pageSize` (string, optional) — Number of rows requested per page. Server may cap it. Default "100".
- `autoFetchAllPages` (string, optional) — If "true", tool loops through all pages. Defaults to true when returnAll is used.
- `maxPages` (string, optional) — Safety limit to avoid infinite loops. Default "50".


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
