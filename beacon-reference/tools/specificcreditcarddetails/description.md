# specificCreditCardDetails

**Task:** Fetching The Credit Card Details

**Tags:** EmployeeInfromation, Headers

**Status:** live

## Description

Before executing this API, first run the "getEmployeeCreditCardDetails" tool to fetch the user's credit card options. Use the selected card's editId from that response as a payload argument for this API to then after execute in this tool generate the specific credit card details. The response from this API should then be passed to the "updateEmployeeInformationDetails" tool, which should be executed last to complete the update process.

## Signature

```
specificCreditCardDetails
```

## Arguments

- `id` (string, required) — employee specific id
- `editId` (string, required) — to get edit id for "getEmployeeCreditCardDetails" tool user selected card edit id get.


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
