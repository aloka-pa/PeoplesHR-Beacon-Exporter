# getNationality

**Task:** Fetching Nationalities

**Tags:** EIMAdmin, Nationality&ReligionInformation

**Status:** live

## Description

This tool retrieves Nationality master data from the EIM Nationality screen and supports both targeted searches (by code or name) and UI-accurate page-by-page listing. It replicates the screen’s paging behavior by applying the selected page size using the same Change Page Size postback and navigating pages using the Go-to-Page postback, enabling responses like “get all nationalities” followed by “yes” for the next page or “get from page 19” for direct page jumps. The tool returns only the records shown on the requested UI page and indicates whether more pages are available.

## Signature

```
getNationality
```

## Arguments

- `nationalityCode` (string, optional) — user enters the nationality code to search for and return the grid row details, including nationality name
- `nationalityName` (string, optional) — user enters the nationality name to search for and return the grid row details, including nationality details
- `returnAll` (string, optional) — Set to "all" / "true" / "yes" / "Show All" / "Available" / "List of" / "Existing" to list nationalities page-by-page using the screen paging.
- `pageSize` (string, optional) — Number of rows per page, must match UI expectation (e.g., "4", "6", "10"). The transformer applies it using ChangePageSizeLinkButton.
- `page` (string, optional) — Page number as a string. Example: "19" to fetch page 19 results
- `next` (string, optional) — Set to "yes" to move to next page (uses the “Next Page” submit control)
- `cursor` (string, optional) — JSON string returned by the tool; optional for future state passing (still string-only compatible).


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
