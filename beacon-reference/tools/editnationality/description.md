# editNationality

**Task:** Editing Nationality Details

**Tags:** EIMAdmin, Nationality&ReligionInformation

**Status:** live

## Description

Updates a Nationality master record in EIM/Nationality.aspx.
Supports editing by:
nationalityCode (exact match), or
searchNationalityName (exact name match)
If the user searches by name and multiple records have the same name, the tool will not edit anything.
Instead, it returns a list of matching records (nationalityCode + nationalityName) and asks the user to choose which record to edit, or whether to edit all (if enabled).
Returns a success message when the update is saved successfully. Only change the record that the user asked to edit. Do not change any other record.

## Signature

```
editNationality
```

## Arguments

- `nationalityCode` (string, optional) — Nationality code to identify the exact record to edit (e.g., "000208"). If this is provided, the tool edits that record directly and does not ask about duplicates.
- `nationalityName` (string, required) — New nationality name to be saved.
- `searchNationalityName` (string, optional) — Existing nationality name to identify the record when the code is not provided. If multiple records share the same name, the tool returns all matches and asks the user which code to edit.
- `applyTo` (string, optional) — Controls what to do when multiple records match the same searchNationalityName.
Allowed values:
"single" (default) — return matches and ask the user which nationalityCode to edit
"all" — update all matching records with the new nationalityName
- `pageSize` (string, optional) — Page size to use for the results grid (must match UI behavior). Default: "10"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
