# createLocation

**Task:** Create Location

**Status:** unlive

## Description

In this tool, to create a location, first fetch data using the getSelectLocationDetails tool. Use the retrieved values from this tool as input arguments when creating the location. and if the user missing the fields such as country to get the data using in this getSelectLocationDetails.

## Signature

```
createLocation
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Location name. If the user provides a value, use that. Otherwise, fetch from the getSelectLocationDetails tool and populate this field.
- `ctl00_body_txtAbbreviation` (string, optional) — Location abbreviation. Use user input if available, otherwise retrieve from the getSelectLocationDetails tool.
- `ctl00_body_txttp` (string, optional) — Telephone number. Use user-provided input or fetch it from the getSelectLocationDetails tool if not provided.
- `ctl00_body_txtFax` (string, optional) — Fax number. Use the user-entered value or retrieve it from the getSelectLocationDetails tool if not provided.
- `ctl00_body_txtemail` (string, optional) — Email address. Use user input or fetch from the getSelectLocationDetails tool if left blank.
- `ctl00_body_txturl` (string, optional) — Website URL. Populate with user input or use data from the getSelectLocationDetails tool if empty.
- `ctl00_body_txtaddress` (string, optional) — Address. Use the provided value or retrieve from the getSelectLocationDetails tool if not entered.
- `ctl00_body_ddlCountry` (string, required) — Country. If not specified by the user, get the value from the getSelectLocationDetails tool and you take user give the country name corresponding value take
- `ctl00_body_ddlProvince` (string, required) — Province or state. Use user-provided input or default to the value from the getSelectLocationDetails tool and you take user give the Province name corresponding value take.
- `ctl00_body_ddlDistrict` (string, required) — District. Use input from the user or fallback to data from the getSelectLocationDetails tool and you take user give the District name corresponding value take
- `ctl00_body_cboTimeZone` (string, optional) — Time zone. Use the user-entered value or populate from the getSelectLocationDetails tool if blank.
- `ctl00_body_txtHeadName` (string, optional) — Head of location name. Use user-provided value or fetch from the getSelectLocationDetails tool.
- `ctl00_body_txtHTitle` (string, optional) — Head's title or designation. If not provided by the user, get it from the getSelectLocationDetails tool.
- `ctl00_body_txtAdminName` (string, optional) — Administrator name. Use input from the user or fetch from the getSelectLocationDetails tool.
- `ctl00_body_filMyFile` (string, optional) — Base64-encoded logo file to be uploaded. Optional input.
- `ctl00_body_butSave` (string, optional) — Trigger to save the form. Should always be set to 'Save'.
- `ctl00_body_hdnDefCountry` (string, optional) — Default country code or name. If not provided, populate from the getSelectLocationDetails tool.

