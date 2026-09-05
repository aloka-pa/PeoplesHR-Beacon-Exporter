# createBenefitClearanceHeadInformation

**Task:** Creating New Benefit Clearance Head Position Record

**Tags:** EIMAdmin, BenefitInformation, phase2

**Status:** live

## Description

Create a new Benefit Clearance Head position and assign an employee to it. Both position name and employee ID are required fields.

## Signature

```
createBenefitClearanceHeadInformation
```

## Arguments

- `positionName` (string, required) — The name of the new Benefit Clearance Head position to create (e.g., 'IT Operations Lead', 'Finance Manager', 'HR Coordinator').
- `employeeId` (string, required) — The employee ID to assign to this position (e.g., '000001', '00000006'). The system will search for this employee and assign them to the new position.
- `createWorkflowApproval` (string, required) — Whether to enable workflow approval for this position. Use 'true' to enable or 'false' to disable. Defaults to false if not provided.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
