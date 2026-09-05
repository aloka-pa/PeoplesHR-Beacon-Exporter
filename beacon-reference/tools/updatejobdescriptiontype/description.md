# updateJobDescriptionType

**Task:** Update Job Description Type

**Tags:** EIM, Headers

**Status:** live

## Description

To update the Job Description Type, first execute the getEIMAttributeList API. If any fields are missing in the user input, the corresponding data will be automatically retrieved from the API response. Additionally, if the user chooses to change the Job Description Category, display all available categories and let the user select one. The corresponding value of the selected category will then be used for the update.

## Signature

```
updateJobDescriptionType
```

## Arguments

- `jobDescriptionTypeName` (string, required) — to updated the Job Description Type Name
- `jobDescriptionCategory` (string, required) — to updated job Description Category display the all job Description Category then select one corresponding value will be take. data available for getJobDescriptionTypeDetails Api . Example:-"000001"


## Advanced arguments

_None._


## Assigned agents

- EIM Administration (`690dc571931a2d61ba0b1bc2`)
