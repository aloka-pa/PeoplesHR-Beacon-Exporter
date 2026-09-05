# specificPassportAndOtherArticlesDetails

**Task:** Fetching The Passport And Other Articles

**Tags:** EmployeeInfromation, Headers

**Status:** live

## Description

Before executing this API, first execute  the "getEmployeePassportAndOtherArticlesDetails" tool to fetch the user's passport and other articles options. Use the selected passport and other articles editId from that response as a payload argument for this API to then after execute in this tool generate the specific credit card details. The response from this API should then be passed to the "updateEmployeeInformationDetails" tool, which should be executed last to complete the update process.

## Signature

```
specificPassportAndOtherArticlesDetails
```

## Arguments

- `id` (string, required) — employee specific id
- `editId` (string, required) — to get edit id for "getEmployeePassportAndOtherArticlesDetails" tool user selected passport and other articles  edit id get.


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
