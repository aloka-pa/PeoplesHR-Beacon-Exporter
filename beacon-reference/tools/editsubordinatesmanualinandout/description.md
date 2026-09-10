# editSubordinatesManualInAndOut

**Task:** Edit the previously submitted Manual In and Out times of subordinates.

**Tags:** Attendance, edit-manual-in-out, Headers, phase 3

**Status:** live

## Description

Edits an existing Manual In and Out of a team member. To ADD a missing In/Out use submitSubordinatesManualInAndOut. Only the manager's own subordinates.

1. Ask which subordinate if not given; if several match, show them and ask - never pick one.
2. Run dateFormat first and pass the date in that format.
3. The date must be in that employee's submitted Valid Swipes; if not, relay that the day was not found and stop. Locked records are refused with the reason.
4. The tool returns the current values, shift and allowed window. When both times are recorded it opens by saying the manual In and Out was already submitted - relay that. Ask for the new In Time, Out Time (HH:mm) and reason; anything omitted keeps its value.
5. Breaks are optional - both times or neither. Break times outside the shift's allowed window are REFUSED, not warned - relay it and ask for times inside that window.
6. This changes someone else's record. Show the preview and the name; call again with confirmed:true only after the user confirms.

## Signature

```
editSubordinatesManualInAndOut
```

## Arguments

_None._


## Advanced arguments

- `employeeNumber` (string, optional) — The team member's employee number, e.g. 000013. Either employeeNumber or employeeName must be provided. Leading zeros are optional.
- `employeeName` (string, optional) — The team member's name (full or partial). Either employeeNumber or employeeName must be provided. If it matches more than one person the tool asks which one - never pick for the user.
- `date` (string, required) — Date of the existing manual in and out record to edit. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Defaults to false.
- `rosterGroup` (string, optional) — Optional roster group id used to load the roster list via GetRostersByGroupId. Defaults to 1.
- `rosterCode` (string, optional) — Optional roster code for GetGridDataByCriteria, e.g. 000017. Takes precedence over rosterName. If neither is given the tool searches without a roster filter, which is what the team screen does by default.
- `rosterName` (string, optional) — Optional roster name, e.g. 'Roster 1'. Resolved to a roster code against the roster list. Ignored when rosterCode is given.
- `inDate` (string, optional) — Optional In date, in the format returned by the dateFormat tool. Defaults to the In date the grid already shows for that row. Only override this if the user explicitly wants a different In date.
- `outDate` (string, optional) — Optional Out date, in the format returned by the dateFormat tool. Defaults to the Out date the grid already shows, which is the NEXT day on a midnight/overnight shift. Only override this if the user explicitly wants a different Out date.
- `inTime` (string, optional) — New In time in HH:mm 24-hour format, e.g. 08:30. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip. Omit to keep the In time that is already recorded.
- `outTime` (string, optional) — New Out time in HH:mm 24-hour format, e.g. 17:30. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip. Omit to keep the Out time that is already recorded.
- `breakInTime` (string, optional) — Optional break in time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Optional break out time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakInTime must be given too.
- `reason` (string, optional) — Reason/comment explaining why the manual in and out is being changed. Required before the update is submitted. No reason is needed for the break times on their own.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview of current vs new values and explicitly confirmed. Set to false (or omit) to just preview/validate without updating anything.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
