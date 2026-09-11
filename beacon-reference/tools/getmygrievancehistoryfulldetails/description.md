# getMyGrievanceHistoryFullDetails

**Task:** Fetch Full Details, Status, and Feedback for a Grievance

**Tags:** Grievance, Aloka, phase3

**Status:** live

## Description

Given one grievance record already returned by getMyGrievanceHistory, fetches everything about it in one call: the full application details (comment, submitted date, emoji rating, appeal eligibility), the per-channel-member handling status at each escalation level, and any feedback comments left by channel members. This tool has no name/search argument - if the user refers to the grievance by name, first call getMyGrievanceHistory, match the name/comment fields in its results against what the user said, then take recHeadCode, tempHeadCode, and empNumber from the matched record. Never ask the user for these three values directly.

## Signature

```
getMyGrievanceHistoryFullDetails
```

## Arguments

_None._


## Advanced arguments

- `recHeadCode` (string, required) — The recHeadCode of the grievance to fetch details for. Never ask the user for this and never accept a grievance name/title here - this tool has no search-by-name capability. If the user refers to the grievance by name (e.g. 'abcd'), first call getMyGrievanceHistory, match the user's wording against each result's name/comment fields, and take recHeadCode from the matched record.
- `tempHeadCode` (string, required) — The tempHeadCode of the same grievance, taken from the same getMyGrievanceHistory result as recHeadCode. Do not ask the user for this.
- `empNumber` (string, required) — The (encrypted) empNumber of the same grievance, taken from the same getMyGrievanceHistory result as recHeadCode. Do not ask the user for this.


## Assigned agents

- Grievance Handling (`6aa374ef10cb7243bb13e6ab`)
