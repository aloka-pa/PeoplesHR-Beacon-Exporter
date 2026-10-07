# submitSelfManualInAndOut

**Task:** Submit Manual In and Out when there is no existing value

**Tags:** Attendance, manual-in-out, add, Headers, phase 3

**Status:** live

## Description

Submits a Manual In and Out for the logged-in employee (self) on a Regularize-tab day of My Manual In and Out. Valid Swipes days belong to editSelfManualInAndOut, Off Shifts days to submitSelfOffShifts.

1. Run dateFormat first; pass every date in that format. For a date range pass fromDate/toDate without date; for rosters, showRosters:true.
2. Ask the user for the date and call with it alone. Show the returned shiftDetails to the user.
3. Then ALWAYS ask for In Date, In Time, Out Date, Out Time and the reason, offering the suggested values. Breaks are optional - the user may add one or more (breaks list). An Out Date after the In Date is normal for shifts past midnight.
4. validationError: relay the message, ask for missingFields again - not a failure. pending: relay and stop. wrongTab: call useTool with the same date.
5. Show the preview; call again with confirmed:true only after the user confirms. Relay the server's message as is.

## Signature

```
submitSelfManualInAndOut
```

## Arguments

_None._


## Advanced arguments

- `date` (string, optional) — Date the manual In and Out is being added for. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided. Leave it out only when the user just wants to see their records for a date range (pass fromDate/toDate) or the roster list (showRosters).
- `inDate` (string, optional) — In date, in the format returned by the dateFormat tool. ALWAYS ask the user for it - together with In Time, Out Date and Out Time, all four every time, even when the day already has values recorded. Never assume it. The tool returns the row's own date under suggested.inDate; offer that as the default and let the user confirm or change it.
- `inTime` (string, optional) — In time in HH:mm 24-hour format, e.g. 08:30. ALWAYS ask the user for it together with inDate, outDate and outTime, even when an In time is already recorded - offer suggested.inTime (the recorded time, if any) as the default and let the user confirm or change it.
- `outDate` (string, optional) — Out date, in the format returned by the dateFormat tool. ALWAYS ask the user for it together with In Date, In Time and Out Time - never decide it yourself. An Out Date on the day AFTER the In Date is normal - many shifts end after midnight - and the Out time is then earlier on the clock than the In time, which is correct and must never be questioned or rejected. The tool reports whether this shift can end on the following day as current.shiftCanEndNextDay, and returns the row's own date under suggested.outDate; offer that as the default and let the user confirm or change it.
- `outTime` (string, optional) — Out time in HH:mm 24-hour format, e.g. 17:30. ALWAYS ask the user for it together with inDate, inTime and outDate, even when an Out time is already recorded - offer suggested.outTime as the default. An Out Date on the day AFTER the In Date is normal, and the Out time is then earlier on the clock than the In time - check it against outDate, not against inTime.
- `reason` (string, optional) — Reason/comment explaining why the manual In and Out is being added. Required before the record is submitted.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview and explicitly confirmed. Set to false (or omit) to just preview/validate without submitting anything.
- `breaks` (array, optional) — Optional breaks - none, one or as many as the user wants. After showing the shift details, tell the user they can add breaks, but do not insist. Each break needs both times, must end after it starts, must sit within the In and Out date-times and the shift's allowed period, and must not overlap another break of the day (shiftDetails.recordedBreaks lists the ones already recorded). A break after midnight is fine on a shift whose period reaches there.
- `breakInTime` (string, optional) — Single-break shorthand: break start time in HH:mm. Prefer the breaks list. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Single-break shorthand: break end time in HH:mm. Prefer the breaks list. If given, breakInTime must be given too.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. Pass it (with toDate) when the user asks to see their manual In and Out records for a date range. If omitted, a wide default range is used. When date is given it must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. Pass it (with fromDate) when the user asks to see their manual In and Out records for a date range. If omitted, a wide default range is used. When date is given it must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Omit it to use the screen's own default.
- `showRosters` (boolean, optional) — Set to true when the user asks to see the roster details. Returns every roster group with its rosters (or only the group named in rosterGroup) and submits nothing. No date is needed.
- `rosterGroup` (string, optional) — Optional roster group, by id or name, exactly as listed by showRosters. Omit it to use the screen's first roster group. Do not ask the user for it unless they want a specific roster.
- `rosterCode` (string, optional) — Optional roster code, as listed by showRosters. Takes precedence over rosterName. Omit it to use the first roster of the roster group, as the screen does.
- `rosterName` (string, optional) — Optional roster name, as listed by showRosters. Resolved to a roster code within the roster group. Ignored when rosterCode is given.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
