# getMyAppealHistory

**Task:** Fetch My Grievance Appeal History

**Tags:** Grievance, Aloka, phase3

**Status:** live

## Description

Fetches the signed-in employee's own grievance appeals (the \"Appeal History\" tab of the Grievance History screen) for a date range, optionally narrowed by ground and status, defaulting to 1st January of the current year through today when no dates are given. Filtering is never mandatory. Each result is itself a grievance-shaped record (the appeal, not the original grievance) and includes originalGrievanceRecHeadCode plus attemptsUsed/attemptsAllowed. Each record also includes recHeadCode, tempHeadCode, and empNumber - pass those straight through to getMyGrievanceHistoryFullDetails (do not ask the user for them) if the user wants more detail, status, or feedback on a specific appeal.

## Signature

```
getMyAppealHistory
```

## Arguments

_None._


## Advanced arguments

- `fromDate` (string, optional) — Start of the date range to fetch appeal history for, formatted "DD/Mon/YYYY" with a 3-letter month name, e.g. "01/Jan/2026" - same non-standard format as getMyGrievanceHistory, NOT the usual D/M/YYYY format used elsewhere. Optional - omit to default to 1st January of the current year.
- `toDate` (string, optional) — End of the date range, same "DD/Mon/YYYY" format, e.g. "11/Sep/2026". Optional - omit to default to today.
- `ground` (string, optional) — The grievance ground/category to filter by, exactly as the user names it (e.g. "Workload"). Do not ask the user for a code - the tool resolves the name against Beacon's live grounds list itself. Omit to include all grounds.
- `status` (string, optional) — Filter by appeal status: "Pending" (not yet completed) or "Resolved" (completed). There is no "Appealed" option here since every record from this tool is already an appeal. Omit to include all statuses.


## Assigned agents

- Grievance Handling (`6aa374ef10cb7243bb13e6ab`)
