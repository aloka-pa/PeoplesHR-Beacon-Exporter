# updateOrChangeSupervisorDetails

**Task:** Modify The Supervisor Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

In this tool, supervisors can be updated or reassigned for both direct and indirect subordinates. Before running this tool, you must first execute the getChangeSupervisorDetails function. This function fetches the list of employees for whom the user has selected supervisor changes.From the returned result, extract the index values of the selected employees. These index values should be converted into a list of strings (e.g., "0", "1", "5") and passed as a string array to the tool's empList argument.Based on these index values, the tool will display the corresponding employees under both the direct and indirect subordinates sections.Next, to update the supervisor, This tool should not use any values selected for director indirect subordinates. Instead, prompt the user to provide the supervisorEmpId manually. Once provided,use it as an argument execute "getCoveringEmployee" tool to retrieve the employeeDesignation. user give supervisorEmpId then execute for "getCoveringEmployee" tool.

## Signature

```
updateOrChangeSupervisorDetails
```

## Arguments

- `empList` (string, required) — to get the user select employee index list example "1", "2", "5", ...
- `supervisorEmpId` (string, required) — to give the employee supervisor id Example "000001".
- `employeeDesignation` (string, required) — to get proposed Supervisor Designation to for "getCoveringEmployee" to get employee id Example "Head of Human Resources"
- `supervisorType` (string, required) — to ask the user supervisor type such as if the user select direct supervisor return "Direct" else if the user select indirect supervisor return "Indirect".


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
