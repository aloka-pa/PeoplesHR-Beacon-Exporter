# editBenefitClearanceHeadInformation

**Task:** Editing Benefit Clearance Head Position Details

**Tags:** EIMAdmin, BenefitsInformation, phase2

**Status:** live

## Description

Edit a Benefit Clearance Head position by changing the position name, assigning a new employee by their ID, or enabling/disabling workflow approval. The transformer handles employee search and assignment automatically.

## Signature

```
editBenefitClearanceHeadInformation
```

## Arguments

- `positionName` (string, optional) — The name of the Benefit Clearance Head position to edit (e.g., 'Admin Officer', 'Finance Head'). If not provided, the transformer will list all available positions for the user to choose from.
- `employeeId` (string, optional) — The employee ID to assign to this position (e.g., '000001', '000010'). The system will search for this employee ID and validate if the employee exists and is active.
- `newPositionName` (string, optional) — The new name for the position if you want to rename it. If not provided, the position name stays the same.
- `createWorkflowApproval` (string, optional) — Whether to enable workflow approval for this position. Use 'true' to enable or 'false' to disable. If not provided, the checkbox remains unchanged.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
