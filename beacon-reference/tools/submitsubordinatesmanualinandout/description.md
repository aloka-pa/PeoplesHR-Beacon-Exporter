# submitSubordinatesManualInAndOut

**Task:** Submit Subordinates' Manual In And Out by Supervisor

**Tags:** Attendance, manual-in-out, Headers, SupervisoryOperations

**Status:** live

## Description

Adds a Manual In and Out for a direct subordinate. To CHANGE a recorded time use editSubordinatesManualInAndOut. Restricted to the manager's own subordinates.

1. Run dateFormat first and pass the date in that format.
2. Ask which subordinate if not given; if several match, show them and ask - never pick one.
3. The date is checked first. Not on the Manual In and Out page: relay that and stop, do not ask for times. Already submitted: it returns alreadyExists with the recorded In/Out and useTool. Show that, say it is already submitted, and offer to change it - call the edit tool only if the user agrees.
4. Locked records are refused with the reason.
5. Ask for the missing In/Out Time (HH:mm) and a reason, always required. Ask once about a break; if yes collect both breakInTime and breakOutTime.
6. Break times outside the shift's allowed window are REFUSED, not warned - relay it and ask for times inside that window.
7. Show the preview as-is; call again with confirmed:true only after the user confirms.

## Signature

```
submitSubordinatesManualInAndOut
```

## Arguments

_None._


## Advanced arguments

- `employeeNumber` (string, optional) — The subordinate's employee number, e.g. 000013. Either employeeNumber or employeeName must be provided.
- `employeeName` (string, optional) — The subordinate's name (full or partial). Either employeeNumber or employeeName must be provided.
- `date` (string, required) — Date to add/check manual in and out for, in the format returned by the dateFormat tool (DD/MM/YYYY, or MM/DD/YYYY for en-US). Ask the user for this if not provided.
- `inTime` (string, optional) — In time in HH:mm 24-hour format. Only required if not already present on the record for that date.
- `outTime` (string, optional) — Out time in HH:mm 24-hour format. Only required if not already present on the record for that date.
- `breakInTime` (string, optional) — Optional break in time in HH:mm 24-hour format.
- `breakOutTime` (string, optional) — Optional break out time in HH:mm 24-hour format.
- `reason` (string, optional) — Reason/comment explaining why the manual in and out is being added. Always required before submission. No need reason for breakInTime and breakOutTime.
- `confirmed` (boolean, optional) — Set to true only after the user has reviewed the preview and explicitly confirmed the data is correct. Set to false (or omit) to just preview/validate without submitting.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
