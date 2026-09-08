# supervisorSubordinateTrainingNeedApplication

**Task:** Submitting a Training Need Application (Supervisor, for Subordinates)

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Lets a Supervisor submit a training need application on behalf of one or more direct reports at once - either attaching it to an already-existing need category (existingNeedName) or describing a brand new one (newNeedName/newNeedDescription). Validates every named subordinate (subordinates) against the live direct-report list before submitting, and collects objective, relevance to job, benefit to employee, and benefit to company, then runs the real validate-then-save flow (ValidateNeedApplication -> SaveNeedApplication). This is a write tool - it submits real training need applications, one per selected subordinate, on success.

## Signature

```
supervisorSubordinateTrainingNeedApplication
```

## Arguments

_None._


## Advanced arguments

- `subordinates` (array, required) — One or more direct reports (each a name or employee number) to submit this training need application for, e.g. ['John Silva'] or ['000010','000011']. Matches each entry first by exact employee number, then by a case-insensitive substring match against name, against the supervisor's live subordinate list. At least one is required. If any entry doesn't match exactly one subordinate, the tool returns NOT_SUBORDINATE or AMBIGUOUS (whichever applies) listing every problem entry plus eligibleSubordinates - fix all of them and retry rather than resubmitting one at a time.
- `existingNeedName` (string, optional) — The name (or partial name) of an already-existing training need category to attach this application to, e.g. 'Database & Data Management' - matches case-insensitively against the category list from getSupervisorTrainingNeeds' existingNeedCategories. Use this when the subordinate's need matches a category already on file (UAC 3.2) rather than describing something new. If more than one category matches, the tool returns status AMBIGUOUS with the candidates - ask which one and retry with the exact name. Either existingNeedName or newNeedName must be provided, not both.
- `newNeedName` (string, optional) — The requested need, in the supervisor's own words, when what's needed isn't already an existing category, e.g. 'Advanced Excel Macros' (UAC 3.3 - the 'Requested Need' field). Either existingNeedName or newNeedName must be provided, not both.
- `newNeedDescription` (string, optional) — A fuller description of the new requested need (the 'Requested Need Description' field on the real form). Optional even when newNeedName is given - only used alongside newNeedName, ignored for existingNeedName.
- `objective` (string, required) — The objective of this training need. Required - the training system itself rejects a submission without this (confirmed live: 'Please specify the objective.'). Unlike the self-application tool, there is no goal-linking option here (confirmed live: a real multi-subordinate submission sent IsGoalObject false with no ongoing-goals data at all) - always provide free text.
- `relevanceToJob` (string, required) — How this training need relates to the subordinate(s)' job. Required - the training system itself rejects a submission without this (confirmed live: 'Please specify the relevance to job.').
- `benefitToEmployee` (string, required) — The benefit of this training need to the employee(s). Required - the training system itself rejects a submission without this (confirmed live: 'Please specify the benefit to you.').
- `benefitToCompany` (string, required) — The benefit of this training need to the company. Required - the training system itself rejects a submission without this (confirmed live: 'Please specify the benefit to the company.').


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
