# updateSelfEmployeeEducationalAndQualificationDetails

**Task:** Update Self Employee Educational And Qualification Details

**Tags:** Employee Information, Headers

**Status:** live

## Description

Before updating Self Employee Educational and Qualification Details:
1.First, call the selfEmployeeEducationalAndQualificationDetails API to fetch the educational and qualification details and identify any missing any required fields. will using field corresponding value.
2.If some fields are not updated, note that Qualification Type and Qualification are hidden fields and cannot be modified. Only the following fields can be updated: School/Institute, Status, Year of Qualification, and Remarks.
Finally, update the employee’s educational and qualification details with the allowed fields.

## Signature

```
updateSelfEmployeeEducationalAndQualificationDetai
```

## Arguments

- `schoolOrInstitute` (string, required) — If the user updates the School/Institute field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained.
- `status` (string, required) — If the user updates the status field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained. Ex: Pass, Fail etc.. will be before status data only QualStatusDescription.
- `yearOfQualification` (string, required) — If the user updates the Year Of Qualification field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained.
- `remarks` (string, required) — If the user updates the Remarks field, the updated value will be used. If the user does not update it, the value from the previous API response will be retained. in the optional field
- `qualificationName` (string, required) — The Qualification Name field is not being updated. Which record will be updated in this case—will it use the Reference field as the required field for identifying the record Ex:-"Project Management Professional".


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
