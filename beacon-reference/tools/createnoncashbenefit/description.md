# createNonCashBenefit

**Task:** Create NonCash Benefit

**Status:** unlive

## Description

Before Execute In this tool, first execute the ncdCategory API. to retrieve the category details. Display the available categories, and upon selection, use the corresponding category value for ncdCategory api.

## Signature

```
createNonCashBenefit
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Description or name of the non-cash benefit item.
- `ctl00_body_dpCategory` (string, required) — Selected category code for the non-cash benefit item.If the user updates the category details, use the corresponding category value when calling the getNonCashBenefitDetails API

