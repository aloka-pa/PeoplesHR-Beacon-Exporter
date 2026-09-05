# nextQualificationTypes

**Task:** Fetching The Next Qualification Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

Before calling this API, ensure the 'qualificationTypesandQualification' API is executed first. The values for 'qualificationEffectStartDate' and 'qualificationEffectEndDate' must be derived exclusively from the corresponding qualification data. If qualification data is not available, these fields should remain unfilled. Do not use reimbursement effective dates as substitutes, and AI must not auto-fill the qualification effect dates under any circumstances. and if the user update will be take for user update date.

## Signature

```
nextQualificationTypes
```

## Arguments

_None._


## Advanced arguments

- `employeeNumber` (string, required) — Unique identifier for the employee.
- `qualificationTypeId` (string, required) — ID for the selected qualification type. Fetched from a displayed list based on the 'qualificationTypesandQualification' tool.
- `qualificationId` (string, required) — ID for the selected qualification. Derived from user selection after loading data using the 'qualificationTypesandQualification' API.
- `qualificationEffectStartDate` (string, required) — 'qualificationEffectStartDate' The qualification effect start date must strictly follow the 'm/d/YYYY' format and should be captured before calling the final API. the 'qualificationEffectStartDate' should be used. Additionally, the AI must not generate any random dates during this process.
- `qualificationEffectEndDate` (string, required) — 'qualificationEffectEndDate' The qualification effect end date must strictly follow the 'm/d/YYYY' format and should be captured before calling the final API. the 'qualificationEffectEndDate' should be used. Additionally, the AI must not generate any random dates during this process.
- `institutionName` (string, required) — Name of the school or institute where the qualification was obtained.
- `highestQualification` (string, required) — in this highest Qualification to before api for 'qualificationTypesandQualification' api.
- `qualificationStatus` (string, required) — Status of the qualification (e.g., 0: Pass, 1: First Class, 2: Second Class, etc.).
- `jobRelated` (string, required) — Indicates whether the qualification is job-related (0 = No, 1 = Yes).to get before api respsone.
- `durationValue` (string, required) — Numeric duration of the qualification if the user given duration number must should following example format for example 5 you will be take for 5.00.(e.g., 3.00).
- `durationType` (string, required) — Type of duration (Years, Months, Weeks, Days, Hours).
- `yearOfPassing` (string, optional) — Year in which the qualification was completed (e.g., 2023). in this year of passing to get for 'qualificationTypesandQualification' api.
- `comments` (string, optional) — Additional comments about the qualification, if any.
- `totalCost` (string, optional) — Total cost associated with obtaining the qualification. Retrieved from the 'qualificationTypesandQualification' API.
- `currencyForTotalCost` (string, optional) — Currency code for the total cost. Selected from a list of currencies retrieved using the 'qualificationTypesandQualification' API.
- `CostEffectDate` (string, required) — 'totalCostEffectiveDate' Effective date of the total cost in m/d/YYYY must should followin in this date m/d/YYYY format.
- `reimbursedAmount` (string, optional) — Amount reimbursed by the company. Retrieved from the 'qualificationTypesandQualification' API.
- `currencyForReimbursement` (string, optional) — Currency code for the reimbursed amount. Selected from a list of currencies using the 'qualificationTypesandQualification' API.
- `reimbursementEffectDate` (string, required) — 'reimbursedEffectiveDate' Effective date of the reimbursement in m/d/YYYY must should followin in this date m/d/YYYY format.


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
