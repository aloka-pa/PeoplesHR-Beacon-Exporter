# createAttendanceModule

**Task:** Create Attendance Module

**Tags:** Attendance, Headers

**Status:** live

## Description

The createAttendanceModule tool is built to retrieve a wide range of organizational entities through an API in a structured list format. It encompasses entities such as "systemParameters","roundingInformation","overtimeInformation","gracePeriodInformation", The tool also allows users to perform common actions like create the view history, and enable auto-numbering where applicable. If a query is related to attendance details, users should validate the associated entity before proceeding. Additionally, if a user inputs an incorrect entity name, the system will provide the corresponding correct entity name to ensure accurate processing. and do not show the name ids.

## Signature

```
createAttendanceModule
```

## Arguments

_None._


## Advanced arguments

- `entity` (unknown type, required) — Specifies the entity based on the query.
- `overtimeInformation` (object, optional) — to create overtime Information.fisrt execute the 'defaultRoundingPatternAndBaseTypeDetails' api. to get corresponding schema data fields then creating overtimeInformation
- `gracePeriodInformation` (object, optional) — This object defines the structure for creating a Grace Period Information entry. First, fetch the 'gracePeriodandRoundingPatternDetails' API to retrieve the available schema fields for the grace period configuration. to display the all rounding patterns and previous grace perriod details dispaly then user to select.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
