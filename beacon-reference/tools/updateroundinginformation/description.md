# updateRoundingInformation

**Task:** updateRoundingInformation

**Tags:** Attendance, Headers

**Status:** live

## Description

"Before calling the "updateRoundingInformation" api, ensure that you first call the "getRoundingInformation" api. If the user intends to update the rounding information, begin by asking for their consent using the follow-up pattern code. Additionally, if the user provides the pattern name and pattern type for the update, prompt them to provide the pattern code first."

## Signature

```
updateRoundingInformation
```

## Arguments

_None._


## Advanced arguments

- `roundingPatternName` (string, required) — The name of the rounding pattern (e.g., 'Beacon')
- `pattern` (string, required) — The rounding pattern type
- `method` (string, optional) — Specifies the rounding method: Roundup (1), RoundDown (2), or Nearest (3). Only these values are accepted.
- `numVal` (string, optional) — The rounding value time (used in General pattern) if the change the genral compulsary take this value ask user consent and does not take user special characters 
- `numFrom` (string, optional) — The start time of the range (used in Range pattern) Range value must be a value between From and To values and must not be the same value and does not take user special characters.
- `numTo` (string, optional) — The end time of the range (used in Range pattern) Range value must be a value between From and To values and must not be the same value and does not take user special characters.
- `textnumValue` (string, optional) — The value applied for the range (used in Range pattern) and does not take user special characters and be text numValue in between start time of the range to end time of the range


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
