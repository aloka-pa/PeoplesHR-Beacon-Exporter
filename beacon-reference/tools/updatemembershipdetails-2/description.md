# updateMemberShipDetails

**Task:** Fetching The Update MemberShip Details

**Tags:** EmployeeInformation, Headers

**Status:** live

## Description

in this tool generate the user update membership details. Before in this api call first execute the "getMembershipDetails" api. in this tool return the response all currency name and values, and user select update membership details. then next execute for in the tool for "updateMemberShipDetails" api, after execute final must and should execute for "updateEmployeeInformationDetails" api under entity check membership Details . to get the updateId means edit id for "getMembershipDetails" api with data is "membershipDetails" object details. and must should required "updateId". then after must be execute for "updateEmployeeInformationDetails" api.Note: no dependancy "getEmployeeInformationDetails" api. 

## Signature

```
updateMemberShipDetails
```

## Arguments

- `employeeNumber` (string, required) — to give the Unique identifier for the employee id or name.
- `updateId` (string, required) — to get update id for before api resposne to user select update name corresposnding update id will be take example 'ctl00$body$grdgrade$ctl00$ctl04$ctl01' to get update id for 'getMembershipDetails' tool.


## Advanced arguments

_None._


## Assigned agents

- Employee Information (`690dc571931a2d61ba0b1bf4`)
