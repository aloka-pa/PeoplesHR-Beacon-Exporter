# updateNonCashBenefitDetails

**Task:** Update NonCash BenefitDetails

**Tags:** EIM, Headers

**Status:** live

## Description

In this tool, must and should be first execute for "getEIMAttributeList" API. then after execute in this tool.If the user updates the category details, use the corresponding category value when calling the getEIMAttributeList API.

## Signature

```
updateNonCashBenefitDetails
```

## Arguments

_None._


## Advanced arguments

- `ctl00_body_txtName` (string, required) — Description or name of the non-cash benefit item.
- `ctl00_body_dpCategory` (string, required) — Selected category code for the non-cash benefit item.If the user updates the category details, use the corresponding category value when calling the getNonCashBenefitDetails API


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
