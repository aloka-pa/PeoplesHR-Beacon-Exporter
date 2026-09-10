# submitSelfManualInAndOut

**Task:** Submit Manual In and Out when there is no existing value

**Tags:** Attendance, manual-in-out, add, Headers, phase 3

**Status:** live

## Description

Adds a Manual In and Out for the logged-in employee (self). Use it to ADD a missing In or Out time. To CHANGE a recorded time use editSelfManualInAndOut.

1. Run dateFormat first and pass the date in that format.
2. The date is checked first. Not on the Manual In and Out page: relay that and stop, do not ask for times. Already submitted: it returns alreadyExists with the recorded In/Out and useTool. Show that, say it is already submitted, and offer to change it - call the edit tool only if the user agrees.
3. Locked or non-adjustable records are refused with the reason.
4. The tool returns what is recorded, the shift and its allowed window. Ask for the missing In Time / Out Time (HH:mm) and the reason.
5. Breaks are optional - both times or neither. Break times outside the shift's allowed window are REFUSED, not warned - relay it and ask for times inside that window.
6. Show the preview as-is; call again with confirmed:true only after the user confirms. Nothing is written until then.

## Signature

```
submitSelfManualInAndOut
```

## Arguments

_None._


## Advanced arguments

- `date` (string, required) — Date to add the manual in and out for. Use the format returned by the dateFormat tool (MM/DD/YYYY for en-US, otherwise DD/MM/YYYY). Ask the user for this if not provided.
- `dateSelectMode` (unknown type, optional) — Search Criteria date selection mode, matching the page radio buttons: last7days (Last 7 Days), last30days (Last 30 Days), period (By Period, uses fromDate/toDate). Defaults to period with a wide range.
- `fromDate` (string, optional) — Search range start date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being submitted must fall inside the range.
- `toDate` (string, optional) — Search range end date in the format returned by the dateFormat tool. Only used when dateSelectMode is period. If omitted, a wide default range is used. The date being submitted must fall inside the range.
- `isGroupByEmployee` (boolean, optional) — Optional Group By Employee checkbox on the Search Criteria panel. Defaults to false.
- `rosterGroup` (string, optional) — Optional roster group id used to load the roster list via GetRostersByGroupId. Defaults to 1.
- `rosterCode` (string, optional) — Optional roster code for GetGridDataByCriteria, e.g. 000017. Defaults to 000017. Takes precedence over rosterName.
- `rosterName` (string, optional) — Optional roster name, e.g. 'Roster 1'. Resolved to a roster code against the roster list. Ignored when rosterCode is given.
- `inDate` (string, optional) — Optional In date, in the format returned by the dateFormat tool. Defaults to the In date the grid already shows for that row. Only override this if the user explicitly wants a different In date.
- `outDate` (string, optional) — Optional Out date, in the format returned by the dateFormat tool. Defaults to the Out date the grid already shows, which is the NEXT day on a midnight/overnight shift. Only override this if the user explicitly wants a different Out date.
- `inTime` (string, optional) — In time in HH:mm 24-hour format, e.g. 08:30. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip. Only needed when that day has no In time yet. If an In time already exists, this tool will not change it - use editSelfManualInAndOut.
- `outTime` (string, optional) — Out time in HH:mm 24-hour format, e.g. 17:30. Must fall inside the shift's grace window, which the tool reports as shiftPeriod/shiftToolTip. Only needed when that day has no Out time yet. If an Out time already exists, this tool will not change it - use editSelfManualInAndOut.
- `breakInTime` (string, optional) — Optional break in time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakOutTime must be given too.
- `breakOutTime` (string, optional) — Optional break out time in HH:mm 24-hour format. Break times are not mandatory - add them only if the user wants to. If given, breakInTime must be given too.
- `reason` (string, optional) — Reason/comment explaining why the manual in and out is being added. Required before the submit happens. No reason is needed for the break times on their own.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview and explicitly confirmed. Set to false (or omit) to just preview/validate without submitting anything.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
