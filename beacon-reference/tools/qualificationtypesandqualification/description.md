# qualificationTypesandQualification

**Task:** Fetching Qualification Type Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

Before calling this API, first execute the 'getEducationalAndProfessionalQualificationsDetails' API, check qualification types in data records then update qualification for user update qualification details . to retrieve the existing data. Once the data is available, the user should select a qualification type, and the corresponding value should be identified using the selected ID—for example, in the format 'ctl00$body$grdQualification$ctl00$ctl08$ctl00'. if the user update for "Qualification type" field is update must be calling for "nextQualificationTypes" api.execute. other fields update then after skip for "nextQualificationTypes" api. directly execute for "updateEmployeeInformationDetails" api is execute.

## Signature

```
qualificationTypesandQualification
```

## Arguments

_None._


## Advanced arguments

- `postbackId` (string, optional) — The PostBack identifier required for editing a specific qualification record. This is retrieved from the 'getEducationalAndProfessionalQualificationsDetails' API and is used when updating existing data. to get for 'Edit Postback ID' for 'getEducationalAndProfessionalQualificationsDetails' tool if the user ask related qualification type related to get the edit postback id.
- `employeeNumber` (string, required) — Unique identifier for the employee.
- `qualificationTypeId` (string, required) — The ID representing the selected Qualification Type (e.g., Postgraduate Degree). This value is derived from user selection after displaying the available types from 'getEducationalAndProfessionalQualificationsDetails'. The user is not asked to provide this ID directly.
- `qualificationId` (string, required) — The specific ID of the selected qualification (e.g., MBA, BSc). This is selected by the user from the options shown, which are fetched after the Qualification Type is selected. The user is not expected to know or input the ID directly.
- `qualificationEffectStartDate` (string, required) — 'qualificationEffectStartDate' The qualification effect start date must strictly follow the 'm/d/YYYY' format and should be captured before calling the final API. the 'getEducationalAndProfessionalQualificationsDetails' should be used. Additionally, the AI must not generate any random dates during this process.
- `qualificationEffectEndDate` (string, required) — 'qualificationEffectEndDate' The qualification effect end date must strictly follow the 'm/d/YYYY' format and should be captured before calling the final API. the 'getEducationalAndProfessionalQualificationsDetails' should be used. Additionally, the AI must not generate any random dates during this process.
- `institutionName` (string, required) — Name of the school or institution from which the qualification was obtained.
- `qualificationStatus` (string, required) — Status of the qualification. Options are sourced from 'getEducationalAndProfessionalQualificationsDetails' and may include: 0: Pass, 1: First Class, 2: Second Class, etc.
- `jobRelated` (string, optional) — Indicates whether the qualification is job-related. Values: 0 = No, 1 = Yes. Options are provided via 'getEducationalAndProfessionalQualificationsDetails'.
- `durationValue` (string, optional) — Numeric value representing the duration of the qualification (e.g., 4.00).
- `durationType` (string, required) — Type of duration. Values include: 000001 = Years, 000002 = Months, 000003 = Weeks, 000004 = Days, 000005 = Hours. These options are fetched from 'getEducationalAndProfessionalQualificationsDetails'.
- `yearOfPassing` (string, required) — Year in which the qualification was obtained (e.g., 2023).
- `comments` (string, optional) — Any additional comments or notes regarding the qualification.
- `totalCost` (string, optional) — Total cost incurred for completing the qualification. dont take dynamic amount
- `currencyForTotalCost` (string, optional) — Currency code for the total cost. The list of currencies is shown to the user, and the corresponding selected value is used. These values are fetched from 'getEducationalAndProfessionalQualificationsDetails'. dont take dynamic currency you get before api data get.
- `CostEffectDate` (string, optional) — The start date of the qualification (format: YYYY-MM-DD).dont take dynamic effect data you get before api data get.
- `reimbursedAmount` (string, optional) — The amount reimbursed for the qualification, if applicable.dont take dynamic reimbursed Amount you get before api data get.
- `currencyForReimbursement` (string, optional) — Currency code for the reimbursed amount. Users select from a displayed list of currencies, and the selected code is used. Data sourced from 'getEducationalAndProfessionalQualificationsDetails'.dont take dynamic reimbursed currency, you get before api data get.
- `reimbursementEffectDate` (string, optional) — The end date of the qualification (format: YYYY-MM-DD). dont take dynamic effect data you get before api data get.


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
