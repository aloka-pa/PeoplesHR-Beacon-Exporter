# createQualificationLanguage

**Task:** Creating New Qualification Language Record

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Creates a new Language record with a specified name and required rating method assignment.

## Signature

```
createQualificationLanguage
```

## Arguments

- `languageName` (string, required) — The name of the language to create (e.g., "Spanish", "French", "Mandarin"). 
- `ratingCode` (string, optional) — The code of the rating method to assign (e.g., "000001" for "Rating_01"). Either ratingCode or ratingName must be provided.
- `ratingName` (string, optional) — The name of the rating method to assign (e.g., "Rating_01"). Either ratingCode or ratingName must be provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
