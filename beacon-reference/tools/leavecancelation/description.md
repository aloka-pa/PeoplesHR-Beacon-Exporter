# leaveCancelation

**Task:** Delete The Leave

**Tags:** Absent Management, Headers

**Status:** live

## Description

"Before initiating a leave cancellation request, follow these steps: First, call the \"employeeDetails\" API to get employee info. Then, call \"employeeLogKey\" to fetch the log key. Next, use \"getViewLeaveHistoryDetails\" to get leave history. The cancellation must match only on the leave \"applied date\", not from/to dates. If the user provides an applied date, call the \"dateFormat\" API to convert it to the system format. Use this formatted date to filter leave records. If multiple entries match, show all and prompt the user to select one. Return the selected record’s \"leaveAppliedId\". If only one record matches, return its \"leaveAppliedId\" directly. If no records match, inform the user that no leave application exists for that date. and do not ask for user leave applied Id only ask leave applied date corresponding applied id will be take."


## Signature

```
leaveCancelation
```

## Arguments

- `year` (integer, required) — to give the leave cancel year
- `leaveCancelDate` (string, required) — to give the leave cancel Date using in this format date example "06/24/2025" format "dd/mm/yyyy".
- `comment` (string, required) — reason or comment for leave cancel
- `id` (string, required) — to give the employee id
- `leaveAppliedId` (integer, required) — dont user ask for leave id to get user given date or user date corresponding leave applied Id to get example "82.0","71.0" etc..


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
