# getSelfEmployeeTraineeEvaluationDetails

**Task:** Fetching Full Detail for Self Employee's Trainee Evaluation

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Retrieves the full detail (stage info and the complete questionnaire, question-by-question, with any answers already on file) for one of the logged-in employee's trainee evaluations - the \"view details\" drill-down from getSelfEmployeeTraineeEvaluations. 
Always call getSelfEmployeeTraineeEvaluations first to identify which evaluation (appId + scheduleId, or courseName) to view. 
Returns evaluation name (e.g. \"3 Months\"), evaluation date, stage/status, employee and supervisor submission status, supervisor comments, marks, and every question with its answer (direct-answer text/rating, or the selected MCQ option with its description and marks) and, for MCQ questions, the full list of rating options. Read-only - viewing or completing an evaluation questionnaire through this assistant is out of scope; submission is excluded entirely.

## Signature

```
getSelfEmployeeTraineeEvaluationDetails
```

## Arguments

_None._


## Advanced arguments

- `courseName` (string, optional) — The course name (or partial name) the employee mentioned, e.g. "Database & Data Management". Matches case-insensitively against the employee's own trainee evaluations - do not resolve this to an appId/scheduleId yourself first; pass the course name directly and let this tool resolve it. Either courseName, or both appId and scheduleId, must be provided. If more than one evaluation matches, the tool returns status AMBIGUOUS with a list of candidates - ask the employee to pick one and retry with appId and scheduleId.
- `appId` (string, optional) — The application ID of the trainee evaluation to view, when already known (e.g. carried over from getSelfEmployeeTraineeEvaluations, or from a prior AMBIGUOUS response from this same tool). Must be provided together with scheduleId - either that pair, or courseName, is required.
- `scheduleId` (string, optional) — The schedule ID of the trainee evaluation to view, when already known (e.g. carried over from getSelfEmployeeTraineeEvaluations, or from a prior AMBIGUOUS response from this same tool). Must be provided together with appId - either that pair, or courseName, is required.


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
