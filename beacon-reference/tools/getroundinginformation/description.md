# getRoundingInformation

**Task:** fetching rounding information

**Tags:** Attendance, Headers, Phase2, Modified

**Status:** live

## Description

Retrieves rounding pattern information including pattern name, type, rounding method, and rounding value. Can retrieve either a specific pattern by code or all available patterns with their full details.

## Signature

```
getRoundingInformation
```

## Arguments

- `patternCode` (string, optional) — The unique code identifier for the rounding pattern (e.g., "000002"). If not provided, returns all available patterns with their details.
- `patternName` (string, optional) — The full or partial name of the rounding pattern to search for (e.g., "test", "Pattern 1")


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
