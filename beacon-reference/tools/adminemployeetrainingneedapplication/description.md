# adminEmployeeTrainingNeedApplication

**Task:** Submitting a Training Need Application (Admin, for Any Employee)

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Lets an Admin submit a training need application on behalf of one or more employees, company-wide (no reporting-line restriction). Resolves every named employee (employees) FIRST - before anything about the need itself is required - by replicating the real 'Select Employee' modal's own org-wide search flow (TNDV9/Common/GetEmployeeSearch -> CommonComponents/Search/Search -> GetSearchList -> GetEmpNumber -> GetSearchedEmployeeDetails). Once every employee is confirmed, identify the need (existingNeedName or newNeedName/newNeedDescription) and collect objective, relevance to job, benefit to employee, and benefit to company, then runs the real validate-then-save flow (ValidateNeedApplication -> SaveNeedApplication) with reqtypecode 000007. This is a write tool - it submits real training need applications, one per named employee, on success. Draft - TNDV9/TrainingNeed/GetSearchedEmployeeDetails has not yet been captured/tested for this specific module (see description.md history).

## Signature

```
adminEmployeeTrainingNeedApplication
```

## Arguments

_None._


## Advanced arguments

- `employees` (array, required) — The employee(s) to submit this training need application for, company-wide - not restricted to any reporting line. Pass each employee exactly as the Admin named them (a name or an employee number), e.g. ["Charlotte Taylor"] or ["000012"] - do NOT resolve these yourself with any other tool first. This tool runs the same employee search the real 'Select Employee' modal uses internally, and this is checked before anything else - the moment the Admin names who the need is for, call this tool with employees set (existingNeedName/newNeedName and the narrative fields all omitted) to resolve them first. If a name matches more than one employee, the tool returns status AMBIGUOUS with the matching candidates (employee number, name, date joined, active status) - ask the Admin to be more specific (e.g. use the exact employee number) and retry. If a name matches no one, the tool returns status NOT_FOUND - resolve that before asking about the need itself or any narrative field.
- `existingNeedName` (string, optional) — The name (or partial name) of an already-existing training need category to attach this application to, e.g. 'Database & Data Management' - matches case-insensitively against the category list from getAdminTrainingNeeds' existingNeedCategories. Use this when the employee's need matches a category already on file rather than describing something new. If more than one category matches, the tool returns status AMBIGUOUS with the candidates - ask which one and retry with the exact name. Either existingNeedName or newNeedName must be provided, not both. Only required once every named employee is already confirmed to exist - do not collect or pass this on the employees-only resolution call.
- `newNeedName` (string, optional) — The requested need, in the Admin's own words, when what's needed isn't already an existing category, e.g. 'Advanced Excel Macros' (the 'Requested Need' field). Either existingNeedName or newNeedName must be provided, not both. Only required once every named employee is already confirmed to exist - do not collect or pass this on the employees-only resolution call.
- `newNeedDescription` (string, optional) — A fuller description of the new requested need (the 'Requested Need Description' field on the real form). Optional even when newNeedName is given - only used alongside newNeedName, ignored for existingNeedName.
- `objective` (string, required) — The objective of this training need. Required - the training system itself rejects a submission without this (confirmed live on the Supervisor flow: it returns 'Please specify the objective.' when blank - the same ValidateNeedApplication endpoint is used here). There is no goal-linking option here (confirmed live from a real Admin submission capture: IsGoalObject false, no ongoing-goals data) - always provide free text. Only enforced once every named employee is confirmed to exist and the need is identified - do not ask the Admin for this before that.
- `relevanceToJob` (string, required) — How this training need relates to the employee(s)' job. Required - the training system itself rejects a submission without this (confirmed live on the Supervisor flow: it returns 'Please specify the relevance to job.' when blank). Only enforced once every named employee is confirmed to exist and the need is identified - do not ask the Admin for this before that.
- `benefitToEmployee` (string, required) — The benefit of this training need to the employee(s). Required - the training system itself rejects a submission without this (confirmed live on the Supervisor flow: it returns 'Please specify the benefit to you.' when blank). Only enforced once every named employee is confirmed to exist and the need is identified - do not ask the Admin for this before that.
- `benefitToCompany` (string, required) — The benefit of this training need to the company. Required - the training system itself rejects a submission without this (confirmed live on the Supervisor flow: it returns 'Please specify the benefit to the company.' when blank). Only enforced once every named employee is confirmed to exist and the need is identified - do not ask the Admin for this before that.


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
