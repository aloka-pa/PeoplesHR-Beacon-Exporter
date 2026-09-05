# editRelationships

**Task:** Editing Relationship Information

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Updates Relationship records in EIM → Relationship (Relationship.aspx).
The tool first locates the record by relationship code (recommended, exact match) or relationship name (exact/case-insensitive). Then it opens the record using the grid row postback, enters Edit mode, updates the relationship name, and saves the changes using the same WebForms postback sequence as the UI.

## Signature

```
editRelationships
```

## Arguments

- `relationshipCode` (string, optional) — Use this to identify the relationship record by code (recommended).
Performs an exact match against the results grid and selects that record for editing.
- `relationshipName` (string, optional) — Use this to identify the relationship record by its name when code is not available.
Matches case-insensitive exact name; if multiple matches occur, the tool returns an AMBIGUOUS response instead of updating the wrong record.  (e.g., "Spouse").
- `newRelationshipName` (string, optional) — New name to save into ctl00$body$txtName (max 20 chars).
If not provided, the tool will not update anything and the relationship name will remain unchanged.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
