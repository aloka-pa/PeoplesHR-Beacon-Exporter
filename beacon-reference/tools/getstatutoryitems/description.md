# getStatutoryItems

**Task:** Fetching Statutory Items

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

This tool retrieves Statutory Items from the PeopleHR EIM screen. It supports searching by statutory code (exact match) or statutory name (partial match), and it can also return all available records. When “return all” is requested, the transformer automatically navigates through all RadGrid pages using the Go-To-Page postback and aggregates results so user don’t get stuck with only page 1’s data.

## Signature

```
getStatutoryItems
```

## Arguments

- `statutoryCode` (string, optional) — When the user provides a statutory item code, this is used for an exact match search.
Triggers the Search action with criteria = STA_CODE and returns the matching grid record(s). (e.g., "000005").
- `statutoryName` (string, optional) — When the user provides a statutory item name (full or partial), this performs a case-insensitive partial match search.
Triggers the Search action with criteria = STA_NAME and returns all matching grid rows. (e.g., "Gratuity", "EPF").  
- `returnAll` (string, optional) — When user asks to return all/available/existing statutory items, set this to one of:
"true", "yes", "all", "1", "showall", "returnall", "available", "existing", "list"
Triggers Show All and returns every grid row.
- `showAll` (string, optional) — Alias of returnAll. Example: "true"
- `autoFetchAllPages` (string, optional) — Controls paging behavior when returnAll is used.
"true" = loop all pages (default when returnAll is truthy)
"false" = return only page 1 and provide nextPage + moreAvailable
- `pageNumber` (string, optional) — Page to fetch when not auto-looping (default "1"). Example: "2"
- `pageSize` (string, optional) — Page size sent to the grid pager (server may cap it). Default: "100". Example: "200"
- `maxPages` (string, optional) — Safety cap to prevent infinite loops. Default: "50". Example: "10"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
