# subordinatesLeaveapplication

**Task:** Applying Leave for a Subordinate (Team Leave Management)

**Tags:** Absence Management, Headers, phase 3

**Status:** live

## Description

Applies leave for a direct subordinate (Team Leave Management, isDirectSubbordiante=1).

1. Ask which team member if not given; if the name matches more than one, list them and ask - never pick one.
2. Run dateFormat first and use that format for all dates.
3. Ask which leave type if not given - the tool lists types available to that employee with current balance.
4. Approver resolves automatically; asks only if the leave type allows choosing and more than one is available.
5. Covering employee is asked for only when the leave type requires one, checked first against recently-used ones.
6. Reason/comment are asked for only when the leave type requires them.
7. Leave types needing an attachment or custom fields are refused - use the web UI for those.
8. Shows computed days, balance, and leave clashes before confirming; call again with confirmed:true to submit.

Note: submit is adapted from the live employeeLeaveApplication tool, not captured on this screen. Per-day day-mode selection is unsupported.

## Signature

```
subordinatesLeaveapplication
```

## Arguments

_None._


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
