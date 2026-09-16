# selfEmployeeBenefitApllication

**Task:** Self Employee Benefit Application

**Tags:** Benefits, Aloka, phase3

**Status:** live

## Description

Applies for an employee benefit on behalf of the signed-in employee, for any benefit type configured in Beacon - not hardcoded to a fixed list. Call with benefitType omitted to get the real, live list of benefit types. Once resolved, call again with fieldValues omitted to get that benefit type's real field list (display name, mandatory flag, data type, dropdown options) instead of guessing field names. Always previews first and only submits with confirmed:true.

## Signature

```
selfEmployeeBenefitApllication
```

## Arguments

_None._


## Advanced arguments

- `benefitType` (string, optional) — The benefit type to apply for, exactly as the user names it (e.g. 'Data Reimbursement', 'Fuel Reimbursements'). Do not ask the user for a code - the tool resolves the name against the employee's own live benefit type list. Needed to actually apply, but call with it omitted (or when the user asks what benefit types exist) to get the real available list instead of guessing - never invent generic examples.
- `fieldValues` (object, optional) — Field values for the resolved benefitType, keyed by each field's exact displayName as returned by this tool's own discovery response (call this tool with benefitType set and fieldValues omitted first to get that list, with each field's mandatory flag, data type, and - for dropdown fields - its valid options). For a dropdown field, use the option's text (e.g. 'September'), never an internal code. Dates are 'DD/MM/YYYY' (e.g. '12/09/2026') - convert yourself. Needed to actually apply, but omit it to run discovery first.
- `comment` (string, optional) — The applicant's comment for this application. Only required for benefit types where the discovery response's commentMandatory is true - check that first rather than always asking. If showComment is false for the resolved benefit type, omit this entirely.
- `confirmed` (boolean, optional) — Set true only after the user has seen the preview this tool returns (benefit type, every field's resolved value, comment, and any confirmMessage from Beacon itself) and has explicitly agreed to submit. Omit or set false to preview without submitting - safe to call repeatedly while the user is still deciding.


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
