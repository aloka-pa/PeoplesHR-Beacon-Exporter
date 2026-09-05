# getUpdateSublocationDetails

**Task:** Update Sublocation Details

**Tags:** EIM, Headers

**Status:** live

## Description

In this tool, sub-location details are updated based on user inputs. If any required fields are missing, the system will fetch the relevant information using the getEIMAttributeList API and display the available location options for the user to select corresponding value retrieved automatically through the getEIMAttributeList api. When updating the "Head of Sub Location," the tool provides an option for the user to search either by employee name or employee ID. If the user enters a ID, the corresponding employee name will be retrieved automatically through the getEmployeeDetails API to ensure accurate mapping. This process ensures that all necessary details are correctly captured and updated.

## Signature

```
getUpdateSublocationDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Name or description of the sub-location, e.g., 'Colomboo'.
- `ctl00_body_ddlLocation` (string, required) — Selected location ID from the dropdown, e.g., '000002'. This value should be retrieved from the available locations using the getSubLocationDetails API. The user must select the corresponding value or id.
- `ctl00_body_txtHeadName` (string, optional) — Head of Sub Location name, e.g., 'Peter Pascal'. This is an optional field. if the user added the head of sub location meanis employee added to user give the employee id corresponding name will take


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
