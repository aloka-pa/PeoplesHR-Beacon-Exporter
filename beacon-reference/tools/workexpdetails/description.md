# workExpDetails

**Task:** Fetching The Employee Working Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

Before executing this tool, the "getWorkExperienceDetails" tool must be run first to retrieve the list of available work experience entries along with their corresponding editIds. Once the details are displayed, the user selects the work experience entry they want to edit. The editId for the selected entry is then used as input to this tool to generate and update the specific work experience details. then after calling for "updateEmployeeInformationDetails" api.

## Signature

```
workExpDetails
```

## Arguments

_None._


## Advanced arguments

- `editId` (string, required) — The edit ID corresponding to the selected work experience. For example: 'ctl00$body$grdGrade1$ctl00$ctl05$ctl00'. This is determined by the backend and not provided by the user. and you get edit id for 'getWorkExperienceDetails' api
- `empId` (string, required) — The employee ID provided by the user.
- `fromDate` (string, required) — to get date for before api date corresponding from data will be take. in this format 'dd/mm/yyyy'
- `endDate` (string, required) — to get date for before api date corresponding end data will be take. 'dd/mm/yyyy'


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
