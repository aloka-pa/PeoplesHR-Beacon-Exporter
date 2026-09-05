# createQualificationProperty

**Task:** Creating New Qualification Property Record

**Tags:** EIMAdmin, QualificationInformation

**Status:** live

## Description

Creates a new qualification property record. Clicks the New button to open a blank form, fills in the property name, selects a qualification, and chooses a data type, then saves the record. The system auto-generates the property code.
The user must provide either qualificationCode OR qualificationName (not both).
All three fields (propertyName, qualification, dataType) are required for creation.
Available data types will be shown in error messages if validation fails.

## Signature

```
createQualificationProperty
```

## Arguments

- `propertyName` (string, required) — The name for the new qualification property (e.g., "Completed date - 2023 Dec", "Grade Level")
- `qualificationCode` (string, optional) — The qualification code (6-digit, e.g., "000009") or qualification name (e.g., "MSc in Data Science") to associate with this property
- `qualificationName` (string, optional) — The qualification name to associate with this property (e.g., "G C E Ordinary Level Examination 2019")
- `dataType` (string, required) — The data type for this property. Must be one of: "String", "Numeric", "Boolean", "Date"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
