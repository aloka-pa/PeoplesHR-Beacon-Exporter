# getEIMModuleLists

**Task:** Fetching Codes & Names List

**Tags:** EIM, Headers

**Status:** live

## Description

This tool provides all EIM module names and their corresponding code IDs, including modules like "location", "companyHierarchy", "costCentre", "subLocation", "salaryGrade", "designation", "employeeGroup", "employeeTitle", "genderType", "maritalStatus", "bloodGroup", "attachmentType", "qualificationType"and others. If a user makes a query without providing a code ID or name, first check if the module name matches any from the available data. If matched, fetch the corresponding code ID automatically without asking the user. Then, use that code ID to execute the getEIMAttributeList API. Also, display the matched module names and their IDs in a table format to the user.

## Signature

```
getEIMModuleLists
```

## Arguments

_None._


## Advanced arguments

- `entity` (unknown type, required) — Specifies the entity based on the query.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
