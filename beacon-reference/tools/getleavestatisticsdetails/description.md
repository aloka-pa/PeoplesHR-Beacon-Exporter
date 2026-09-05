# getLeaveStatisticsDetails

**Task:** Fetching Leave Statistics Details

**Tags:** Absence Management, Headers

**Status:** live

## Description

to generate the Leave Statistics chat Example Bar chat.Before execute in this api first execute "employeeLogKey" api then execute in this api. in this tool only generate the leave Statistics. if the user ask more then one employee first execute the first employee  get response after execute second employee get response and display. if there no employee data do not give the graph chats. and if the user ask multiple user or years or months etc you fetching first then after execute following order execute one by one and A bar chart must be returned for every user query. However, if there is no data available for a particular employee or year, no chart should be displayed—instead, a message stating "No data available" should be returned. Before execute in this api first execute  "employeeDetails" tool get the data then after execute  "employeeLogKey" api then execute in this api. 

## Signature

```
getLeaveStatisticsDetails
```

## Arguments

- `year` (string, required) — to give the Leave Statistics year.


## Advanced arguments

_None._


## Assigned agents

- AbsenceManagement (`690dc571931a2d61ba0b1be3`)
