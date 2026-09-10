# getSelfEmployeeTrainerCourseEvaluationDetails

**Task:** Fetching Full Details for Employee's Trainer & Course Evaluations

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Retrieves the trainer info and full course-evaluation questionnaire (question-by-question, with any answers already on file) for one of the logged-in employee's trainer & course evaluations - the \"view details\" drill-down from getSelfEmployeeTrainerCourseEvaluations. 
Always call that tool first if the scheduleId is not already known - this tool re-resolves the record itself (by scheduleId or courseName), it does not accept raw record data as arguments. Returns the trainer(s) who delivered the course, and the course evaluation's submission status, supervisor comments, marks, and every question with its answer (direct-answer text/rating, or the selected MCQ option with its description and marks) plus, for MCQ questions, the full list of rating options. 
Read-only - no trainer-specific questionnaire is confirmed to exist separately from the course one; viewing or completing any evaluation questionnaire through this assistant is out of scope, submission is excluded entirely.

## Signature

```
getSelfEmployeeTrainerCourseEvaluationDetails
```

## Arguments

_None._


## Advanced arguments

- `scheduleId` (string, optional) — The schedule ID of the trainer & course evaluation to view, when already known (e.g. carried over from getSelfEmployeeTrainerCourseEvaluations, or from a prior AMBIGUOUS response from this same tool). Either scheduleId or courseName must be provided - prefer courseName when the employee only named a course, since this tool resolves the schedule itself.
- `courseName` (string, optional) — The course name (or partial name) the employee mentioned, e.g. 'Test Course activity 1'. Matches case-insensitively against the employee's own trainer & course evaluations - do not resolve this to a scheduleId yourself first; pass the course name directly and let this tool resolve it. Either scheduleId or courseName must be provided. If more than one evaluation matches, the tool returns status AMBIGUOUS with a list of candidates (each with its own scheduleId) - ask the employee to pick one and retry with scheduleId.


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
