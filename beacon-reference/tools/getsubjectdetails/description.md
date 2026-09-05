# getSubjectDetails

**Task:** Fetching Subjects

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Searches and retrieves subject information by subject code or subject name. Supports partial name matching - for example, searching "big data" will find "Big Data Analytics", and searching "OOP" will find "Object-Oriented Programming (OOP)". Returns all matching subjects with their codes and names.
At least one argument (subjectCode OR subjectName) must be provided.

If a full list is requested (using returnAll), the tool clicks “Show All” and returns all available subject records from the grid.

## Signature

```
getSubjectDetails
```

## Arguments

- `subjectCode` (string, optional) — The unique subject code to search for (e.g., "000001", "000008")
- `subjectName` (string, optional) — The subject name or partial name to search for (e.g., "OOP", "big data", "Programming")

- `returnAll` (string, optional) — To return all subjects, pass one of:
"all", "show all", "true", "list", "available", "existing"
- `pageNumber` (string, optional) — which page to fetch (default "1")
- `pageSize` (string, optional) — page size requested (default "100"). If system caps to 4/5, pagination still works


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
