# createCashBenefit

**Task:** Create Cash Benefit

**Status:** unlive

## Description

To create a cash benefit in this tool, first execute the getCurrencyDetails API to fetch all available currency options. Display the list for the user to select a currency, and use the corresponding value during creation. If any required fields are missing, halt the creation process.








## Signature

```
createCashBenefit
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Description of the cash benefit
- `ctl00_body_nuamount` (number, required) — Amount of the cash benefit
- `ctl00_body_cboCurrency` (string, required) — Selected currency code (e.g., 000146 for USD) you take currency name corresponding value will be take.
- `ctl00_body_dtRateEffDate_txtDate` (string, optional) — Rate effective date in dd/mm/yyyy format

