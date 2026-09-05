# getDefineMasterDateDetails

**Task:** Define Master DateDetails

**Tags:** BenefitManagement, Headers

**Status:** live

## Description

Before executing in this tool, first call the "masterDataTypes" API to retrieve the available data types. Then extract the values for masterDataType, masterDataTypeIndex, and masterDataTypeValue. If the user attempts to update a master data type or any thing, check if any data types are available. If none are found, display a message stating, "No available data types."

## Signature

```
getDefineMasterDateDetails
```

## Arguments

_None._


## Advanced arguments

- `masterDataType` (string, required) — if the user select for master data type to get the all master data reimbursement for 'masterDataTypes' api Example 'Basic Plan' etc. 
- `masterDataTypeIndex` (integer, required) — if the user select for master data type corresponding type index will be take to get the all master data reimbursement for 'masterDataTypes' api Example '1','2 etc..
- `masterDataTypeValue` (integer, required) — if the user select for master data type corresponding type index will be take to get the all master data reimbursement for 'masterDataTypes' api Example 'P30003','P30002' etc..


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
