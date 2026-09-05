# editQualificationProperty

**Task:** Editing Qualification Property Details

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Updates a qualification property record. Searches for a qualification property by code or property name, opens the record, enters edit mode, and saves the updated values. All fields (property name, qualification, and data type) are optional - only provided fields will be updated.

The user must provide either code OR propertyName to identify the record.
The user must provide at least one update field (newPropertyName, qualificationCode, qualificationName, or dataType).
For qualification, the user can use either qualificationCode or qualificationName (not both)

## Signature

```
editQualificationProperty
```

## Arguments

- `propertyCode` (string, optional) — The unique qualification property code to identify which record to update (e.g., "000003")
- `propertyName` (string, optional) — The unique qualification property code to identify which record to update (e.g., "000003")
- `newPropertyName` (string, optional) — The new name for the qualification property (e.g., "Year - 2018/2019")
- `qualificationCode` (string, optional) — The qualification code (6-digit, e.g., "000003") or qualification name (e.g., "Junior Prefect") to associate with this property
- `qualificationName` (string, optional) — The qualification name to associate with this property (e.g., "G C E Ordinary Level Examination 2019")
- `dataType` (string, optional) — The data type for this property. Must be one of: "String", "Numeric", "Boolean", "Date"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
