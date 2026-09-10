# getSelfEmployeeTrainerCourseEvaluations

**Task:** Fetching the Self Employee's Trainer & Course Evaluations

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Retrieves the logged-in employee's trainer & course evaluations - a separate evaluation track from getSelfEmployeeTraineeEvaluations (which evaluates the employee/trainee after training; this one is the employee evaluating the trainer who delivered the course, and the course itself). 
For each attended course: course name/code, schedule dates, training hours, and two separate submission statuses—trainerEvaluationStatus and courseEvaluationStatus. 
Takes no arguments - the underlying service returns every record for the logged-in employee with no filter parameter. Call getSelfEmployeeTrainerCourseEvaluationDetails next, with a scheduleId or courseName from a result here, to view one evaluation's trainer info and full course-evaluation questionnaire.

## Signature

```
getSelfEmployeeTrainerCourseEvaluations
```

## Arguments

_None._


## Advanced arguments

- `courseName` (string, optional) — Optional. A course name/description fragment (e.g. "database") to narrow the trainer & course evaluations down to matching courses - matches case-insensitively against any part of the course name. When omitted, every trainer & course evaluation is returned.


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
