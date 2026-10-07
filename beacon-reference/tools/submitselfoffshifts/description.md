# submitSelfOffShifts

**Task:** Submit Off Shift Manual In and Out

**Tags:** Attendance, manual-in-out, off-shift

**Status:** live

## Description

Submits a Manual In and Out for the logged-in employee (self) on an OFF SHIFT day (off day / rest day / holiday shift) - the Off Shifts tab of My Manual In and Out. Call it for such a day, or when another Manual In and Out tool returns useTool submitSelfOffShifts.

1. Run dateFormat first and pass every date in that format.
2. Ask the user for the date and call with it alone. Show the returned shiftDetails to the user.
3. Then ALWAYS ask for In Date, In Time, Out Date, Out Time and the reason, offering the suggested values. Breaks are optional - the user may add one or more (breaks list), within the In/Out times.
4. validationError: relay the message, ask for missingFields again - not a failure. pending: relay and stop. wrongTab: call useTool with the same date.
5. ALWAYS show the preview and ask the user to confirm; call again with confirmed:true only after they say yes. Relay the server's message exactly as returned.

## Signature

```
submitSelfOffShifts
```

## Arguments

_None._


## Advanced arguments

- `date` (string, required) — The off shift day the manual In and Out is being submitted for. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `inDate` (string, optional) — In date, in the format returned by the dateFormat tool. ALWAYS ask the user for it - together with In Time, Out Date and Out Time, all four every time, even when the day already has values recorded. Never assume it. The tool returns the row's own date under suggested.inDate; offer that as the default and let the user confirm or change it.
- `inTime` (string, optional) — In time in HH:mm 24-hour format, e.g. 10:00. ALWAYS ask the user for it together with inDate, outDate and outTime, even when an In time is already recorded - offer suggested.inTime as the default.
- `outDate` (string, optional) — Out date, in the format returned by the dateFormat tool. ALWAYS ask the user for it together with In Date, In Time and Out Time - never decide it yourself. An off shift day's window can run into the following day (current.allowedTo), so an Out Date after the In Date can be correct. Offer suggested.outDate as the default.
- `outTime` (string, optional) — Out time in HH:mm 24-hour format, e.g. 18:00. ALWAYS ask the user for it together with inDate, inTime and outDate, even when an Out time is already recorded - offer suggested.outTime as the default. The Out date-time must be after the In date-time.
- `reason` (string, optional) — Reason/comment explaining why the off shift manual In and Out is being submitted. Required before the record is submitted.
- `breaks` (array, optional) — Optional breaks taken during the off shift - none, one or as many as the user wants. After showing the shift details, tell the user they can add breaks, but do not insist. Each break needs both times, must end after it starts, must sit within the In and Out date-times and the day's allowed period, and must not overlap another break of the day (shiftDetails.recordedBreaks lists the ones already recorded).
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview and explicitly confirmed. Set to false (or omit) to preview/validate without submitting anything.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Omit it to use the screen's own default.
- `rosterGroup` (string, optional) — Optional roster group, by id or name, as listed by submitSelfManualInAndOut with showRosters. Omit it to use the screen's first roster group. Do not ask the user for it unless they want a specific roster.
- `rosterCode` (string, optional) — Optional roster code. Takes precedence over rosterName. Omit it to use the first roster of the roster group, as the screen does.
- `rosterName` (string, optional) — Optional roster name. Resolved to a roster code within the roster group. Ignored when rosterCode is given.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
