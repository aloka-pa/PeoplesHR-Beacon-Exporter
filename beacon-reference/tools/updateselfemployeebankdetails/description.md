# updateSelfEmployeeBankDetails

**Task:** Update The Self Employee Bank Details

**Tags:** Employee Information

**Status:** draft

## Description

Before updating Self Employee Bank Details:
1.First, call the selfEmployeeBankDetails API to fetch the bank details details and identify any missing any required fields. will using field corresponding value.
2.If some fields are not updated, note that Bank Name,Branch Name and  Account Number are hidden fields and cannot be modified. remaining following fields are update.
3. before provide the date in user, first execute date format api then get date format. Ex : "29/08/2025"
Finally, update the employee’s Bank Details details with the allowed fields.

## Signature

```
updateSelfEmployeeBankDetails
```

## Arguments

- `nameGivenToTheBank` (string, required) — If the user updates the nameGivenToTheBank field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained.
- `currenCode` (string, required) — If the user updates the currency name corresponding code will be take field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained. Ex:-"000082"
- `accountTypeName` (string, required) — If the user updates the account TypeName field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained.
- `accountTypeCode` (string, required) — If the user updates the account type name corresponding code will be take field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained. Ex:-"0"
- `comments` (string, required) — If the user updates the comments or remarks field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained. in the field is optional.
- `amountOrPercentage` (string, required) — If the user updates the Amount Or Percentage field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained. if the user change amount to percentage below 100 amount provide.
- `order` (string, required) — before api response check if the same order dont accept, user consent order number will be change.
- `startDate` (string, required) — If the user updates the startDate field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained.before update the date first execute date format api, use response date format.
- `endDate` (string, required) — If the user updates the endDate field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained.before update the date first execute date format api, use response date format.


## Advanced arguments

_None._

