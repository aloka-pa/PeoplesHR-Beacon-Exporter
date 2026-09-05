# getCashBenefit

**Tags:** EIM, Cash Benefits, DummyL

**Status:** live

## Description

Before calling this tool, please call "getSalaryGradeCode" with the salary grade name to get the salary grade code. This tool will be used to get a cash benefit assigned to a salary grade.  We will be able to get the available and allocated cash benefits, as well as the quantity. The user must provide the salary grade name.

## Signature

```
getCashBenefit
```

## Arguments

_None._


## Advanced arguments

- `salaryGradeName` (string, required) — The salary grade name
- `salaryGradeCode` (string, required) — Call 'getSalaryGradeCode' with the salary grade name to get the salary grade code.

