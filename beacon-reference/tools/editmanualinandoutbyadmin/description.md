# editManualInAndOutByAdmin

**Task:** Edit Manual In and Out entries by an Admin on behalf of an employee.

**Tags:** Attendance, manual-in-out, Admin

**Status:** live

## Description

Edits an existing Manual In and Out of any employee an admin can access. To ADD a missing In/Out use submitManualInAndOutBySAdmin.

1. Ask which employee if not given; if several match, show them and ask - never pick one.
2. Run dateFormat first and pass the date in that format.
3. The day must have a time recorded and not be locked, or the tool says why - relay that and stop.
4. It returns the current In/Out, break, shift and allowed window. When both times are recorded it opens by saying the manual In and Out was already submitted - relay that. Ask for the new In Time, Out Time (HH:mm) and reason; anything omitted keeps its value.
5. Warnings (In/Out outside the window, pending approval, on leave) are not refusals - relay them.
6. Breaks are optional - both times or neither. Break times outside the shift's allowed window are REFUSED, not warned - relay it and ask for times inside that window.
7. Changes someone else's record. Show the preview; call again with confirmed:true only after the user confirms.

## Signature

```
editManualInAndOutByAdmin
```

## Arguments

_None._


## Advanced arguments

- `employeeNumber` (string, optional) — The employee's number as it is shown on screen, e.g. 000031. Either employeeNumber or employeeName must be provided. Leading zeros are optional. Note that some employees share a displayed number - the tool then asks which one rather than picking.
- `employeeName` (string, optional) — The employee's name (full or partial). Either employeeNumber or employeeName must be provided. If it matches more than one person the tool asks which one - never pick for the user.
- `date` (string, required) — Date of the existing record to edit. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being edited must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Defaults to false.
- `rosterGroup` (string, optional) — Optional roster group id used to load the roster list via GetRostersByGroupId. Defaults to 1.
- `rosterCode` (string, optional) — Optional roster code for GetGridDataByCriteria, e.g. 000005 for 'Roster 1'. Takes precedence over rosterName. If neither is given the tool uses 000017 ('Default Yes'), which is the roster the admin screen pre-selects.
- `rosterName` (string, optional) — Optional roster name, e.g. 'Roster 1'. Resolved to a roster code against the roster list. Ignored when rosterCode is given.
- `inDate` (string, optional) — Optional new In date, in the format returned by the dateFormat tool. Defaults to the In date the grid already shows for that row. Only override this if the user explicitly wants a different In date.
- `outDate` (string, optional) — Optional new Out date, in the format returned by the dateFormat tool. Defaults to the Out date the grid already shows, which is the NEXT day on a midnight/overnight shift. Only override this if the user explicitly wants a different Out date.
- `inTime` (string, optional) — New In time in HH:mm 24-hour format, e.g. 08:30. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip. Omit to keep the In time that is already recorded.
- `outTime` (string, optional) — New Out time in HH:mm 24-hour format, e.g. 17:30. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip. Omit to keep the Out time that is already recorded.
- `breakInTime` (string, optional) — Optional new break in time in HH:mm 24-hour format. Break times are not mandatory - give them only if the user wants the break changed or added. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Optional new break out time in HH:mm 24-hour format. Break times are not mandatory - give them only if the user wants the break changed or added. If given, breakInTime must be given too.
- `reason` (string, optional) — Reason/comment explaining why the manual in and out is being changed. Required before the update is submitted. No reason is needed for the break times on their own.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview of current vs new values and explicitly confirmed. Set to false (or omit) to just preview/validate without updating anything.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
