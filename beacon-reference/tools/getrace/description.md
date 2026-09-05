# getRace

**Task:** Fetching Races

**Tags:** EIMAdmin, Nationality&ReligionInformation

**Status:** live

## Description

This tool retrieves Race master data from the EIM Race screen. It supports searching by race code (exact match) or race name (partial, case-insensitive match), and it can return all race records when requested. When “returnAll” is used, the tool automatically navigates through every RadGrid page using the Go-to-page postback and aggregates all rows so the response contains all records instead of only the first page.

## Signature

```
getRace
```

## Arguments

- `raceCode` (string, optional) — Race code to search (exact match).
Uses search criteria RAC_CODE and returns the record whose Code matches exactly.
- `searchRaceName` (string, optional) — Race name (or partial text) to search.
Uses search criteria RAC_NAME and returns all rows whose Race Name contains the given text (case-insensitive).
- `returnAll` (string, optional) — When user asks to return all/available/existing races, set this to one of:
"true", "yes", "all", "1", "showall", "returnall", "available", "existing", "list".
Triggers Show All (ctl00$body$ContentSearch$butAll) and returns every grid row.
- `showAll` (string, optional) — Alias of returnAll.
- `pageSize` (string, optional) — Page size value sent to the grid pager (server may cap). Default is "100".
- `maxPages` (string, optional) — Safety cap for the maximum number of pages to iterate (prevents infinite loops). Default is "50".


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
