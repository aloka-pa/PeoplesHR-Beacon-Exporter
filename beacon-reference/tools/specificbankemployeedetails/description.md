# specificBankEmployeeDetails

**Task:** Fetching The Bank Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

in this tool generate the specific Bank Employee Details. before execute in this api first execute the "getEmployeeBankDetails" tool. to generate user select bank details and to get specific bank edit id use in this api payload argument then generate the bank details. this api  response then use for "updateEmployeeInformationDetails" tool. then final execute for "updateEmployeeInformationDetails" tool. if the user any change order number ask to the user "The Order must not be duplicate" and if the user update no key fields update return the no field in this bank employee details.

## Signature

```
specificBankEmployeeDetails
```

## Arguments

- `id` (string, required) — to give the employee id
- `editId` (string, required) — to get edit id for "getEmployeeBankDetails" tool user selected bank edit id get.


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
