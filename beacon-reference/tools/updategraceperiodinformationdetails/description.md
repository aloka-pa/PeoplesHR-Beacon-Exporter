# updateGracePeriodInformationDetails

**Task:** Update The Grace Period Information

**Tags:** Attendance, Headers

**Status:** live

## Description

Before update for grace period information details.must and should be first execute for "getAttendanceModule" tool. to get edit data and if the user update any field for example rounding pater and previous grace period user update name corresponding value will be take. if the user to update fields first ask for the user grace code only do not ask for grace name or other.

## Signature

```
updateGracePeriodInformationDetails
```

## Arguments

- `garcePeriodName` (string, required) — to get the grace period name if the user update to get the human update value if the user not update take before api data corresponding value will be take example "hello123"
- `roundingPattern` (string, required) — to get the grace rounding Pattern if the user update to get the human update value if the user not update take before api data corresponding value will be take name corresponding value will be take example "000010"
- `previousGracePeriod` (string, required) — to get the grace previous Grace Period if the user update to get the human update value if the user not update take before api data corresponding value will be take name corresponding value will be take example "000010"
- `duration` (string, required) — if the user update will be take update value other then previous value take example "5" etc..


## Advanced arguments

_None._


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
