# specificAssignNonCashBenefitDetails

**Task:** Fetching The Assign Non Cash Benefit Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

Before executing in the API, first execute  the "getAssignNonCashBenefitToEmployeeDetails" tool to fetch the user's NonCashBenefit options. Use the selected NonCashBenefit editId from that response as a payload argument for this API to then after execute in this tool generate the specific credit card details. The response from this API should then be passed to the "updateEmployeeInformationDetails" tool, which should be executed last to complete the update process.

## Signature

```
specificAssignNonCashBenefitDetails
```

## Arguments

- `id` (string, required) — employee specific id
- `editId` (string, required) — to get edit id for "getAssignNonCashBenefitToEmployeeDetails" tool user selected passport and other articles  edit id get.


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
