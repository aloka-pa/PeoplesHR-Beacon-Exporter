# getCurrencyType

**Task:** Fetching Currency Types

**Tags:** EIMAdmin, NexusInformation

**Status:** live

## Description

Retrieves Currency Type master records from EIM/CurrencyType.aspx.
Supports:
Search currency types by currencyCode (exact) OR currencyName (partial) OR currencySymbol (partial)
Show all currency types
Automatically loops through all pages (even if page size is 5/8/9/etc.) so no results are missed
Returns all matching records, not just page 1

## Signature

```
getCurrencyType
```

## Arguments

- `currencyCode` (string, optional) — The unique code identifier for the currency (e.g., "000008")
- `currencyName` (string, optional) —  The full or partial name of the currency to search for (e.g., "Dollar", "Euro")
- `currencySymbol` (string, optional) — The currency symbol to search for (e.g., "AUD," "USD"); 
NOTE: currencySymbol is not currency symbol like "$"; it is a combination of letters "USD."
- `mode` (string, optional) — Defines how currency types are retrieved. Case-insensitive. Values like “show all”, “all”, “list of all”, “all existing”, “existing”, or “available” return all records across all pages. “Search” (default) filters results using code, name, or symbol.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
