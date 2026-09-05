# getQualificationProperty

**Task:** Fetching Qualification Properties

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Searches and retrieves qualification property information. Users can search by property code, property name, or qualification name. Returns all matching qualification properties with their codes, property names, and associated qualification names.
At least one argument (propertyCode, propertyName, OR qualificationName) must be provided by the user.
Always show the user examples of inputs.
If user requests a full list (all/available/existing), provide returnAll as a truthy string (e.g., "all"), and the tool clicks Show All and returns all records currently available in the grid.
Returns a structured response including count and list of matching records with:
propertyCode
propertyName
qualificationName

Supports listing all records via returnAll. Uses RadGrid pager postbacks for pagination and can either return a single page (with nextPage guidance) or automatically fetch all pages when autoFetchAllPages is enabled.

## Signature

```
getQualificationProperty
```

## Arguments

- `propertyCode` (string, optional) — The unique qualification property code to search for (e.g., "000003")
- `propertyName` (string, optional) — The qualification property name or partial name to search for (e.g., "Grade", "Level A")
- `qualificationName` (string, optional) — The qualification name or partial name to search for (e.g., "Bachelor", "Master Degree")
- `returnAll` (string, optional) — If user wants all records, pass a truthy string like:
"true" / "all" / "show all" / "list" / "available" / "existing"
- `qualificationCode` (string, optional) — partial match (optional; only if criteria exists in dropdown)
- `pageNumber` (string, optional) — which page to return (default "1")
- `pageSize` (string, optional) — requested page size (default "100"
- `autoFetchAllPages` (string, optional) — if truthy, fetch all pages (default "false")
- `maxPages` (string, optional) — safety limit (default "70")


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
