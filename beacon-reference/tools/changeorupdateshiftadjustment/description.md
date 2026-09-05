# changeOrUpdateShiftAdjustment

**Task:** Update The Shift Adjustment

**Tags:** Attendance, Headers

**Status:** live

## Description

Before change in the api "changeOrUpdateShiftAdjustment" api,
- first execute the api is "getShiftAdjustmentDetails" api, get what are need details in before api data use,
- then finall execute in the api "changeOrUpdateShiftAdjustment" api.

## Signature

```
changeOrUpdateShiftAdjustment
```

## Arguments

_None._


## Advanced arguments

- `previousShiftDetails` (array, required) — Details of previously assigned shifts. Retrieved from the 'getShiftAdjustmentDetails' API. Only non-pending shifts can be updated. Pending shifts are displayed for reference. For each shift, store the abbreviation and corresponding code.
- `updateShiftDetails` (array, required) — New or updated shift details assigned to replace or update existing shifts. This is derived using scheduling modes. Each item maps a new abbreviation and its corresponding code.
- `reason` (string, required) — in this optional field,Before provide the reasons user selected reason corresponding id will be take no need to take name only id will be take
- `comment` (string, required) — in this optional field if any user given comment value will be take


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
