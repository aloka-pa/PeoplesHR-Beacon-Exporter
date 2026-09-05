# updateOvertimeInformation

**Task:** updateOvertimeInformation

**Tags:** Attendance, Headers

**Status:** live

## Description

before execute the "updateOvertimeInformation" api first execute for "getAttendanceModule" api then to all data then after using the data if the user update field will take that update fields, call this api tool to update the Overtime Information data by user given details.

IMPORTANT: {OTTypeName, overtTimeName} are the required fields remaining are the optional fields so do not ask the followup question for remaining fields take only if user provided.

## Signature

```
updateOvertimeDefintion
```

## Arguments

_None._


## Advanced arguments

- `OTTypeName` (string, required) — take user given OT type name for updating its details
- `overtTimeName` (string, required) — take user given new overtime name
- `defaultRoundingPattern` (string, required) — take user given Default Rounding Pattern example (Round Up 30) (Round UP Late Arrival) ( contains spaces take total pattern given by user
- `baseType` (string, required) — take user given basetype for example (post ot rate 1) (pre ot rate 2) contains spaces take total basetype given by user
- `customMultiplier` (string, required) — take user given Custom Multiplier value this should be lessthan or equal to 10 should not take more than 10 is provided more than 10 tell user value not accepted


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
