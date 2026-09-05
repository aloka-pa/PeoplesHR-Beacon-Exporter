# editCurrencyType

**Task:** Editing Currency Type Details

**Tags:** EIMAdmin, NexusInformation

**Status:** live

## Description

Updates Currency Type information in the system, including currency name, currency symbol, exchange rate, and base currency status. 
The system enforces that only one base currency can exist at any given time. 
If a user attempts to set multiple currencies as base currencies, the tool will return the message, “Only 1 base currency can exist in the system.”

Also, return a small summary sentence of each argument when a user asks to edit a record.
e.g., Please specify which currency type you would like to update. You can provide either the currency code, name, or the symbol. 
Provide what you want to change: .... Then give a small summary of what is needed for each argument with a user-friendly name, e.g., Currency Symbol—not a currency symbol like "$"; it is a combination of letters, "USD."

## Signature

```
editCurrencyType
```

## Arguments

- `currencyCode` (string, optional) — The unique code identifier for the currency to update (e.g., "000008")
- `currencyName` (string, optional) — The current name of the currency to update (e.g., "Euro")
The user must provide ONE identification field and at least ONE update field.
- `currencySymbol` (string, optional) — The current symbol of the currency to update (e.g., "AUD," "USD");
NOTE: currencySymbol is not currency symbol like "$"; it is a combination of letters, "USD."
- `newCurrencyName` (string, optional) — The new name for the currency
- `newCurrencySymbol` (string, optional) — The new symbol for the currency
NOTE: currencySymbol is not currency symbol like "$"; it is a combination of letters, "USD."
- `isBaseCurrency` (string, optional) — Set as base currency - accepts string "true" or "false"
Only 1 base currency can exist in the system.
- `exchangeRate` (string, optional) — New exchange rate value to update (example: "1.12"). If the currency is set as base, the rate will be forced to "1".


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
