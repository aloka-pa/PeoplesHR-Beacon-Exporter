# getUpdateSalaryGrade

**Task:** Update Salary Grade Details

**Tags:** EIM, Headers

**Status:** live

## Description

This tool updates salary grades. It first executes the getEIMAttributeList function to retrieve the related data for the update. If any required fields are missing, the tool will fetch the necessary information using the getEIMAttributeList function. If all arguments are provided, it will retrieve the existing data through the getEIMAttributeList API, allowing the user to cross-check the fields before updating. Additionally, it displays a list of currencies, enabling the user to select a currency name and fetch the corresponding value using the getEIMAttributeList API. and if the user update currency user prompt then return keyword is "updateCurrency" other wise user update the currency no return the keyword.

## Signature

```
getUpdateSalaryGrade
```

## Arguments

_None._


## Advanced arguments

- `updateCurrency` (string, optional) — if the user manually update the currency return the keywork the 'updateCurrency' 
- `ctl00_body_txtsalname` (string, required) — Salary Grade Name (e.g., GCB Grade 04).
- `ctl00_body_cboCurrType` (string, required) — Selected currency code (e.g., 000001 for AED). display the currency list to selected the currency name to get corresponding value for getSalaryGrade api
- `ctl00_body_txtMin` (number, required) — Minimum salary point. It must be less than equal to the Mid Point.
- `ctl00_body_txtMid` (number, required) — Mid salary point. It must be greater than the Min Point and less than equal to the Max Point.
- `ctl00_body_txtMax` (number, required) — Maximum salary point. It must be greater than equal to the Mid Point.


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
