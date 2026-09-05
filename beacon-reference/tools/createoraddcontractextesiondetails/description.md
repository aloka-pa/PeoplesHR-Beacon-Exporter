# createOrAddContractExtesionDetails

**Task:** adding Contract Extesion  Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

If the user intends to update or change the contract extension for self, admin, or any related queries, begin by executing the 'getAllEmployeeInformationDetails' tool to verify whether the employee's employment type is 'contract' or 'Temporary'. If confirmed, proceed to call the 'createOrAddContractExtensionDetails' tool. If not, return: "The employee is not eligible for contract extension." Prior to invoking the 'createOrAddContractExtensionDetails' API, it is mandatory to call the 'getContractExtensionDetails' API to fetch the last contract extension records. When adding a new extension, ensure the new Contract Extension Commencement Date is strictly greater than the Previous last Contract Extension Termination Date. If the new date is earlier than or equal to the previous end date, return: "Contract Extension Commencement Date must be greater than the Previous Contract Extension Termination Date." Invalid date entries should trigger an error and halt the process. must and should ask extension dates.

## Signature

```
createOrAddContractExtesionDetails
```

## Arguments

- `StartDate` (string, required) — StartDate , Ex:- "14/10/2027" , format must be in the DD/MM/YYYY".
- `EndDate` (string, required) — EndDate ,   Ex:- "13/12/2027" ,  format must be in the DD/MM/YYYY".


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
