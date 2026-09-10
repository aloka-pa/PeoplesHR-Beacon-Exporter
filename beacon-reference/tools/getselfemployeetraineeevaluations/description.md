# getSelfEmployeeTraineeEvaluations

**Task:** Fetching Self Employee's Trainee Evaluations

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Retrieves the logged-in employee's trainee evaluations (post-training evaluations tied to attended courses): course name/code, schedule dates, training hours, evaluation month, and submission status (Pending/Awaiting Supervisor/Completed) for both the employee's and supervisor's side. 
Supports narrowing by courseName (substring match).
Call getSelfEmployeeTraineeEvaluationDetails next, with the appId/scheduleId from a result here, to view one evaluation's full stage/questionnaire detail.

## Signature

```
getSelfEmployeeTraineeEvaluations
```

## Arguments

- `courseName` (string, required) — Optional. A course name/description fragment (e.g. \"database\") to narrow the trainee evaluations down to matching courses - matches case-insensitively against any part of the course name. Else return all pending, completed trainee evaluations.


## Advanced arguments

_None._


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
