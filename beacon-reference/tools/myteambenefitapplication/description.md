# myTeamBenefitApplication

**Task:** Apply for a Team Member's Benefit Application

**Tags:** Benefits, phase3

**Status:** live

## Description

Applies for a benefit on behalf of one of the signed-in supervisor's direct subordinates, through the Apply Benefit - Team screen. Call it as soon as the user names a team member, passing just that name: never ask for an employee number, and never ask anything else first. Call with the name omitted to list the team; anyone who is not a direct subordinate is refused. With the employee identified, call with benefitType omitted to get that employee's own available types - show only those, never types from general knowledge. Then call with fieldValues omitted to get that type's real fields (or rows, for types claimed as claim rows), their options, and the employee's entitlement, utilized and balance - ask only for those. The application date is always required: every figure is calculated for it. Always previews first, naming who it is for, and submits only with confirmed:true plus the previewDigest from that preview. Attachment-mandatory types are refused.

## Signature

```
myTeamBenefitApplication
```

## Arguments

_None._


## Advanced arguments

- `employeeNumber` (string, optional) — The team member's employee number, used ONLY when the user volunteers a number themselves. Never ask the user for an employee number, employee ID or staff number, and never look one up with another tool: a name alone is enough, because this tool resolves it against the supervisor's own subordinate list, which already carries every number. If the user gives a name, send employeeName and leave this out. Call with both omitted to get the subordinate list rather than guessing. Anyone who is not a direct subordinate is refused and the team list returned. For the signed-in employee's own benefit application, use selfEmployeeBenefitApllication instead.
- `employeeName` (string, optional) — The team member's name as the user said it - a first name alone (e.g. 'Liam') is fine and is the normal case. As soon as the user names someone, call this tool with that name: do not ask for their employee number, and do not ask any other question first. Never resolve the name with getGlobalEmployeeSearch or any other employee-lookup tool, because those search the whole company while this application may only ever be for one of this supervisor's own direct subordinates. This tool matches the name against that subordinate list itself and, once matched, has everything it needs to identify the employee. If several subordinates match, it returns just those candidates - show the user only those and ask which one, never a wider list of people with that name.
- `benefitType` (string, optional) — The benefit type to apply for, named as the user says it (e.g. 'Medical Claims'). Never ask the user to name a benefit type before you have called this tool, and NEVER offer types from your own knowledge (Health Insurance, Life Insurance, Cash Benefit and the like are not real options here) - the types differ per employee and per company. When the user has not named one, call this tool with benefitType omitted and it returns that employee's own live availableBenefitTypes; show the user exactly that list and ask which one. If the name they give is not on it, or matches more than one, the tool returns the candidates to choose from. Never ask for a code.
- `fieldValues` (object, optional) — For benefit types built from plain fields: the values, keyed by each field's exact displayName from this tool's own discovery response. Call with benefitType set and fieldValues omitted first to get that list with each field's mandatory flag, input type and options, then ask the user only for those fields. Never ask for fields you have imagined (benefit plan, policy number and so on): they differ per benefit type and per employee, and only the discovery response is real. The application date is always required even when it says not-mandatory, because entitlement, utilized amount and the total are all calculated for that date - ask which date rather than assuming today. Entitlement figures belong to the date they were fetched for and to no other: to answer 'what is the entitlement on 2 September', or whenever the user names or changes the date, call this tool again with fieldValues containing just that application date and report the figures it returns. Never carry an entitlement figure across from an earlier date, and never state one without a tool call behind it. Use a dropdown option's text, never a code; dates in the format the discovery response states; amounts as plain numbers; yes/no fields as 'yes' or 'no'. 'Total Request' is the amount Benefit History records; PeoplesHR calculates it from the amount field(s), so leave it out unless the supervisor explicitly wants a different total. Entitlement, Utilized Amount and Balance are never inputs.
- `rows` (array, optional) — For benefit types claimed as rows (the discovery response sets rowsRequired and lists gridColumns instead of fields): one object per claim row, each keyed by the exact column displayName from that response. Ask the user for one row per claim - e.g. one per bill - and never invent columns. Read-only columns (Department, Entitlement, Utilized Amount and the like) are filled in by PeoplesHR and must not be sent. Each row is validated by PeoplesHR as it is added, and a rejected row stops the application with the reason given.
- `comment` (string, optional) — The applicant comment for this application. Only required when the discovery response's commentMandatory is true - check that rather than always asking. If showComment is false for the resolved benefit type, omit this entirely.
- `confirmed` (boolean, optional) — Set true only after the supervisor has seen the preview this tool returns (the employee it is for, benefit type, every resolved value, entitlement/utilized/balance, the Total Request amount, any balanceWarning, the comment, and any confirmMessage from PeoplesHR) and has explicitly agreed to submit on that employee's behalf. Must be sent together with previewDigest. Omit or set false to preview without submitting - safe to call repeatedly while they are still deciding.
- `previewDigest` (string, optional) — The previewDigest value from the preview response the supervisor actually saw, copied verbatim and sent alongside confirmed:true. It binds the confirmation to those exact figures: if the employee's entitlement or utilized amount has moved since, the tool returns a fresh preview instead of submitting. Never invent or reuse an older value - always copy the one from the most recent preview response.


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
