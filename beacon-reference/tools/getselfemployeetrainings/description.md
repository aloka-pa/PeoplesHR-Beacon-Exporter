# getSelfEmployeeTrainings

**Task:** Fetching Training Details

**Tags:** T&D, Aloka, 26R2

**Status:** live

## Description

Retrieves the open course schedules available on the logged-in employee's Apply for Training page: course name, description, schedule (date/time/venue/resource person), application cut-off date, participation confirmation cut-off date, seat availability, attachment presence, objective/relevance/benefit narrative fields, and course subjects/qualifications/related needs/closure steps/sponsors. Supports narrowing by courseName (substring match) and/or scheduleId.

## Signature

```
getSelfEmployeeTrainings
```

## Arguments

- `courseName` (string, optional) — Optional. A course name or partial course name (e.g. \"Test Course\") to search for - matches case-insensitively against any part of the course name. Use this when the user names a course but doesn't know its schedule ID.
- `scheduleId` (string, optional) — Optional. A specific schedule ID (e.g. from a course previously listed via getTrainingCalendarCourseDetails, or from a prior call to this tool) to view full details for one training. When omitted, all schedules matching courseName (or all available s


## Advanced arguments

_None._


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
