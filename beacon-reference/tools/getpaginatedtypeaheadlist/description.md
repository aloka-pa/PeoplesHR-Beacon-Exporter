# getPaginatedTypeaheadList

**Task:** Employee Information

**Tags:** Attendance, Headers, ModifiedAloka

**Status:** live

## Description

Determines the query type based on the user's request. For example, if the user asks about "attendance in and out," "team attendance," "team shift adjustment," or "attendance summary," "team attendance in and out," "shift adjustment," "prior overtime application," "team attendance approval," "attendance approval," etc., the system will automatically identify the query type as "attendance summary" for attendance-related summaries and "team attendance" for team-related summaries. The query type is determined based on the specific context of the user's request without any confusion.

## Signature

```
getPaginatedTypeaheadList
```

## Arguments

_None._


## Advanced arguments

- `empId` (string, required) — Specifies the employee ID, for example, 'A00006' or '000013'.
- `type` (string, required) — Determines the type of query. The value is chosen based on the user's request. For instance, if the user requests 'give me the team attendance for 000003', the value selected would be 'team attendance'.


## Assigned agents

- Attendance (`690dc571931a2d61ba0b1bcd`)
