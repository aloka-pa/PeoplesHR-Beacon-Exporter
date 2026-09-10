# selfEmployeeParticipationConfirmation

**Task:** Confirming or Rejecting a Pending Training Participation Confirmation

**Tags:** T&D, Aloka, phase3

**Status:** live

## Description

Lets the logged-in employee confirm (approve) or reject a pending training participation confirmation. 
Always call getSelfEmployeeParticipationConfirmation first if the scheduleId is not already known - this tool re-resolves the full record itself (by scheduleId or by courseName), it does not accept raw record data as arguments. 
Confirming moves the training into the employee's confirmed trainings, visible afterwards via getSelfEmployeeConfirmedTrainings. 
A rejected training cannot be reviewed anywhere afterwards - not on the PeoplesHR screen, and not through this assistant. 
This is a write tool - it submits a real confirmation or rejection on success. expectedLearning is required only when confirming; rejecting needs no fields beyond identifying the schedule and decision. remarks is always optional.

## Signature

```
selfEmployeeParticipationConfirmation
```

## Arguments

_None._


## Advanced arguments

- `scheduleId` (string, optional) — The schedule ID of the pending participation confirmation to act on, when already known (e.g. carried over from getSelfEmployeeParticipationConfirmation, or from a prior AMBIGUOUS response from this same tool). Either scheduleId or courseName must be provided - prefer courseName when the employee only named a course, since this tool resolves the schedule itself.
- `courseName` (string, optional) — The course name (or partial name) the employee mentioned, e.g. 'Database & Data Management'. Matches case-insensitively against the employee's own pending participation confirmations - do not resolve this to a scheduleId yourself first; pass the course name directly and let this tool resolve it. Either scheduleId or courseName must be provided. If more than one pending confirmation matches, the tool returns status AMBIGUOUS with a list of candidates (each with its own scheduleId) - ask the employee to pick one and retry with scheduleId.
- `decision` (string, required) — "confirm" to approve/confirm participation - this is the action that moves the training into the employee's confirmed trainings (visible afterwards via getSelfEmployeeConfirmedTrainings) - or "reject" to decline it. "Confirm" and "approve" mean the same action here; if the user says either word, pass decision: "confirm".
- `expectedLearning` (string, optional) — What the employee expects to learn from this training. Required ONLY when decision is "confirm" - the training system itself rejects a confirm submission without it (confirmed live: it returns 'Please specify expected learnings.' when blank). NOT required when decision is "reject" - confirmed live (2026-09-09, direct UI test) that a rejection goes through with this left completely blank, with no prompt for it at all. Do not ask the employee for this when they are rejecting - only collect it upfront when they are confirming.
- `remarks` (string, optional) — Optional remarks about this confirmation/rejection. Confirmed live: a real, successful confirmation was submitted with this left blank, so do not require it - only include if the user actually gave one.


## Assigned agents

- Training and Development (`6955261cad06de92910e10aa`)
