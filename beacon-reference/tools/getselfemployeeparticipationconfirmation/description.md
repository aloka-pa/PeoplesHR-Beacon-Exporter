# getSelfEmployeeParticipationConfirmation

**Task:** Fetching Pending Participation Confirmations

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Retrieves the logged-in employee's pending and confirmed training participation confirmations from the Participation Confirmation (Training Services - Applicant) page: for pending items - course title/code, schedule start/end dates, confirm-before (cutoff) date, days left, training hours, venue, per-day schedule (date/start-end time/venue/resource person), expected learning, and remarks; for confirmed items - course title/code, schedule start/end dates, cutoff date, and days left. Supports narrowing both lists by keyword (course title/code substring match). Once a pending item is identified, selfEmployeeParticipationConfirmation is the follow-up tool to actually confirm or reject it.

## Signature

```
getSelfEmployeeParticipationConfirmation
```

## Arguments

_None._


## Advanced arguments

- `keyword` (string, optional) — Optional. A course name/title or course code fragment (e.g. "devops" or "000115") to narrow both the pending and confirmed participation confirmations down to matching courses - matches case-insensitively against any part of the course title or course code. When omitted, every pending and confirmed record is returned.


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
