# getEIMAttributeList

**Task:** EIM Attribute List

**Tags:** EIM, Headers

**Status:** live

## Description

Before executing the "getEIMAttributeList" API:
1.If the user's query refers to submodules like location, company hierarchy, cost centre, salary grade, designation, job description types, qualification classifications, membership details, benefits, employee categories, statutory classifications, functions, roles, titles, gender types, marital status, blood groups, or attachment types, and includes a specific name or code:
→ First, call "getEIMModuleLists" api to fetch the corresponding code.
→ Then, use the code in "getEIMAttributeList"  api to get detailed data.
2.If the query includes “list”, “all”, or similar for any above submodules:
→ Use "getEIMModuleLists" api to return the full list.
3.If a specific module name or code is mentioned:
→ First execute "getEIMModuleLists" to verify or obtain the code.
→ Then after execute more information to get in the "getEIMAttributeList"  api, using that code to retrieve more details.

## Signature

```
getEIMAttributeList
```

## Arguments

_None._


## Advanced arguments

- `entity` (unknown type, required) — Specifies the entity based on the query.
- `codeId` (string, required) — user give the code id then get the corresponding details we will get Example code ids '000001','000010','0' etc... to get for code id for 'getEIMModuleLists' api. is provide.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
