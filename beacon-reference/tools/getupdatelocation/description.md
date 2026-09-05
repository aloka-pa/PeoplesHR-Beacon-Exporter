# getUpdateLocation

**Task:** Update Location

**Tags:** EIM, Headers

**Status:** live

## Description

Before calling this API, first retrieve data using the getEIMAttributeList API. If any required fields are missing in the user's input, populate them using corresponding values from the getLocation API response. When updating fields such as country, province, or district, if the user provides only the name (e.g., "Central" for province), the system should fetch and use the corresponding value (e.g., "000001") for processing.

## Signature

```
getUpdateLocation
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Location name. If the user provides a value, use that. Otherwise, fetch from the getLocation tool and populate this field.
- `ctl00_body_txtAbbreviation` (string, required) — Location abbreviation. Use user input if available, otherwise retrieve from the getLocation tool.
- `ctl00_body_txttp` (string, required) — Telephone number. Use user-provided input or fetch it from the getLocation tool if not provided.
- `ctl00_body_txtFax` (string, required) — Fax number. Use the user-entered value or retrieve it from the getLocation tool if not provided.
- `ctl00_body_txtemail` (string, required) — Email address. Use user input or fetch from the getLocation tool if left blank.
- `ctl00_body_txturl` (string, required) — Website URL. Populate with user input or use data from the getLocation tool if empty.
- `ctl00_body_txtaddress` (string, required) — Address. Use the provided value or retrieve from the getLocation tool if not entered.
- `ctl00_body_ddlCountry` (string, required) — Country. If not specified by the user, get the value from the getLocation tool.
- `ctl00_body_ddlProvince` (string, required) — Province or state. Use user-provided input or default to the value from the getLocation tool.
- `ctl00_body_ddlDistrict` (string, required) — District. Use input from the user or fallback to data from the getLocation tool.
- `ctl00_body_cboTimeZone` (string, required) — Time zone. Use the user-entered value or populate from the getLocation tool if blank.
- `ctl00_body_txtHeadName` (string, required) — Head of location name. Use user-provided value or fetch from the getLocation tool.
- `ctl00_body_txtHTitle` (string, required) — Head's title or designation. If not provided by the user, get it from the getLocation tool.
- `ctl00_body_txtAdminName` (string, required) — Administrator name. Use input from the user or fetch from the getLocation tool.
- `ctl00_body_filMyFile` (string, required) — Base64-encoded logo file to be uploaded. Optional input.
- `ctl00_body_butSave` (string, required) — Trigger to save the form. Should always be set to 'Save'.
- `ctl00_body_hdnDefCountry` (string, required) — Default country code or name. If not provided, populate from the getLocation tool.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
