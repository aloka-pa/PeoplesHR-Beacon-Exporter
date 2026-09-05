# updateCashBenefitDetails

**Task:** update CashBenefit Details

**Tags:** EIM, Headers

**Status:** live

## Description

To update the Cash Benefit details in this tool, first execute for "getEIMAttributeList" API before proceeding with the update. and if the user update the currency field display the all currency country codes and corresponding value take.

## Signature

```
updateCashBenefitDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Description of the cash benefit
- `ctl00_body_nuamount` (number, required) — Amount of the cash benefit
- `ctl00_body_cboCurrency` (string, required) — Selected currency code (e.g., 000146 for USD) if the user currency name corresponding value take.
- `ctl00_body_dtRateEffDate_txtDate` (string, required) — Rate effective date in dd/mm/yyyy format


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
