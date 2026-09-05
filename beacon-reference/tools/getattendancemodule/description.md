# getAttendanceModule

**Task:** Attendance Module

**Tags:** Attendance, Headers

**Status:** live

## Description

The getAttendanceModule tool is built to retrieve a wide range of organizational entities through an API in a structured list format. It encompasses entities such as "systemParameters","overtimeInformation","gracePeriodInformation","rosterInformation" ,"shiftInformation" The tool also allows users to perform common actions like edit, delete, view history, and enable auto-numbering where applicable. If a query is related to attendance details, users should validate the associated entity before proceeding. Additionally, if a user inputs an incorrect entity name, the system will provide the corresponding correct entity name to ensure accurate processing. and do not show the name ids.

## Signature

```
getAttendanceModule
```

## Arguments

_None._


## Advanced arguments

- `entity` (unknown type, required) — Specifies the entity based on the query.
- `systemParameters` (object, optional)
- `overtimeInformation` (object, optional) — user to ask concent ot type name ,before get the over time information, must and should user to ask ot type name then will be search ot, if the user overtime related query pic in this api. to generate the over time information.
- `gracePeriodInformation` (object, optional) — if the user Grace Period Information related query pic in this api. to generate the over time information.
- `rosterInformation` (object, optional)
- `shiftInformation` (object, optional) — in this api generate the shift information details.
- `rosterEmployee` (object, optional) — In this tool, when a user searches by roster name, first execute the rostersDetails tool to fetch the employee information. If the user searches directly using an employee ID, execute the request using the employee ID only—no tool call is required. Additionally, when searching by roster name, do not prompt the user for the employee ID.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
