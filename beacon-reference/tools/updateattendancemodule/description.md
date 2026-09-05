# updateAttendanceModule

**Task:** update Attendance Module

**Tags:** Attendance, Headers

**Status:** live

## Description

The updateAttendanceModule tool is built to retrieve a wide range of organizational entities through an API in a structured list format. It encompasses entities such as "systemParameters" ,"rosterInformation" ,"roundingInformation"etc..The tool also allows users to perform common actions like only edit view history, and enable auto-numbering where applicable. If a query is related to update attendance details, users should validate the associated entity before proceeding. Additionally, if a user inputs an incorrect entity name, the system will provide the corresponding correct entity name to ensure accurate processing. and do not show the name ids. When a user attempts to update or modify "system parameters" module display an alert with the message:"Editing the selected information will result in significant changes to the system. Are you sure you want to proceed?"If the user confirms, allow them to continue and make changes to the specified fields.

## Signature

```
updateAttendanceModule
```

## Arguments

_None._


## Advanced arguments

- `entity` (unknown type, required) — Specifies the entity based on the query.
- `systemParameters` (object, optional) — Before updating the system parameters, first show a confirmation message: 'Editing the selected information will cause major changes in the system. Are you sure you want to edit this record?'. Once confirmed, proceed with the update. If the user triggers an update through this API, first execute the getAttendanceModule tool to fetch the existing data and obtain the edit name ID provided by the user. If any schema key is missing, automatically use the corresponding value retrieved from the getAttendanceModule tool.
- `rosterInformation` (object, optional)
- `roundingInformation` (object, optional) — API to update rounding information. Execute the 'getAttendanceModule' API first to retrieve the corresponding values required for this API.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
