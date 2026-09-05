# updateBargainingUnit

**Task:** Update Bargaining Unit

**Tags:** EIM, Headers

**Status:** live

## Description

In this tool, to update a Bargaining Unit, must and should be first execute the "getEIMAttributeList" API. If any of the required fields—ctl00$body$txtBGNCode, ctl00$body$txtBGNName, ctl00$body$txtAbbreviation, ctl00$body$txtRegDate, ctl00$body$txtRegNumber, or ctl00$body$txtRegBody—are missing from the input, fetch the corresponding values using the getEIMAttributeList API before proceeding.









## Signature

```
updateBargainingUnit
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtBGNCode` (string, required) — Unique code for the bargaining unit.directly access to get the code for getBargainingUnitDetails Api.
- `ctl00_body_txtBGNName` (string, required) — Name of the bargaining unit.
- `ctl00_body_txtAbbreviation` (string, required) — Abbreviation of the bargaining unit name.
- `ctl00_body_txtRegDate` (string, required) — Date when the bargaining unit was registered. data format '05/01/2025'
- `ctl00_body_txtRegNumber` (integer, required) — Registration number of the bargaining unit.only numbers access string not access
- `ctl00_body_txtRegBody` (string, required) — Name of the body with which the bargaining unit is registered.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
