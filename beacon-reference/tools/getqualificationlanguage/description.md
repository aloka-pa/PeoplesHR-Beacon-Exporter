# getQualificationLanguage

**Task:** Fetching Qualification Languages

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Searches and retrieves Language records from the EIM → Languages screen. The tool supports searching by language code (exact match) or language name (partial match). If the user requests a full list, the tool can return all available Language records by triggering the Show All action and extracting every row from the results grid. If returnAll is provided, languageCode/languageName are ignored and the full list is returned.

## Signature

```
getQualificationLanguage
```

## Arguments

- `languageCode` (string, optional) — The language code to search for (e.g., "000006"). If provided, searches by LANG_CODE field.
- `languageName` (string, optional) — The language name to search for (e.g., "Urdu", "English"). If provided, searches by LANG_NAME field. Either code or languageName must be provided.
- `returnAll` (string, optional) — If the user asks to return all records, pass one of these values: "true", "yes", "all", "1", "showall", "all", "available", "existing", "list". When set, the transformer clicks Show All and returns all rows from the grid.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
