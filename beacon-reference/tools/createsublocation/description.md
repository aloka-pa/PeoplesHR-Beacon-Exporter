# createSubLocation

**Task:** Create Sub Location

**Status:** unlive

## Description

To create a new sub-location, first fetch all available locations using the "getSelectLocations" API and display the location names for the user to select. Once a location is selected, automatically retrieve the corresponding location ID. The "Head of Sub Location" field is optional; however, if the user provides an employee ID, the corresponding employee name should be automatically fetched and populated. The "Head of Sub Location" name remains optional during the creation process.

## Signature

```
createSubLocation
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Name or description of the sub-location, e.g., 'Colomboo'.
- `ctl00_body_ddlLocation` (string, required) — Selected location ID from the dropdown, e.g., '000002'. This value should be retrieved from the available locations using the getSubLocationDetails API. The user must select the corresponding value or id.
- `ctl00_body_txtHeadName` (string, optional) — Head of Sub Location name, e.g., 'Peter Pascal'. This is an optional field. If provided, the corresponding employee ID should be fetched using the getEmployeeDetails API.

