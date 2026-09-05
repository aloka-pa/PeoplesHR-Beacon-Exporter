# editReligion

**Task:** Editing Religion Details

**Tags:** EIMAdmin, Nationality&ReligionInformation

**Status:** live

## Description

This tool updates an existing Religion record in EIM/Religion.aspx. It locates the record using either an exact religion code or a partial/complete religion name, opens the matching row via the same ASP.NET __doPostBack event used by the UI edit icon, enters edit mode, updates the Religion name, and saves the record. After saving, it performs a follow-up search to confirm the record reflects the new name, ensuring the transformer does not return a false “success” when the server responds with HTTP 200 but does not persist the change.

## Signature

```
editReligion
```

## Arguments

- `religionCode` (string, optional) — religion code to search for and then edit upon user request
- `searchReligionName` (string, optional) — The religion name to search for (e.g., "Buddhism")
- `religionName` (string, required) — The new religion name to set (required)


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
