# UpdateDefineMasterDateDetails

**Task:** Update Define Master Date Details

**Tags:** BenefitManagement, Headers

**Status:** live

## Description

In this tool, the Define Master Data details are updated. Initially, the getDefineMasterDataDetails API is executed to retrieve existing data, which provides values for masterDataType and editKey. If any of these fields are missing, the tool re-invokes the getDefineMasterDataDetails API to fetch the necessary information. When a user updates the Define Master Data, the process begins by calling the masterDataTypes API to retrieve the available master data types. Following this, the getDefineMasterDataDetails API is executed to obtain the details for the selected type, including editKey, id, description, and amount. Once this data is retrieved, the update process proceeds accordingly.example format amount will be take Ex:3000,200,30 etc... do not allowed "3000.000".

## Signature

```
UpdateDefineMasterDateDetails
```

## Arguments

_None._


## Advanced arguments

- `masterDataType` (string, required) — Specifies the master data type. If not provided, the value will be fetched using the getDefineMasterDateDetails API.
- `editKey` (string, required) — Specifies the edit key for the data. If not provided, it will be retrieved using the getDefineMasterDateDetails API.
- `id` (string, required) — Specifies the ID of the data. If not provided, it will be retrieved using the getDefineMasterDateDetails API.
- `description` (string, required) — Specifies the currency description of the data. If changed, the updated value will be used. If not provided, it will be fetched using the getDefineMasterDateDetails API.
- `amount` (string, required) — Specifies the update amount value. If changed, the updated value will be used. If not provided, it will be fetched using the getDefineMasterDateDetails API.Ex:3000,20,20 etc..


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
