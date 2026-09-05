# getApplicationStructure

**Tags:** BenefitManagement

**Status:** unlive

## Description

This tool generates the employee benefit application structure. Before generating the structure, it first executes the "getBenefitApplicationTypesDetails" tool to retrieve all available benefit application types. These type names are displayed to the user, and upon selection, the corresponding name is used as the benCode argument for the next step.

## Signature

```
getApplicationStructure
```

## Arguments

- `benCode` (string, required) — The argument will be used to fetch the benefit type name corresponding to the benCode from the getBenefitApplicationTypesDetails API.
- `benefitName` (string, required) — The argument will be used to fetch the benefit type name from the getBenefitApplicationTypesDetails API.


## Advanced arguments

_None._


## Assigned agents

- BenefitManagement (`690dc571931a2d61ba0b1be9`)
