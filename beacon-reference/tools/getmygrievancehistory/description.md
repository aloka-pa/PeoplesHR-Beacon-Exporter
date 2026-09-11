# getMyGrievanceHistory

**Task:** Fetch My Grievance History

**Tags:** Grievance, Aloka, phase3

**Status:** live

## Description

Fetches the signed-in employee's own grievance submissions (the \"My Grievances\" tab of the Grievance History screen), optionally narrowed by date range, ground, status, and appeal-eligibility. Filtering is never mandatory. Each record includes recHeadCode, tempHeadCode, and empNumber - pass those to getMyGrievanceHistoryFullDetails or submitSelfAppealForGrievance as needed, do not ask the user for them. appealableOnly:true checks Beacon's own per-record appeal-eligibility flag rather than guessing from status text - use it whenever the user asks which grievances can be appealed.

## Signature

```
getMyGrievanceHistory
```

## Arguments

_None._


## Advanced arguments

- `fromDate` (string, optional) — Start of the date range to fetch grievance history for, formatted "DD/Mon/YYYY" with a 3-letter month name, e.g. "11/Jun/2026" - this screen does NOT use the usual D/M/YYYY format used elsewhere. Optional - omit to default to 3 months before today.
- `toDate` (string, optional) — End of the date range, same "DD/Mon/YYYY" format, e.g. "11/Sep/2026". Optional - omit to default to today.
- `ground` (string, optional) — The grievance ground/category to filter by, exactly as the user names it (e.g. "Workload"). Do not ask the user for a code - the tool resolves the name against Beacon's live grounds list itself. Omit to include all grounds.
- `status` (string, optional) — Filter by grievance status: "Pending" (not yet completed), "Resolved" (completed), or "Appealed" (an appeal was raised). Omit to include all statuses.
- `appealableOnly` (boolean, optional) — Set true when the user asks whether they can appeal, or wants only grievances eligible for appeal right now (e.g. "which grievances can I appeal", "can I submit an appeal"). Do not just list every grievance and guess from status text - not all completed/disagreed grievances are actually appeal-able (attempts remaining, appeal window, etc. are enforced server-side), so this checks Beacon's own eligibility flag per record. Omit for a normal history listing.


## Assigned agents

- Grievance Handling (`6aa374ef10cb7243bb13e6ab`)
