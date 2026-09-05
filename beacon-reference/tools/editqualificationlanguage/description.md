# editQualificationLanguage

**Task:** Editing Qualificaton Language Details

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Updates an existing Language record by modifying its name and/or rating method assignment.

## Signature

```
editQualificationLanguage
```

## Arguments

- `languageCode` (string, optional) — The language code to identify the record to edit (e.g., "000006"). Either languageCode or languageName must be provided.
- `languageName` (string, optional) — The language name to identify the record to edit (e.g., "Korean"). Either languageCode or languageName must be provided.
- `newLanguageName` (string, optional) — The new name for the language. If not provided, the language name will remain unchanged. 
- `ratingCode` (string, optional) — The code of the rating method to assign (e.g., "000001" for "Rating_01"). Either ratingCode or ratingName can be provided.
- `ratingName` (string, optional) — The name of the rating method to assign (e.g., "Rating_01"). Either ratingCode or ratingName can be provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
