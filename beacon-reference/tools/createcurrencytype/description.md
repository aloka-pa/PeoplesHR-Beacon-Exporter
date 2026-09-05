# createCurrencyType

**Task:** Creating New Currency Type Record

**Tags:** EIMAdmin, Nexus Information

**Status:** live

## Description

Creates a new currency type in the system with name, symbol, base currency status, and exchange rate.

When isBaseCurrency is set to "true", the system automatically sets the exchange rate to 1
Changing the base currency affects all currency calculations system-wide and requires explicit confirmation
If not setting as base currency, user can provide an exchangeRate value

## Signature

```
createCurrencyType
```

## Arguments

- `currencyName` (string, required) — The name of the new currency (e.g., "Australian Dollar")
- `currencySymbol` (string, required) — The symbol for the new currency (e.g., "AUD", "USD")
NOTE: currencySymbol is not currency symbol like "$"; it is a combination of letters "USD."
- `isBaseCurrency` (string, optional) — Set as base currency - accepts string "true" or "false" (default: "false")
- `exchangeRate` (string, optional) — The exchange rate value relative to base currency (e.g., "1.45"). Not needed if isBaseCurrency is "true"
- `confirmBaseChange` (string, optional) — Required if isBaseCurrency is "true"
Must be set to "true" to confirm changing the base currency


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
