# createRelationship

**Task:** Creating New Relationship Record

**Tags:** EIMAdmin, CensusInformation

**Status:** live

## Description

Creates a new Relationship record in EIM → Relationship (Relationship.aspx).
The tool triggers the New action to open a blank record, fills the mandatory Relationship Name field (txtName), optionally fills Anseli Code if the field exists on the page, then clicks Save using the same ASP.NET WebForms postback sequence as the UI.

## Signature

```
createRelationship
```

## Arguments

- `relationshipName` (string, required) — The name for the new relationship (e.g., "Wife", "Husband", "Father", "Mother", "Sibling")
- `anseliCode` (string, optional) — Optional reference/Anseli code (max 10 chars).
If the page contains ctl00$body$txtrefcode, the tool fills it; otherwise it skips it safely.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
