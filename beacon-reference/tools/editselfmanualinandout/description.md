# editSelfManualInAndOut

**Task:** Edit Manual In Time and Out Time already submitted

**Tags:** Attendance, manual-in-out, Headers

**Status:** live

## Description

Edits an existing Manual In and Out of the logged-in employee (self). Use it to CHANGE a recorded In time, Out time or break time. Adding a missing In/Out belongs to submitSelfManualInAndOut.

1. Run dateFormat first and pass the date in that format. Ask for it if not given.
2. If the day is not in the system, tell the user and stop. If it has no In/Out recorded there is nothing to edit - use submitSelfManualInAndOut. Only Valid Swipes rows are editable; locked ones are refused.
3. The tool returns the current values, including any break on the day. When both times are recorded it opens by saying you have already submitted your manual In and Out for that date - relay that. Ask for the new In Time, Out Time (HH:mm) and reason; anything omitted keeps its value.
4. Breaks are optional - both times or neither. Break times outside the shift's allowed window are REFUSED, not warned - relay it and ask for times inside that window.
5. Show the preview; call again with confirmed:true only after the user confirms.

## Signature

```
editSelfManualInAndOut
```

## Arguments

_None._


## Advanced arguments

- `date` (string, required) — Date of the existing manual in and out record to edit. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Defaults to false.
- `rosterGroup` (string, optional) — Optional roster group id used to load the roster list via GetRostersByGroupId. Defaults to 1.
- `rosterCode` (string, optional) — Optional roster code for GetGridDataByCriteria, e.g. 000017. Defaults to 000017. Takes precedence over rosterName.
- `rosterName` (string, optional) — Optional roster name, e.g. 'Roster 1'. Resolved to a roster code against the roster list. Ignored when rosterCode is given.
- `inTime` (string, optional) — New In time in HH:mm 24-hour format, e.g. 08:30. Omit to keep the In time that is already recorded.
- `outTime` (string, optional) — New Out time in HH:mm 24-hour format, e.g. 17:30. Omit to keep the Out time that is already recorded.
- `breakInTime` (string, optional) — Optional break in time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Optional break out time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakInTime must be given too.
- `reason` (string, optional) — Reason/comment explaining why the manual in and out is being changed. Required before the update is submitted. No reason is needed for the break times on their own.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview of current vs new values and explicitly confirmed. Set to false (or omit) to just preview/validate without updating anything.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
