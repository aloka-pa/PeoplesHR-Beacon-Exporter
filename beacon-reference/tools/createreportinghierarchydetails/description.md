# createReportingHierarchyDetails

**Task:** Add The Direct and Indirect Subordinates

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

If the user's query is to create Reporting Hierarchy Details or involves direct or indirect subordinate-related information, the process should begin by executing the "bulkEmployeeSelectDetails" tool to select the relevant employees. This ensures that only the intended employees are included in the hierarchy setup. Once the employee selection is complete, proceed with the "createReportingHierarchyDetails" tool to establish the reporting structure. Before creating the hierarchy, prompt the user to specify the type of reporting hierarchy they wish to create—Direct or Indirect Subordinates—to ensure accurate configuration. Subordinates types "Indirect Subordinates" and "Direct Subordinates".

## Signature

```
createReportingHierarchyDetails
```

## Arguments

- `id` (string, required) — to give user employee id example '000001'
- `type` (string, required) — To determine the type of subordinates, there are two options: "Indirect Subordinates" and "Direct Subordinates".


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
