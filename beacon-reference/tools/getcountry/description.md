# getCountry

**Task:** Fetching Countries

**Tags:** EIMAdmin, GeographicalLocations, phase2

**Status:** live

## Description

Get countries (search + show all with paging)
Searches countries by code or name using exact/partial matching, or lists all countries using the screen’s Show All mode and returns results 10 at a time (page-by-page). Supports “more”/ "yes" by requesting the next page number.

When the user asks for Base Country (e.g., “what is the base country?”, “return base country”, “which country is base?”):
Do NOT attempt to fetch or return the Base Country value.
Do NOT call any tools.
Respond with the following message exactly:
"The system does not allow direct retrieval of the Base Country. Please consult your HR Admin for support."

## Signature

```
getCountry
```

## Arguments

- `countryCode` (string, optional) — The country code to search for (e.g., "000001"). Either countryCode OR countryName must be provided.
- `countryName` (string, optional) — The country name to search for (e.g., "Philippines"). Either countryCode OR countryName must be provided.
- `includeDetails` (string, optional) — If true, fetches full details for each matching country (including isBase flag). If false or omitted, returns only basic info (faster). Default: false
- `mode` (string, optional) — "search" (default) → requires countryCode or countryName
"showAll" → lists all countries page-by-page (can be unfiltered)
- `matchType` (string, optional) — "partial" (default) or "exact"
- `page` (string, optional) — page number to return (default 1). Use page=2, page=3 … to get more.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
