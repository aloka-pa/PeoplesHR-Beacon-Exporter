# getEducationalAndProfessionalQualificationsDetails

**Task:** Fetching Educational And Professional Qualifications Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

This tool generates educational and professional qualification details, including both qualification and training information. It should be triggered only when the user's query specifically pertains to these areas. If the user requests training details, only training-related information should be returned—qualification data must be excluded. If no relevant information is found, the tool should respond with the message: "There is no data available." Additionally, if the query involves self or admin related information, the system must first execute the "admin information" tool to retrieve the appropriate employee ID before proceeding. The tool returns both qualification and training details, based on the context of the user's request. then execute for "getEducationalAndProfessionalQualificationsDetails" tool. example self related query "get the training details listed for me".

## Signature

```
getEducationalAndProfessionalQualificationsDetails
```

## Arguments

- `id` (string, required) — to give the employee id Example:- "000001" etc...


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
