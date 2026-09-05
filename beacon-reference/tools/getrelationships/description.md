# getRelationships

**Task:** Fetching Relationships

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

This tool retrieves Relationship master data from the EIM Relationship screen. It supports searching by relationship code (exact match) or relationship name (partial match), and it can return all available relationship records. When “return all” is used, the tool automatically navigates through every RadGrid page using the Go-to-page postback and aggregates all rows so the response includes all records, not only page 1.

## Signature

```
getRelationships
```

## Arguments

- `relationshipCode` (string, optional) — When the user provides a relationship code, this is used for an exact match search.
Triggers the Search action with criteria = REL_ID and returns the matching grid record(s). (e.g., "000008"). 
- `relationshipName` (string, optional) — When the user provides a relationship name (full or partial), this performs a case-insensitive partial match search.
Triggers the Search action with criteria = REL_NAME and returns all matching grid rows. (e.g., "Brother", "Sister", "Spouse").
- `returnAll` (string, optional) — When user asks to return all/available/existing relationships, set this to one of:
"true", "yes", "all", "1", "showall", "returnall", "available", "existing", "list"
Triggers Show All and returns every grid row.
- `showAll` (string, optional) — Alias of returnAll.
- `pageSize` (string, optional) — Page size value sent to the grid pager (server may cap it). Default "100".
- `maxPages` (string, optional) — Safety cap to avoid infinite paging loops. Default "50".


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
