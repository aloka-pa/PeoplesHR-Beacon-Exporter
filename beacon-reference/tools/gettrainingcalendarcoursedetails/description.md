# getTrainingCalendarCourseDetails

**Task:** Fetching Training Calendar Course Details

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Retrieves scheduled training course entries from the Training Calendar, including course name, schedule dates, seat availability, application cut-off date, and approval status. Supports filtering by a specific course, by approval status (Approved/Pending), and by a specific date - covering "view available trainings" and "view trainings on a specific date".


## Signature

```
getTrainingCalendarCourseDetails
```

## Arguments

- `courseCode` (string, optional) — The course code to filter the training calendar by (e.g. `"000070"`). Use `"-1"` to retrieve all courses.
- `status` (string, optional) — Approval status filter for the schedules
- `date` (string, optional) — Specific date in `YYYY-MM-DD` format. When provided, only training schedules occurring on that date are returned.


## Advanced arguments

_None._


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
