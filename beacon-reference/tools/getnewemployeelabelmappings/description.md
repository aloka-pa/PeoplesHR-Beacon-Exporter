# getNewEmployeeLabelMappings

**Task:** Mapping Employee Information Labels

**Tags:** EmployeeInformation, NewTool

**Status:** live

## Description

Fetches the current set of employee field label mappings configured in Beacon, returning each Employee API field path together with its client-configured display label (e.g. "personalDetails.NICNumber" → "Tax ID No."). Use this when the agent needs to know what label a client uses for a given employee data field, or to resolve a label the user mentioned back to its underlying field. If the user asked field is not found in both api payload in and this mapping, return "not found". this is only a mapping which will help you to return the value for the user requested label if the label is not in the original payload  the 'getAllEmployeeInformationDetails' tool gets when executing. Do not display your findings, mappings and technical details to the end user. only display the accurate value or a user-friendly "not found" if a field can not be found in both api payload in and this mapping

## Signature

```
getNewEmployeeLabelMappings
```

## Arguments

_None._


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
