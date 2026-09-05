# submitManualInAndOutByAdmin

**Task:** Submit Manual In and Out entries by an Admin on behalf of an employee.

**Tags:** Attendance, manual-in-out, Admin

**Status:** live

## Description

Adds a Manual In and Out for any employee an admin can access. Subordinates go through submitSubordinatesManualInAndOut, the admin's own via submitSelfManualInAndOut.

1. Ask which employee if not given; if several match, show them and ask - never pick one.
2. Run dateFormat first and pass the date in that format.
3. The date is checked first. Not on the Manual In and Out page, or locked: relay the reason and stop, do not ask for times. Already submitted: it returns alreadyExists with the recorded In/Out and useTool. Show that, say it is already submitted, and offer to change it - call the edit tool only if the user agrees.
4. Ask for the missing In/Out Time (HH:mm) and a reason, always required. Ask once about a break; if yes collect both breakInTime and breakOutTime.
5. Break times outside the shift's allowed window are REFUSED, not warned - relay it and ask for times inside that window.
6. This writes to someone else's record. Show the preview; call again with confirmed:true only after the user confirms.

## Signature

```
submitManualInAndOutByAdmin
```

## Arguments

_None._


## Advanced arguments

- `employeeNumber` (string, optional) — The employee's number as it is shown on screen, e.g. 000013. Either employeeNumber or employeeName must be provided. Leading zeros are optional. Note that some employees share a displayed number - the tool then asks which one rather than picking.
- `employeeName` (string, optional) — The employee's name (full or partial). Either employeeNumber or employeeName must be provided. If it matches more than one person the tool asks which one - never pick for the user.
- `date` (string, required) — Date to add the manual in and out for. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being submitted must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being submitted must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Defaults to false.
- `rosterGroup` (string, optional) — Optional roster group id used to load the roster list via GetRostersByGroupId. Defaults to 1.
- `rosterCode` (string, optional) — Optional roster code for GetGridDataByCriteria, e.g. 000005 for 'Roster 1'. Takes precedence over rosterName. If neither is given the tool uses 000017 ('Default Yes'), which is the roster the admin screen pre-selects.
- `rosterName` (string, optional) — Optional roster name, e.g. 'Roster 1'. Resolved to a roster code against the roster list. Ignored when rosterCode is given.
- `inDate` (string, optional) — Optional In date, in the format returned by the dateFormat tool. Defaults to the In date the grid already shows for that row. Only override this if the user explicitly wants a different In date.
- `outDate` (string, optional) — Optional Out date, in the format returned by the dateFormat tool. Defaults to the Out date the grid already shows, which is the NEXT day on a midnight/overnight shift. Only override this if the user explicitly wants a different Out date.
- `inTime` (string, optional) — In time in HH:mm 24-hour format, e.g. 08:30. Only required if no In time is already recorded on that date. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip.
- `outTime` (string, optional) — Out time in HH:mm 24-hour format, e.g. 17:30. Only required if no Out time is already recorded on that date. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip.
- `breakInTime` (string, optional) — Optional break in time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Optional break out time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakInTime must be given too.
- `reason` (string, optional) — Reason/comment explaining why the manual in and out is being added for this employee. Always required before submission. No reason is needed for the break times on their own.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview and explicitly confirmed the data is correct. Set to false (or omit) to just preview/validate without submitting.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
