# getCashBenefitAssignToSalaryGradeDetails

**Task:** CashBenefitAssign To SalaryGradeDetails

**Tags:** EIM, Headers

**Status:** live

## Description

To generate Cash Benefit Assignment details for a Salary Grade, first fetch available salary grades using the "gradeDetails" API. Display all the grades and, upon user selection, use the corresponding value as salaryGradeCode. If the user query relates to assigning cash benefits to a salary grade, check whether a valid salary grade code is provided. If a valid code is given, return the related information; otherwise, indicate that the specified salary grade is not available.dont display the edit Id and identifier only using that edit id user update refer to use.

## Signature

```
getCashBenefitAssignToSalaryGradeDetails
```

## Arguments

- `salaryGradeCode` (string, required) — to get the salaryGradeCode for gradeDetails api corresponding value will be take.


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
