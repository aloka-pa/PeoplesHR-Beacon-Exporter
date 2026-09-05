# getReligion

**Task:** Fetching Religions

**Tags:** EIMAdmin, Nationality&ReligionInformation

**Status:** live

## Description

This tool retrieves Religion master data from EIM/Religion.aspx in PeoplesHR. It can search religions by exact code or by partial religion name, return results using the same paging behavior as the UI (page size and page navigation), and optionally fetch all religions across all pages when the user explicitly requests “all records”. It also supports returning a specific page (e.g., “6th page”) and provides navigation hints (next/previous availability) to continue fetching more records safely.

## Signature

```
getReligion
```

## Arguments

- `religionCode` (string, optional) — user enters the religion code to search for and return the grid row details, including religion name
- `religionName` (string, optional) — Religion name search text (partial allowed, example: "Christ"). Also accepts "all", "show all", "*" to fetch all records.
- `page` (string, optional) — Page number to return (example: "6"). If omitted, defaults to "1". You may also pass "next" / "prev" with currentPage.
- `currentPage` (string, optional) — Current page number (used only when page is "next" or "prev").
- `batchSize` (string, optional) — How many records to return per response (example: "10"). If not given, it returns UI page size.
- `useUiPageSize` (string, optional) — "true" (default) uses UI page size; "false" lets batchSize drive the size.
- `returnAll` (string, optional) — "true" to fetch all pages and return all records.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
