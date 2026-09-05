# updateFunctionalRoleDetails

**Task:** Update Functional Role Details

**Tags:** EIM, Headers

**Status:** live

## Description

In this tool, must and should first execute for the "getEIMAttributeList" API then after execute for "update functional role details" api. to fetch the existing data. If any field is missing, retrieve the corresponding data. If the user updates the ctl00$body$dpcountry field, first display all available functional role options and use the value of the selected option for the update. 

## Signature

```
updateFunctionalRoleDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_dpcountry` (string, required) — Selected functional role ID or country code. If the user updates this field, first display all available functional role options and use the corresponding value from the selection.
- `ctl00_body_txtName` (string, required) — The name or label for the functional role.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
