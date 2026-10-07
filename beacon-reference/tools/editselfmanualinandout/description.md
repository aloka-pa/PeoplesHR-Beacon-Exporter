# editSelfManualInAndOut

**Task:** Edit Manual In Time and Out Time already submitted

**Tags:** Attendance, manual-in-out, Headers, phase 3

**Status:** live

## Description

Edits a Manual In and Out of the logged-in employee (self) on the Valid Swipes tab of My Manual In and Out - a day whose In and Out are already recorded. Regularize days belong to submitSelfManualInAndOut, Off Shifts days to submitSelfOffShifts.

1. Run dateFormat first and pass every date in that format.
2. Ask the user for the date and call with it alone. Show the returned shiftDetails (shift, recorded In/Out, numbered breaks).
3. Then ALWAYS ask for In Date, In Time, Out Date, Out Time and the reason, offering the suggested (recorded) values. Breaks are optional - the user may add one or more, or change a recorded one by its breakNo. An Out Date after the In Date is normal for shifts past midnight.
4. validationError: relay the message, ask for missingFields again - not a failure. pending: relay and stop. wrongTab: call useTool with the same date. noChanges: ask what should change.
5. Show the preview; call again with confirmed:true only after the user confirms. Relay the server's message as is.

## Signature

```
editSelfManualInAndOut
```

## Arguments

_None._


## Advanced arguments

- `date` (string, required) — Date of the existing manual In and Out record to edit. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `inDate` (string, optional) — In date, in the format returned by the dateFormat tool. ALWAYS ask the user for it - together with In Time, Out Date and Out Time, all four every time, including when only the break is changing. Never assume it. The tool returns the row's own date under suggested.inDate; offer that as the default and let the user confirm or change it.
- `inTime` (string, optional) — New In time in HH:mm 24-hour format, e.g. 08:30. ALWAYS ask the user for it together with inDate, outDate and outTime - offer suggested.inTime (the recorded time) as the default and let the user confirm or change it.
- `outDate` (string, optional) — Out date, in the format returned by the dateFormat tool. ALWAYS ask the user for it together with In Date, In Time and Out Time - never decide it yourself. An Out Date on the day AFTER the In Date is normal - many shifts end after midnight - and the Out time is then earlier on the clock than the In time, which is correct and must never be questioned or rejected. The tool reports whether this shift can end on the following day as current.shiftCanEndNextDay, and returns the row's own date under suggested.outDate; offer that as the default and let the user confirm or change it.
- `outTime` (string, optional) — New Out time in HH:mm 24-hour format, e.g. 17:30. ALWAYS ask the user for it together with inDate, inTime and outDate - offer suggested.outTime (the recorded time) as the default. An Out Date on the day AFTER the In Date is normal, and the Out time is then earlier on the clock than the In time - check it against outDate, not against inTime.
- `reason` (string, optional) — Reason/comment explaining why the manual In and Out is being changed. Required before the update is submitted.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview of current vs new values and explicitly confirmed. Set to false (or omit) to just preview/validate without updating anything.
- `breaks` (array, optional) — Optional breaks - none, one or as many as the user wants. After showing the shift details, tell the user they can add breaks or change a recorded one, but do not insist. Each break needs both times, must end after it starts, must sit within the In and Out date-times and the shift's allowed period, and must not overlap another break of the day (shiftDetails.recordedBreaks lists the ones already recorded). A break after midnight is fine on a shift whose period reaches there.
- `breakInTime` (string, optional) — Single-break shorthand: break start time in HH:mm (adds a new break). Prefer the breaks list. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Single-break shorthand: break end time in HH:mm (adds a new break). Prefer the breaks list. If given, breakInTime must be given too.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Omit it to use the screen's own default.
- `rosterGroup` (string, optional) — Optional roster group, by id or name, as listed by submitSelfManualInAndOut with showRosters. Omit it to use the screen's first roster group. Do not ask the user for it unless they want a specific roster.
- `rosterCode` (string, optional) — Optional roster code. Takes precedence over rosterName. Omit it to use the first roster of the roster group, as the screen does.
- `rosterName` (string, optional) — Optional roster name. Resolved to a roster code within the roster group. Ignored when rosterCode is given.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
