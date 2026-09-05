# employeeLeaveApplication

**Task:** Save Leave Application

**Tags:** Absence Management, Headers, BugFix

**Status:** live

## Description

To generate the leave approver's details, follow this exact sequence. First, execute EmployeeDetails to retrieve basic employee information. Then execute EmployeeLogKey to obtain the employee's login key. Next, execute GetEmployeeLeaveBalance to fetch available leave balances.
When the user selects a leave type (e.g., "Annual Leave"), internally retrieve the corresponding leaveTypeCode and leaveGroupCode — never ask the user to input or view any codes. Then execute this tool to fetch the approver's details.
After identifying the leave type, check IsCommentMandatory from the selected leave type response: if 1, a comment is required and submission must not proceed without it; if 0, don't mention as comment required. This rule may vary by client and leave type, so never hardcode it.
If the user specifies a covering employee, allow search by name or code and use getEmpDetails to resolve the coveringEmployeeCode.
Never display group codes, leave type codes, or employee keys to the user.

## Signature

```
employeeLeaveApplication
```

## Arguments

_None._


## Advanced arguments

- `leaveTypeCode` (string, required) — To get the leave type code, use 'getEmployeeLeaveBalance' API. User provides leave type name and corresponding leave type code will be retrieved. Example: '000001'. Do not ask the user for leave type code directly.
- `leaveGroupCode` (string, required) — To get the leave group code, use 'getEmployeeLeaveBalance' API. Example: '000001'. Do not ask the user for group code directly.
- `fromDate` (string, required) — must be calling dateFormat api response format using,User provides the leave start date. Example: '08-10-2025'.
- `toDate` (string, required) — must be calling dateFormat api response format using,User provides the leave end date. Example: '12-10-2025'.
- `comment` (string, optional) — Do not ask for comment upfront.Submit first.If SaveLeaveApplication API returns 'Please specify the Comment',then ask the user for comment and retry.
- `coveringEmployeeCode` (string, optional) — Optional field, call 'getEmpDetails' tool to get the empNumber. Do not take the employeeDisplayNumber. Important only take the empNumber.
- `year` (integer, required) — User provides the year. Example: 2025, 2024, etc.
- `attachment` (object, optional) — Required for leave types where attachment is mandatory. The AI should prompt the user to upload a file before submitting. Contains the uploaded file's base64 data and filename.
- `isAttachmentMandatory` (boolean, optional) — Set to true when the leave type requires a mandatory attachment (e.g., medical leave). When true, prompt the user to upload a file before proceeding. Do not submit without attachment if this is true.
- `dayModes` (array, required) — Array containing each individual leave date and its corresponding day mode. Based on the from and to date range, the system will generate all dates in between and ask the user to specify the day mode for each date. For example, if user applies for 3-day leave, there will be 3 items in this array - each with a specific date and its day mode selection.


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
